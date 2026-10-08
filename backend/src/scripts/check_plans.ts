import { prisma } from '../config/database';
async function main() {
  const plans = await prisma.listingPlan.findMany();
  console.log('Plans:', plans);
}
main().finally(() => prisma.$disconnect());
