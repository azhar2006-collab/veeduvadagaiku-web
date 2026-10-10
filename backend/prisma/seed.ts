import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding database with verified House and Shop listings...');

  // 1. Create Default Listing Plans
  const plans = [
    {
      id: 'plan_residential_single',
      name: 'Residential (1 Property)',
      price: 222,
      durationDays: 30,
      description: 'List 1 residential property (House, Flat, Apartment, Hostel) for 30 days.',
      features: [
        '1 Residential Property Listing',
        '₹222 for 30 Days',
        'Up to 10 HD Photos',
        'Direct Calls & WhatsApp from Tenants',
        'Verified Listing Badge upon Approval',
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'plan_commercial_single',
      name: 'Commercial (1 Property)',
      price: 555,
      durationDays: 30,
      description: 'List 1 commercial property (Shop, Office, Showroom, Marriage Hall) for 30 days.',
      features: [
        '1 Commercial Property Listing',
        '₹555 for 30 Days',
        'Up to 10 HD Photos',
        'Direct Business Calls & WhatsApp Leads',
        'High Visibility Commercial Showcase',
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'plan_residential_pack_5',
      name: 'Residential Pack (5 Properties)',
      price: 995,
      durationDays: 30,
      description: 'Special discount for 5 residential listings at ₹199/ad (Total ₹995 for 30 days each).',
      features: [
        '5 Residential Property Listings',
        '₹199 per ad (Save ₹115)',
        '30 Days Active per Listing',
        'Priority Verification & Admin Review',
        'Direct Calls & WhatsApp Leads',
      ],
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'plan_commercial_pack_5',
      name: 'Commercial Pack (5 Properties)',
      price: 2220,
      durationDays: 30,
      description: 'Special discount for 5 commercial listings at ₹444/ad (Total ₹2,220 for 30 days each).',
      features: [
        '5 Commercial Property Listings',
        '₹444 per ad (Save ₹555)',
        '30 Days Active per Listing',
        'Top-Ranked Commercial Placement',
        'Dedicated Premium Lead Management',
      ],
      isActive: true,
      sortOrder: 4,
    },
    // Legacy plans - kept inactive for historical references
    {
      id: 'plan_basic',
      name: 'Basic (Legacy)',
      price: 478,
      durationDays: 30,
      description: 'Legacy plan - no longer active.',
      features: [],
      isActive: false,
      sortOrder: 10,
    },
    {
      id: 'plan_standard',
      name: 'Standard (Legacy)',
      price: 999,
      durationDays: 60,
      description: 'Legacy plan - no longer active.',
      features: [],
      isActive: false,
      sortOrder: 11,
    },
    {
      id: 'plan_premium',
      name: 'Premium (Legacy)',
      price: 1999,
      durationDays: 90,
      description: 'Legacy plan - no longer active.',
      features: [],
      isActive: false,
      sortOrder: 12,
    },
  ];

  for (const plan of plans) {
    await prisma.listingPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }
  console.log('[Seed] Listing plans ready');

  // 2. Create Platform Admin Users
  const adminUser = await prisma.user.upsert({
    where: { mobile: '+919999900001' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Chennai Platform Admin',
      email: 'admin@veeduvadagaiku.com',
      mobile: '+919999900001',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const srinandhiniAdmin = await prisma.user.upsert({
    where: { email: 'srinandhinihall@gmail.com' },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      name: 'Srinandhini Hall Admin',
      email: 'srinandhinihall@gmail.com',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('[Seed] Admin accounts ready:', adminUser.email, srinandhiniAdmin.email);

  // 3. Create Demo Landlord / Owner
  const demoOwnerUser = await prisma.user.upsert({
    where: { mobile: '+919840012345' },
    update: { role: 'OWNER' },
    create: {
      name: 'Ramanathan Natarajan',
      email: 'ramanathan@gmail.com',
      mobile: '+919840012345',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const demoOwner = await prisma.owner.upsert({
    where: { userId: demoOwnerUser.id },
    update: { isVerified: true },
    create: {
      userId: demoOwnerUser.id,
      bio: 'Property owner with verified houses and commercial retail shops across Chennai.',
      isVerified: true,
    },
  });
  console.log('[Seed] Demo Owner ready:', demoOwnerUser.name);

  // 4. Strict Real Estate Properties: ONLY HOUSES and ONLY SHOPS (Zero Cars, Zero Offices)
  const propertiesData = [
    {
      id: 'prop_demo_house_1',
      ownerId: demoOwner.id,
      propertyType: 'HOUSE' as const,
      title: 'Spacious 2 BHK Independent House near Tower Park',
      description: 'Independent first-floor house with abundant natural light, 24/7 metro water supply, covered parking, and modular kitchen. Located in a peaceful residential street, just 5 minutes from Anna Nagar East Metro Station.',
      rent: 24000,
      deposit: 120000,
      locality: 'Anna Nagar',
      address: 'Plot No. 42, 2nd Main Road, Near Tower Park, Anna Nagar East, Chennai - 600102',
      propertySize: 1250,
      bedrooms: 2,
      furnishing: 'SEMI_FURNISHED' as const,
      amenities: ['24/7 Metro Water', 'Covered Parking', 'Power Backup', 'Near Metro Station', 'Modular Kitchen'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_standard',
      viewCount: 165,
      images: [
        {
          imageUrl: '/indian-properties/house1.jpg',
          publicId: 'demo/house1_facade',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/house3.jpg',
          publicId: 'demo/house1_living',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },
    {
      id: 'prop_demo_house_2',
      ownerId: demoOwner.id,
      propertyType: 'HOUSE' as const,
      title: 'Luxury 3 BHK Gated Community Apartment in Velachery',
      description: 'Fully furnished 3 BHK apartment in premium gated community with clubhouse, gym, swimming pool, and round-the-clock security. Excellent connectivity to OMR IT expressway, Phoenix Marketcity, and Velachery MRTS.',
      rent: 36000,
      deposit: 180000,
      locality: 'Velachery',
      address: 'Tower B, Flat 502, Orchid Springs, Bypass Road, Velachery, Chennai - 600042',
      propertySize: 1650,
      bedrooms: 3,
      furnishing: 'FURNISHED' as const,
      amenities: ['Lift / Elevator', 'Gated Community Security', 'Air Conditioner', 'Covered Parking', 'Power Backup', 'Swimming Pool'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_premium',
      viewCount: 312,
      images: [
        {
          imageUrl: '/indian-properties/house3.jpg',
          publicId: 'demo/house2_living',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/house1.jpg',
          publicId: 'demo/house2_building',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },
    {
      id: 'prop_demo_house_3',
      ownerId: demoOwner.id,
      propertyType: 'HOUSE' as const,
      title: 'Beachside 2 BHK Independent House in Besant Nagar',
      description: 'Breezy, coastal 2 BHK independent home located just a 3-minute walk from Elliot\'s Beach. Huge sit-out balcony, marble flooring, 24/7 borewell & metro water. Ideal for families seeking peaceful coastal living.',
      rent: 30000,
      deposit: 150000,
      locality: 'Besant Nagar',
      address: 'No. 18, 4th Main Road, Near Murugan Idli Shop, Besant Nagar, Chennai - 600090',
      propertySize: 1180,
      bedrooms: 2,
      furnishing: 'SEMI_FURNISHED' as const,
      amenities: ['Sea Breeze Balcony', '24/7 Metro Water', 'Bike & Car Parking', 'Safe Neighborhood', 'Near Beach'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_standard',
      viewCount: 220,
      images: [
        {
          imageUrl: '/indian-properties/house4.jpg',
          publicId: 'demo/house3_hall',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/house5.jpg',
          publicId: 'demo/house3_villa',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },
    {
      id: 'prop_demo_house_4',
      ownerId: demoOwner.id,
      propertyType: 'HOUSE' as const,
      title: 'Modern 3 BHK Residential Flat in Sholinganallur',
      description: 'Upscale 3 BHK home on OMR IT expressway. Features imported fittings, AC in all bedrooms, modular kitchen, gym, clubhouse, and 100% DG power backup.',
      rent: 34000,
      deposit: 170000,
      locality: 'Sholinganallur',
      address: 'Tower 4, Flat 1204, Hiranandani Parks, OMR Expressway, Sholinganallur, Chennai - 600119',
      propertySize: 1580,
      bedrooms: 3,
      furnishing: 'FURNISHED' as const,
      amenities: ['100% Power Backup', 'Gym & Clubhouse', 'High Speed Lifts', 'Covered Parking', 'Air Conditioner', 'CCTV Surveillance'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_premium',
      viewCount: 245,
      images: [
        {
          imageUrl: '/indian-properties/house5.jpg',
          publicId: 'demo/house4_facade',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/house3.jpg',
          publicId: 'demo/house4_bedroom',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },
    {
      id: 'prop_demo_house_5',
      ownerId: demoOwner.id,
      propertyType: 'HOUSE' as const,
      title: 'Traditional 2 BHK Independent Ground Floor in Mylapore',
      description: 'Peaceful traditional home in the cultural heart of Mylapore, 400m from Sri Kapaleeshwarar Temple. Traditional courtyard, cool red oxide & granite floors, pooja room, and dedicated two-wheeler parking.',
      rent: 22000,
      deposit: 110000,
      locality: 'Mylapore',
      address: 'Old No. 12, South Mada Street, Near Tank, Mylapore, Chennai - 600004',
      propertySize: 1050,
      bedrooms: 2,
      furnishing: 'SEMI_FURNISHED' as const,
      amenities: ['Pooja Room', '24/7 Metro Water', 'Walking Distance to Temple & Market', 'Peaceful Street'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_basic',
      viewCount: 180,
      images: [
        {
          imageUrl: '/indian-properties/house2.jpg',
          publicId: 'demo/house5_house',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/house4.jpg',
          publicId: 'demo/house5_entrance',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },

    {
      id: 'prop_demo_shop_1',
      ownerId: demoOwner.id,
      propertyType: 'SHOP' as const,
      title: 'Prime Road-Facing Commercial Retail Shop in T. Nagar',
      description: 'High visibility, main road commercial showroom space located in the bustling shopping district of T. Nagar. Equipped with three-phase power, high ceiling, rolling shutter, and glass frontage. Perfect for clothing boutique, electronics, opticals, or clinic.',
      rent: 55000,
      deposit: 300000,
      locality: 'T. Nagar',
      address: 'Door No. 88, Usman Road, Opp. Panagal Park, T. Nagar, Chennai - 600017',
      propertySize: 850,
      rooms: 1,
      furnishing: 'UNFURNISHED' as const,
      amenities: ['Main Road Facing', 'Heavy Footfall Zone', 'Three Phase Electricity', 'Glass Frontage', 'Rolling Shutter Installed'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_premium',
      viewCount: 310,
      images: [
        {
          imageUrl: '/indian-properties/shop1.jpg',
          publicId: 'demo/shop1_front',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/shop1.jpg',
          publicId: 'demo/shop1_store',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },
    {
      id: 'prop_demo_shop_2',
      ownerId: demoOwner.id,
      propertyType: 'SHOP' as const,
      title: 'Corner Commercial Retail Store on LB Road in Adyar',
      description: 'Corner commercial space suitable for retail outlet, pharmacy, or diagnostic lab. Good frontage with ample customer parking right in front. Easy access from LB Road and Kasturba Nagar.',
      rent: 38000,
      deposit: 200000,
      locality: 'Adyar',
      address: 'No. 15, LB Road, Near Adyar Signal, Adyar, Chennai - 600020',
      propertySize: 620,
      rooms: 2,
      furnishing: 'SEMI_FURNISHED' as const,
      amenities: ['Main Road Facing', 'Customer Parking', 'Attached Restroom', 'Three Phase Electricity', 'Air Conditioning Ready'],
      availability: new Date(),
      status: 'PUBLISHED' as const,
      planId: 'plan_standard',
      viewCount: 205,
      images: [
        {
          imageUrl: '/indian-properties/shop2.jpg',
          publicId: 'demo/shop2_storefront',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          imageUrl: '/indian-properties/shop1.jpg',
          publicId: 'demo/shop2_retail',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
    },

  ];

  for (const p of propertiesData) {
    const { images, ...propData } = p;

    // 1. Delete existing images for clean re-insertion
    await prisma.propertyImage.deleteMany({
      where: { propertyId: p.id },
    });

    // 2. Upsert Property
    await prisma.property.upsert({
      where: { id: p.id },
      update: {
        ...propData,
        status: 'PUBLISHED',
      },
      create: {
        ...propData,
        status: 'PUBLISHED',
      },
    });

    // 3. Create clean images strictly of houses and shops
    await prisma.propertyImage.createMany({
      data: images.map((img) => ({
        propertyId: p.id,
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
    });
  }

  console.log(`[Seed] Seeded ${propertiesData.length} Verified Properties: houses and retail shops.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
