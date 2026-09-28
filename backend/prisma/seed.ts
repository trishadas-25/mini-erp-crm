import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      email: 'admin@minierp.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@minierp.com' },
    update: {},
    create: {
      email: 'sales@minierp.com',
      name: 'Sales User',
      password: salesPassword,
      role: 'SALES',
    },
  });

  console.log({ admin, sales });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
