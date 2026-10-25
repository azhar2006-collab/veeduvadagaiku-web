import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Update Plans] Syncing official Deepavali & updated plans to DB...');

  // 1. Deactivate old legacy plans
  await prisma.listingPlan.updateMany({
    where: {
      id: { in: ['plan_basic', 'plan_standard', 'plan_premium', 'plan_residential_pack_5', 'plan_commercial_pack_5'] },
    },
    data: {
      isActive: false,
    },
  });
  console.log('[Update Plans] Legacy plans deactivated');

  // 2. Define the exact plans matching the updated showcase
  const updatedPlans = [
    {
      id: 'plan_deepavali_free',
      name: 'Deepavali Free Offer',
      price: 0,
      durationDays: 60,
      description: '100% Free property & services listing across Chennai till Deepavali, 8 Nov 2026. Zero posting fee.',
      features: [
        '100% Free Property Listing (₹0 Posting Fee)',
        'Full 60-Day Validity across Chennai',
        'Direct Tenant Phone Calls & WhatsApp Messages',
        'Up to 10 HD Photos with Cloud Hosting',
        'Valid for Houses, Flats, Commercial, Halls & Services',
      ],
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'plan_navaratri_free',
      name: 'Deepavali Free Offer (Offer Alias)',
      price: 0,
      durationDays: 60,
      description: '100% Free property & services listing across Chennai till Deepavali, 8 Nov 2026.',
      features: [
        '100% Free Property Listing (₹0 Posting Fee)',
        'Full 60-Day Validity across Chennai',
        'Direct Tenant Phone Calls & WhatsApp Messages',
        'Up to 10 HD Photos with Cloud Hosting',
        'Valid for Houses, Flats, Commercial, Halls & Services',
      ],
      isActive: false, // alias deactivated in UI, keeps DB referential integrity
      sortOrder: 99,
    },
    {
      id: 'plan_residential_single',
      name: 'Residential (House / Flat)',
      price: 99,
      durationDays: 30,
      description: 'List 1 residential property (House, Flat, Apartment, Hostel) across Chennai for 30 days.',
      features: [
        '1 Residential Property Listing (30 Days)',
        'Post-Offer Regular Price ₹99 (Free during Deepavali)',
        'Up to 10 HD Photos',
        'Direct Phone & WhatsApp Leads from Seekers',
        'Coverage in All 150+ Chennai Pincodes',
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'plan_home_services',
      name: 'Home Services Listing',
      price: 444,
      durationDays: 60,
      description: 'Advertise your home service (Cleaning, Painting, Plumbing, Electrical, Packers) for 60 days.',
      features: [
        '60-Day Home Service Advertisement',
        'Post-Offer Regular Price ₹444 (Free during Deepavali)',
        'Direct Customer Leads via Phone & WhatsApp',
        'Service Category Showcase on Platform',
        'Up to 10 Photos of Previous Work',
        'Priority Search Visibility across Chennai',
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'plan_commercial_single',
      name: 'Commercial & Shops',
      price: 555,
      durationDays: 60,
      description: 'List 1 commercial property (Shop, Office Space, Commercial Building, Showroom) for 60 days.',
      features: [
        '1 Commercial / Shop Listing (60 Days)',
        'Post-Offer Regular Price ₹555 (Free during Deepavali)',
        'Direct Business Calls & WhatsApp Leads',
        'Promoted Placement on Website',
        'High-Visibility Commercial Showcase',
        'Up to 10 HD Photos',
      ],
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'plan_kalyana_mandapam',
      name: 'Kalyana Mandapam & Halls',
      price: 2500,
      durationDays: 60,
      description: 'Premium venue listing for Marriage Halls, Convention Centers, Mini Halls & Party Venues for 60 days.',
      features: [
        'All 8 Premium Platform Features Included',
        '60-Day Premium Venue Listing',
        'Post-Offer Regular Price ₹2,500 (Free during Deepavali)',
        'Dedicated Owner Support Manager',
        'Homepage Featured Placement',
        'Direct Booking & Event Enquiries via Phone & WhatsApp',
      ],
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const plan of updatedPlans) {
    const upserted = await prisma.listingPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
    console.log(`[Update Plans] Upserted: ${upserted.name} (₹${upserted.price} / ${upserted.durationDays}d, active: ${upserted.isActive})`);
  }

  const activePlans = await prisma.listingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  console.log('[Update Plans] Active plans in DB count:', activePlans.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
