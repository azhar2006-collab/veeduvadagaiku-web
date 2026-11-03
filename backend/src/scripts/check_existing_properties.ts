import { prisma } from '../config/database';

async function main() {
  const properties = await prisma.property.findMany({
    select: { id: true, title: true, status: true, planId: true, expiresAt: true, createdAt: true },
  });
  console.log(`Found ${properties.length} properties:`);
  for (const p of properties) {
    console.log(`- [${p.status}] "${p.title}" | planId: ${p.planId} | expiresAt: ${p.expiresAt?.toISOString()} | created: ${p.createdAt.toISOString()}`);
  }
}

main().finally(() => prisma.$disconnect());
