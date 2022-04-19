import { prisma } from '~/db';
import { z } from 'zod';
import type { Session } from '@remix-run/node';
import aes from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

export class AccessDeniedError extends Error {}

export const listCategoriesForUser = async (userId: string) =>
  prisma.category.findMany({
    where: {
      userId,
    },
  });

export const createCategory = async (userId: string, name: string) =>
  prisma.category.create({
    data: {
      name,
      userId,
    },
  });

const checkCategoryAccessForUser = async (userId: string, categoryId: string) => {
  const count = await prisma.category.count({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (count === 0) {
    throw new AccessDeniedError(`${userId} does not have access to ${categoryId}.`);
  }
};

export const updateCategory = async (id: string, userId: string, newName: string) => {
  await checkCategoryAccessForUser(userId, id);

  return prisma.category.update({
    where: {
      id,
    },
    data: {
      name: newName,
    },
  });
};

export const getCategoryDetails = async (userId: string, id: string) =>
  prisma.category.findFirst({
    where: {
      id,
      userId,
    },
  });

export const deleteCategory = async (userId: string, categoryId: string) => {
  await checkCategoryAccessForUser(userId, categoryId);

  console.log(categoryId, userId);

  return prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const getPasswordsForCategory = async (
  userId: string,
  categoryId: string,
  session: Session,
) => {
  await checkCategoryAccessForUser(userId, categoryId);

  const passwords = await prisma.password.findMany({
    where: {
      categoryId,
      userId,
    },
    include: {
      uris: true,
    },
  });

  const kek = session.get('kek');

  return passwords.map((p) => ({
    ...p,
    username: aes.decrypt(p.username, kek).toString(CryptoJS.enc.Utf8),
    password: aes.decrypt(p.password, kek).toString(CryptoJS.enc.Utf8),
  }));
};

export const passwordEntryValidator = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  uris: z
    .string()
    .url('The url you entered is invalid.')
    .array()
    .min(1, 'Please provide at least one URI'),
});

type PasswordEntry = z.infer<typeof passwordEntryValidator>;

const encryptUsernameAndPassword = (username: string, password: string, session: Session) => {
  const kek = session.get('kek');
  const encryptedUsername = aes.encrypt(username, kek).toString();
  const encryptedPassword = aes.encrypt(password, kek).toString();

  return {
    encryptedPassword,
    encryptedUsername,
  };
};

export const addPasswordToCategory = async (
  userId: string,
  categoryId: string,
  entry: PasswordEntry,
  session: Session,
) => {
  await checkCategoryAccessForUser(userId, categoryId);

  const { encryptedPassword, encryptedUsername } = encryptUsernameAndPassword(
    entry.username,
    entry.password,
    session,
  );

  return prisma.password.create({
    data: {
      userId,
      categoryId,
      name: entry.name,
      password: encryptedPassword,
      username: encryptedUsername,
      uris: {
        create: entry.uris.map((uri) => ({ uri })),
      },
    },
  });
};

const userHasAccessToPassword = async (userId: string, passwordId: string) => {
  const count = await prisma.password.count({
    where: {
      userId,
      id: passwordId,
    },
  });

  if (count === 0) {
    throw new AccessDeniedError();
  }
};

export const editPassword = async (
  userId: string,
  passwordId: string,
  fields: PasswordEntry,
  session: Session,
) => {
  await userHasAccessToPassword(userId, passwordId);

  const { encryptedPassword, encryptedUsername } = encryptUsernameAndPassword(
    fields.username,
    fields.password,
    session,
  );

  // Run as a transaction, if either action fails, rollback
  return prisma.$transaction([
    prisma.uri.deleteMany({
      where: {
        passwordId,
      },
    }),

    prisma.password.update({
      where: {
        id: passwordId,
      },
      data: {
        name: fields.name,
        username: encryptedUsername,
        password: encryptedPassword,
        uris: { create: fields.uris.map((uri) => ({ uri })) },
      },
    }),
  ]);
};

export const deletePassword = async (userId: string, passwordId: string) => {
  await userHasAccessToPassword(userId, passwordId);

  return prisma.password.delete({ where: { id: passwordId } });
};
