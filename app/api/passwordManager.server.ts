import { prisma } from '~/db';
import { async } from 'rxjs';
import { z } from 'zod';

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

export const getPasswordsForCategory = async (userId: string, categoryId: string) => {
  await checkCategoryAccessForUser(userId, categoryId);

  return prisma.password.findMany({
    where: {
      categoryId,
      userId,
    },
  });
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
  passwordEntry: PasswordEntry,
) => {
  await checkCategoryAccessForUser(userId, categoryId);

  return prisma.password.create({
    data: {
      userId,
      categoryId,
      password: passwordEntry.password,
      username: passwordEntry.username,
    },
  });
};
