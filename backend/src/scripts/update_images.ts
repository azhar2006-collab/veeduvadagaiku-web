import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating property images in database...');

  // Map demo houses to the best fitting new photos
  const demoMappings: Record<string, { primary: string; secondary: string }> = {
    prop_demo_house_1: {
      primary: '/indian-properties/house1.jpg', // Modern 2-story villa with BHUVI gate
      secondary: '/indian-properties/house3.jpg', // Modern furnished living room
    },
    prop_demo_house_2: {
      primary: '/indian-properties/house3.jpg', // Furnished living room
      secondary: '/indian-properties/house1.jpg', // Modern villa
    },
    prop_demo_house_3: {
      primary: '/indian-properties/house4.jpg', // Antique hall living room
      secondary: '/indian-properties/house5.jpg', // Bungalow
    },
    prop_demo_house_4: {
      primary: '/indian-properties/house5.jpg', // Chennai bungalow with clay tiles and jali facade
      secondary: '/indian-properties/house3.jpg', // Living room
    },
    prop_demo_house_5: {
      primary: '/indian-properties/house2.jpg', // Traditional heritage courtyard villa
      secondary: '/indian-properties/house4.jpg', // Antique hall
    },
    prop_demo_house_6: {
      primary: '/indian-properties/house1.jpg', // Modern villa
      secondary: '/indian-properties/house5.jpg', // Bungalow
    },
  };

  for (const [propId, imgs] of Object.entries(demoMappings)) {
    const existing = await prisma.property.findUnique({
      where: { id: propId },
      include: { images: true },
    });

    if (existing) {
      // Delete existing demo images for clean update
      await prisma.propertyImage.deleteMany({
        where: { propertyId: propId },
      });

      await prisma.propertyImage.createMany({
        data: [
          {
            propertyId: propId,
            imageUrl: imgs.primary,
            publicId: `${propId}_primary`,
            isPrimary: true,
            displayOrder: 0,
          },
          {
            propertyId: propId,
            imageUrl: imgs.secondary,
            publicId: `${propId}_secondary`,
            isPrimary: false,
            displayOrder: 1,
          },
        ],
      });
      console.log(`Updated images for ${propId} (${existing.title})`);
    }
  }

  // Also check all other HOUSE properties in DB: if any has 0 images or broken upload, assign one of the 5 real images
  const allHouses = await prisma.property.findMany({
    where: { propertyType: 'HOUSE' },
    include: { images: true },
  });

  const availableImages = [
    '/indian-properties/house1.jpg',
    '/indian-properties/house2.jpg',
    '/indian-properties/house3.jpg',
    '/indian-properties/house4.jpg',
    '/indian-properties/house5.jpg',
  ];

  let imgIndex = 0;
  for (const house of allHouses) {
    if (house.id.startsWith('prop_demo_')) continue;

    if (!house.images || house.images.length === 0) {
      const assigned = availableImages[imgIndex % availableImages.length];
      imgIndex++;
      await prisma.propertyImage.create({
        data: {
          propertyId: house.id,
          imageUrl: assigned,
          publicId: `${house.id}_photo`,
          isPrimary: true,
          displayOrder: 0,
        },
      });
      console.log(`Assigned image ${assigned} to empty property ${house.id} (${house.title})`);
    }
  }

  console.log('Finished updating property images!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
