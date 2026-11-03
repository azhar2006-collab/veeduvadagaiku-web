import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ids = ['prop_demo_shop_4', 'prop_demo_shop_3', 'prop_demo_house_6'];
  console.log('Removing 3 properties:', ids);

  for (const id of ids) {
    // Delete related records first if any
    await prisma.favourite.deleteMany({ where: { propertyId: id } });
    await prisma.enquiry.deleteMany({ where: { propertyId: id } });
    await prisma.payment.deleteMany({ where: { propertyId: id } });
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });

    // Delete property
    const deleted = await prisma.property.deleteMany({ where: { id } });
    console.log(`Deleted ${id}:`, deleted);
  }

  console.log('Successfully removed the three properties!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
