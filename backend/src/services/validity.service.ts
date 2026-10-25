import { prisma } from '../config/database';

export const PLAN_VALIDITY_DAYS: Record<string, number> = {
  // Plan IDs
  plan_deepavali_free: 60,
  plan_residential_single: 30,
  plan_home_services: 60,
  plan_commercial_single: 60,
  plan_kalyana_mandapam: 60,

  // Named constants
  DEEPAVALI_FREE: 60,
  RESIDENTIAL: 30,
  HOME_SERVICES: 60,
  COMMERCIAL: 60,
  KALYANA_MANDAPAM: 60,
};

/**
 * Authoritative resolver for property listing validity in days.
 * Rules:
 * - Deepavali Free: 60 days
 * - Residential: 30 days
 * - Home Services: 60 days
 * - Commercial: 60 days
 * - Kalyana Mandapam: 60 days
 */
export function resolvePlanValidityDays(
  plan?: { id?: string | null; durationDays?: number | null } | null,
  propertyType?: string | null
): number {
  if (plan?.id && PLAN_VALIDITY_DAYS[plan.id]) {
    return PLAN_VALIDITY_DAYS[plan.id];
  }
  if (plan?.durationDays && plan.durationDays > 0) {
    return plan.durationDays;
  }
  if (propertyType) {
    const pt = propertyType.toUpperCase();
    if (['HOUSE', 'APARTMENT', 'VILLA', 'PG_HOSTEL', 'ROOM'].includes(pt)) {
      return 30; // Residential = 30 days
    }
  }
  return 60; // Commercial, Marriage Hall, Services, and Free Offer = 60 days
}

/**
 * Calculates new expiry timestamp given a start date and validity duration in days.
 */
export function calculateExpiryDate(startDate: Date = new Date(), validityDays: number): Date {
  const expiry = new Date(startDate.getTime());
  expiry.setDate(expiry.getDate() + validityDays);
  return expiry;
}

/**
 * Automatic expiry job:
 * Updates all PUBLISHED properties whose expiresAt has passed to EXPIRED.
 * Never touches DRAFT, PENDING_APPROVAL, REJECTED, or REMOVED properties.
 */
export async function expireDueProperties(): Promise<{ count: number }> {
  try {
    const now = new Date();
    const result = await prisma.property.updateMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if (result.count > 0) {
      console.log(`[ValidityService] Auto-expired ${result.count} property listing(s) at ${now.toISOString()}`);
    }
    return { count: result.count };
  } catch (error) {
    console.error('[ValidityService] Error running expireDueProperties:', error);
    return { count: 0 };
  }
}

let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Starts periodic automatic property validity & expiry checker.
 * Default interval: every 5 minutes.
 */
export function startExpiryScheduler(intervalMs = 5 * 60 * 1000) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  // Initial check on server boot
  expireDueProperties().catch((err) =>
    console.error('[ValidityService] Initial startup expiry check failed:', err)
  );

  // Periodic recurring check
  schedulerTimer = setInterval(() => {
    expireDueProperties().catch((err) =>
      console.error('[ValidityService] Periodic expiry check failed:', err)
    );
  }, intervalMs);

  console.log(`[ValidityService] Automatic property expiry scheduler started (interval: ${intervalMs / 1000}s)`);
}

/**
 * Renews an existing property listing for an owner.
 * If currently active: extends expiry by validity days from current expiresAt.
 * If already expired: extends expiry by validity days from now.
 */
export async function renewPropertyListing(params: {
  propertyId: string;
  ownerId: string;
  userId: string;
  planId?: string;
}) {
  const { propertyId, ownerId, userId, planId } = params;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId },
    include: { plan: true },
  });

  if (!property) {
    throw new Error('Property not found or unauthorized');
  }

  // Determine active plan to associate
  let targetPlan = property.plan;
  if (planId && planId !== property.planId) {
    const newPlan = await prisma.listingPlan.findUnique({ where: { id: planId } });
    if (newPlan) targetPlan = newPlan;
  }

  const durationDays = resolvePlanValidityDays(targetPlan, property.propertyType);
  const now = new Date();

  // If unexpired, extend from existing expiresAt; if expired or null, extend from now
  const baseDate = property.expiresAt && property.expiresAt > now ? new Date(property.expiresAt) : now;
  const newExpiresAt = calculateExpiryDate(baseDate, durationDays);

  const updatedProperty = await prisma.property.update({
    where: { id: property.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: property.publishedAt || now,
      validityDays: durationDays,
      expiresAt: newExpiresAt,
      rejectionReason: null,
      ...(targetPlan ? { planId: targetPlan.id } : {}),
    },
    include: {
      plan: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  // Record renewal payment / audit entry
  const renewalOrderId = `renewal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await prisma.payment.create({
    data: {
      userId,
      ownerId,
      propertyId: property.id,
      planId: targetPlan?.id || 'plan_free',
      amount: targetPlan?.price || 0,
      currency: 'INR',
      cfOrderId: renewalOrderId,
      transactionId: `renew_${Date.now()}`,
      paymentMethod: targetPlan?.price ? 'RENEWAL_PAID' : 'FREE_RENEWAL',
      paymentStatus: 'SUCCESS',
    },
  }).catch((err) => console.warn('[ValidityService] Could not log renewal payment record:', err));

  return updatedProperty;
}
