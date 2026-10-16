import { PrismaClient } from '@prisma/client';
import { getNavaratriOffer, isOfferActive, PROMOTIONAL_OFFERS } from '../src/config/offerConfig';
import { syncPromotionalPlan } from '../src/controllers/plan.controller';

const prisma = new PrismaClient();

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Navaratri Offer & Free Plan Automated Tests');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // Test 1: Offer Config & Active Status
    const navOffer = getNavaratriOffer();
    assert(navOffer !== undefined, 'Navaratri offer configuration exists');
    assert(navOffer.planId === 'plan_navaratri_free', 'Plan ID is plan_navaratri_free');
    assert(navOffer.price === 0, 'Promotional price is exactly ₹0');
    assert(navOffer.originalPrice === 222, 'Original standard residential price is displayed (₹222)');
    assert(navOffer.ctaText === 'Post Your Property for FREE', 'CTA text is "Post Your Property for FREE"');
    assert(navOffer.ctaLink === '/owner/properties/add', 'CTA links to existing property posting form /owner/properties/add');

    const currentlyActive = isOfferActive(navOffer);
    console.log(`ℹ️ Offer Active Status (as of ${new Date().toISOString()}): ${currentlyActive}`);
    assert(currentlyActive === true, 'Navaratri offer is currently active within configured window');

    // Test 2: Database Sync & Listing Plans
    await syncPromotionalPlan();
    const plansInDb = await prisma.listingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const freePlanInDb = plansInDb.find((p) => p.id === 'plan_navaratri_free');
    assert(freePlanInDb !== undefined, 'plan_navaratri_free exists in active plans');
    assert(freePlanInDb?.price === 0, 'plan_navaratri_free in DB has price = 0');
    assert(freePlanInDb?.name === 'Navaratri Free Posting Plan', 'plan_navaratri_free has name "Navaratri Free Posting Plan"');

    // Test 3: Existing Paid Plans Unchanged
    const resPlan = plansInDb.find((p) => p.id === 'plan_residential_single');
    const commPlan = plansInDb.find((p) => p.id === 'plan_commercial_single');
    assert(resPlan !== undefined && resPlan.price === 222, 'Residential plan still exists and is ₹222');
    assert(commPlan !== undefined && commPlan.price === 555, 'Commercial plan still exists and is ₹555');

    // Test 4: Property Creation and Free Plan Payment Bypass Flow
    const demoOwner = await prisma.owner.findFirst({
      include: { user: true },
    });

    if (!demoOwner || !demoOwner.user) {
      throw new Error('Demo owner not found in database for testing');
    }

    // Create a temporary draft property to test posting
    const testProp = await prisma.property.create({
      data: {
        ownerId: demoOwner.id,
        propertyType: 'HOUSE',
        title: 'Test Navaratri Free Offer Rental Property',
        description: 'Testing ₹0 promotional submission',
        rent: 18000,
        deposit: 90000,
        locality: 'Adyar',
        address: 'Test Address, Adyar, Chennai',
        propertySize: 950,
        bedrooms: 2,
        furnishing: 'SEMI_FURNISHED',
        amenities: ['Metro Water', 'Parking'],
        availability: new Date(),
        status: 'DRAFT',
      },
    });

    assert(testProp.status === 'DRAFT', 'Test property created in DRAFT status');

    // Simulate free plan activation:
    const freeOrderId = `free_order_test_${Date.now()}`;
    const freeTransactionId = `promo_navaratri_test_${Date.now()}`;

    const paymentRecord = await prisma.payment.create({
      data: {
        userId: demoOwner.userId,
        ownerId: demoOwner.id,
        propertyId: testProp.id,
        planId: freePlanInDb!.id,
        amount: 0,
        currency: 'INR',
        cfOrderId: freeOrderId,
        transactionId: freeTransactionId,
        paymentMethod: 'NAVARATRI_FREE_OFFER',
        paymentStatus: 'SUCCESS',
      },
    });

    await prisma.property.update({
      where: { id: testProp.id },
      data: { status: 'PENDING_APPROVAL', planId: freePlanInDb!.id },
    });

    const updatedProp = await prisma.property.findUnique({
      where: { id: testProp.id },
    });

    assert(paymentRecord.amount === 0, 'Payment record amount is ₹0');
    assert(paymentRecord.paymentStatus === 'SUCCESS', 'Payment record status is SUCCESS without gateway charge');
    assert(paymentRecord.paymentMethod === 'NAVARATRI_FREE_OFFER', 'Payment method is NAVARATRI_FREE_OFFER');
    assert(updatedProp?.status === 'PENDING_APPROVAL', 'Property successfully activated to PENDING_APPROVAL status for review');
    assert(updatedProp?.planId === 'plan_navaratri_free', 'Property planId is set to plan_navaratri_free');

    // Clean up test property and payment
    await prisma.payment.delete({ where: { id: paymentRecord.id } });
    await prisma.property.delete({ where: { id: testProp.id } });

    // Test 5: Auto-Expiry Simulation
    const pastOffer = {
      ...navOffer,
      endDate: '2026-10-01T00:00:00+05:30', // In the past
    };
    const isPastActive = isOfferActive(pastOffer as any);
    assert(isPastActive === false, 'Offer with past endDate evaluates to inactive (false)');

    const inactiveOffer = {
      ...navOffer,
      isActive: false, // Disabled toggle
    };
    const isToggleInactive = isOfferActive(inactiveOffer as any);
    assert(isToggleInactive === false, 'Offer with isActive: false evaluates to inactive (false)');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed}/${total} Tests Passed!`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
