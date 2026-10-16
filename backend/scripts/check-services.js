const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.homeService.count();
  const services = await prisma.homeService.findMany();
  console.log('Total Home Services:', count);
  console.log('Services:', services);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
