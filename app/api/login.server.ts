import { prisma } from '~/db';
import bcrypt from 'bcrypt';
import type { Session } from '@remix-run/node';
import sha256 from 'crypto-js/sha256';

class AuthenticationError extends Error {}

const SUPER_SECRET_CIPHER =
  'this is only exposed on the backend and used to create a more unique cipher';

export const login = async (username: string, password: string, session: Session) => {
  const user = await prisma.user.findUnique({
    where: {
      email: username,
    },
  });

  if (!user) {
    throw new AuthenticationError();
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new AuthenticationError();
  }

  session.set('kek', sha256(`${user.password}${SUPER_SECRET_CIPHER}`).toString());
  session.set('userId', user.id);

  return user.id;
};

export const registerUser = async (username: string, password: string) => {
  const encryptedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email: username,
      password: encryptedPassword,
    },
  });
};
