import { prisma } from '~/db';
import { z } from 'zod';
import { Session } from '@remix-run/node';
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

export const deleteCategory = async (userId: string, id: string) => {
  await checkCategoryAccessForUser(userId, id);

  return prisma.category.delete({
    where: {
      id,
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

export const addPasswordToCategory = async (
  userId: string,
  categoryId: string,
  entry: PasswordEntry,
  session: Session,
) => {
  await checkCategoryAccessForUser(userId, categoryId);

  const kek = session.get('kek');

  const encryptedUsername = aes.encrypt(entry.username, kek).toString();
  const encryptedPassword = aes.encrypt(entry.password, kek).toString();

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
