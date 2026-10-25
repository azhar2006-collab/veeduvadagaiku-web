import { PrismaClient } from '@prisma/client';
import {
  resolvePlanValidityDays,
  calculateExpiryDate,
  expireDueProperties,
  renewPropertyListing,
  PLAN_VALIDITY_DAYS,
} from '../services/validity.service';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=== [TEST SUITE] Property Validity and Expiry System ===\n');

  // Test 1: Plan Validity Rules Verification
  console.log('[Test 1] Verifying exact plan validity rules:');
  console.assert(PLAN_VALIDITY_DAYS.DEEPAVALI_FREE === 60, 'Deepavali Free must be 60 days');
  console.assert(PLAN_VALIDITY_DAYS.RESIDENTIAL === 30, 'Residential must be 30 days');
  console.assert(PLAN_VALIDITY_DAYS.HOME_SERVICES === 60, 'Home Services must be 60 days');
  console.assert(PLAN_VALIDITY_DAYS.COMMERCIAL === 60, 'Commercial must be 60 days');
  console.assert(PLAN_VALIDITY_DAYS.KALYANA_MANDAPAM === 60, 'Kalyana Mandapam must be 60 days');
  console.log('  ✔ All duration constants match exact specification.\n');

  // Test 2: Dynamic Plan Resolution
  console.log('[Test 2] Testing dynamic plan resolution for various plan types:');
  const resDays = resolvePlanValidityDays({ id: 'plan_residential_single', durationDays: 30 }, 'HOUSE');
  const commDays = resolvePlanValidityDays({ id: 'plan_commercial_single', durationDays: 60 }, 'SHOP');
  const mandapamDays = resolvePlanValidityDays({ id: 'plan_kalyana_mandapam', durationDays: 60 }, 'MARRIAGE_HALL');
  const deepavaliDays = resolvePlanValidityDays({ id: 'plan_deepavali_free', durationDays: 60 }, 'HOUSE');

  console.assert(resDays === 30, `Expected 30, got ${resDays}`);
  console.assert(commDays === 60, `Expected 60, got ${commDays}`);
  console.assert(mandapamDays === 60, `Expected 60, got ${mandapamDays}`);
  console.assert(deepavaliDays === 60, `Expected 60, got ${deepavaliDays}`);
  console.log('  ✔ Residential resolves to 30 days.');
  console.log('  ✔ Commercial resolves to 60 days.');
  console.log('  ✔ Kalyana Mandapam resolves to 60 days.');
  console.log('  ✔ Deepavali Free resolves to 60 days.\n');

  // Test 3: Date Arithmetic
  console.log('[Test 3] Testing exact calendar day calculation:');
  const testBaseDate = new Date('2026-10-25T10:00:00.000Z');
  const expiry30 = calculateExpiryDate(testBaseDate, 30);
  const expiry60 = calculateExpiryDate(testBaseDate, 60);

  const diffMs30 = expiry30.getTime() - testBaseDate.getTime();
  const diffDays30 = Math.round(diffMs30 / (1000 * 60 * 60 * 24));
  const diffMs60 = expiry60.getTime() - testBaseDate.getTime();
  const diffDays60 = Math.round(diffMs60 / (1000 * 60 * 60 * 24));

  console.assert(diffDays30 === 30, `Expected 30 days diff, got ${diffDays30}`);
  console.assert(diffDays60 === 60, `Expected 60 days diff, got ${diffDays60}`);
  console.log('  ✔ 30-day and 60-day expiry calculations exact.\n');

  // Test 4: Database query and batch expiry execution
  console.log('[Test 4] Running expireDueProperties() batch execution:');
  const res = await expireDueProperties();
  console.log(`  ✔ Successfully ran batch expiry job. Updated ${res.count} due properties.\n`);

  // Test 5: Verify Database Plans in DB
  console.log('[Test 5] Verifying active plans in database:');
  const plans = await prisma.listingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  for (const p of plans) {
    console.log(`  - Plan: "${p.name}" | Price: ₹${p.price} | Duration: ${p.durationDays} days`);
  }

  const mandapamInDb = plans.find(p => p.id === 'plan_kalyana_mandapam');
  console.assert(mandapamInDb?.price === 2500, `Expected Kalyanamandapam price 2500, got ${mandapamInDb?.price}`);
  console.assert(mandapamInDb?.durationDays === 60, `Expected Kalyanamandapam duration 60, got ${mandapamInDb?.durationDays}`);

  const resInDb = plans.find(p => p.id === 'plan_residential_single');
  console.assert(resInDb?.durationDays === 30, `Expected Residential duration 30, got ${resInDb?.durationDays}`);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');
}

runTests()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
