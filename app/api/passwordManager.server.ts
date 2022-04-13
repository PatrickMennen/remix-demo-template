import { prisma } from '~/db';

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
