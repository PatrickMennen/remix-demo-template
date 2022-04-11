import { prisma } from '~/db';
import { Category } from '@prisma/client';

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

export const updateCategory = async (id: string, userId: string, newName: string) =>
  prisma.category.update({
    where: {
      id_userId: {
        userId,
        id,
      },
    },
    data: {
      name: newName,
    },
  });

export const getCategoryDetails = async (userId: string, id: string) =>
  prisma.category.findUnique({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });

export const deleteCategory = async (userId: string, id: string) =>
  prisma.category.delete({
    where: {
      id_userId: {
        userId,
        id,
      },
    },
  });
