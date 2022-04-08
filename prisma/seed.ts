import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seed = async () => {
  const password = await bcrypt.hash('salamander', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@example.com'
    },
    create: {
      email: 'admin@example.com',
      password
    },
    update: {}
  });
}

seed();
