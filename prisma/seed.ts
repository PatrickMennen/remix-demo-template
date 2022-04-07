import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seed = async () => {
  const password = await bcrypt.hash('salamander', 10);

  console.log('pw', password);

  await prisma.user.upsert({
    where: {
      email: 'user@example.com'
    },
    create: {
      email: 'admin@example.com',
      password
    },
    update: {}
  });
}

seed();
