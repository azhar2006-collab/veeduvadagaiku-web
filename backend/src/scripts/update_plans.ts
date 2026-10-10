import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Update Plans] Configuring new pricing plans...');

  // 1. Deactivate legacy plans
  await prisma.listingPlan.updateMany({
    where: {
      id: { in: ['plan_basic', 'plan_standard', 'plan_premium'] },
    },
    data: {
      isActive: false,
    },
  });
  console.log('[Update Plans] Legacy plans deactivated');

  // 2. Define the new pricing plans requested by user
  const newPlans = [
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
  ];

  for (const plan of newPlans) {
    const upserted = await prisma.listingPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
    console.log(`[Update Plans] Upserted: ${upserted.name} (₹${upserted.price})`);
  }

  const activePlans = await prisma.listingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  console.log('[Update Plans] Active plans in DB:', activePlans);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
