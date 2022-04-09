import { prisma } from '~/db';
import bcrypt from 'bcrypt';

class AuthenticationError extends Error {}

export const login = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: username,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthenticationError();
  }

  return user.id;
};
