import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'bhagirathkumar.bk8239@gmail.com' },
    update: {},
    create: {
      name: 'Bhagirath Kumar',
      email: 'bhagirathkumar.bk8239@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@minierp.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'sales@minierp.com' },
    update: {},
    create: {
      name: 'Sales User',
      email: 'sales@minierp.com',
      password: salesPassword,
      role: 'SALES',
    },
  });

  console.log('Users created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
