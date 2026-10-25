import { prisma } from '../config/database';

async function main() {
  console.log('[Migration] Migrating existing property validity and publication timestamps...');

  const properties = await prisma.property.findMany({
    include: { plan: true },
  });

  let updatedCount = 0;

  for (const prop of properties) {
    const isResidential = prop.propertyType === 'HOUSE';
    const planDuration = prop.plan?.durationDays || (isResidential ? 30 : 60);

    const updateData: {
      publishedAt?: Date;
      validityDays?: number;
      expiresAt?: Date;
      status?: 'EXPIRED';
    } = {};

    // 1. Ensure validityDays is recorded
    if (!prop.validityDays) {
      if (prop.expiresAt && prop.createdAt) {
        const diffDays = Math.max(1, Math.round((prop.expiresAt.getTime() - prop.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
        updateData.validityDays = prop.plan?.durationDays || diffDays;
      } else {
        updateData.validityDays = planDuration;
      }
    }

    // 2. For PUBLISHED properties: ensure publishedAt and expiresAt exist
    if (prop.status === 'PUBLISHED') {
      if (!prop.publishedAt) {
        updateData.publishedAt = prop.createdAt;
      }

      if (!prop.expiresAt) {
        const duration = updateData.validityDays || prop.validityDays || planDuration;
        const calculatedExpiry = new Date(prop.createdAt.getTime() + duration * 24 * 60 * 60 * 1000);
        updateData.expiresAt = calculatedExpiry;

        // If calculated expiry has already passed, transition to EXPIRED
        if (calculatedExpiry <= new Date()) {
          updateData.status = 'EXPIRED';
        }
      } else if (prop.expiresAt <= new Date()) {
        // Already passed expiresAt
        updateData.status = 'EXPIRED';
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.property.update({
        where: { id: prop.id },
        data: updateData,
      });
      updatedCount++;
    }
  }

  console.log(`[Migration] Completed. Safely updated ${updatedCount} of ${properties.length} properties.`);
}

main()
  .catch((e) => {
    console.error('[Migration] Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
