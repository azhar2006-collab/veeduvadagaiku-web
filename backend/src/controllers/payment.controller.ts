import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';

/**
 * Handle free order creation for any property listing.
 * Bypasses payment gateways (Razorpay / Cashfree) completely.
 * Automatically marks the property as PENDING_APPROVAL for admin review.
 */
async function handleFreeOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { propertyId, planId, currency = 'INR' } = req.body;
    let property: any = null;
    let owner: any = null;

    if (propertyId) {
      if (req.user) {
        owner = await prisma.owner.findUnique({ where: { userId: req.user.id } });
        if (owner) {
          property = await prisma.property.findFirst({ where: { id: propertyId, ownerId: owner.id } });
        }
      }
      if (!property) {
        property = await prisma.property.findUnique({ where: { id: propertyId } });
      }

      if (property) {
        await prisma.property.update({
          where: { id: property.id },
          data: { status: 'PENDING_APPROVAL', rejectionReason: null },
        });

        if (req.user && owner) {
          const freeOrderId = `free_listing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await prisma.payment.create({
            data: {
              userId: req.user.id,
              ownerId: owner.id,
              propertyId: property.id,
              planId: planId || 'plan_free',
              amount: 0,
              currency: currency || 'INR',
              cfOrderId: freeOrderId,
              transactionId: `free_${Date.now()}`,
              paymentMethod: 'FREE_LISTING',
              paymentStatus: 'SUCCESS',
            },
          }).catch(() => {});
        }
      }
    }

    const freeOrderId = `free_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return res.status(200).json({
      success: true,
      isFree: true,
      status: 'PAID',
      order_id: freeOrderId,
      id: freeOrderId,
      cf_order_id: freeOrderId,
      amount: 0,
      currency: currency || 'INR',
      message: 'Property listing submitted for admin review successfully (100% Free Listing).',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle verification for free listings.
 * Always succeeds and marks property as PENDING_APPROVAL.
 */
async function handleFreeVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId, order_id, orderId } = req.body;
    if (propertyId) {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'PENDING_APPROVAL' },
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      status: 'PAID',
      message: 'Property listing confirmed for admin review (100% Free).',
      order_id: order_id || orderId || 'free_order',
    });
  } catch (error) {
    next(error);
  }
}

// Cashfree endpoints (now 100% free bypass)
export async function createCashfreeOrder(req: AuthRequest, res: Response, next: NextFunction) {
  return handleFreeOrder(req, res, next);
}

export async function verifyCashfreePayment(req: Request, res: Response, next: NextFunction) {
  return handleFreeVerify(req, res, next);
}

// Razorpay endpoints (now 100% free bypass)
export async function createRazorpayOrder(req: AuthRequest, res: Response, next: NextFunction) {
  return handleFreeOrder(req, res, next);
}

export async function verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
  return handleFreeVerify(req, res, next);
}

// Aliases for root direct checkout routes
export const createOrder = createRazorpayOrder;
export const verifyPayment = verifyRazorpayPayment;

// Webhook endpoint
export async function cashfreeWebhook(req: Request, res: Response) {
  return res.json({ received: true });
}

/**
 * Payment history for authenticated owner
 */
export async function getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const payments = await prisma.payment.findMany({
      where: { ownerId: owner.id },
      include: {
        property: { select: { id: true, title: true, locality: true } },
        plan: { select: { name: true, durationDays: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(payments));
  } catch (error) {
    next(error);
  }
}
