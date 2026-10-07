import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import razorpay, { razorpayKeyId, razorpayKeySecret, isRazorpayConfigured } from '../config/razorpay';
import cashfree from '../config/cashfree';

/**
 * Razorpay: Create Order
 * POST /api/create-order or POST /api/payments/create-order
 * Request: { amount (paise), currency, receipt, propertyId, planId }
 * Returns: { order_id, amount, currency, ... }
 */
export async function createRazorpayOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      });
    }

    const { propertyId, planId, currency = 'INR', receipt, notes } = req.body;
    let amount = req.body.amount;

    let property: any = null;
    let plan: any = null;
    let owner: any = null;

    // If propertyId and planId are provided, handle listing plan checkout flow
    if (propertyId && planId) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for property plan payment',
        });
      }

      owner = await prisma.owner.findUnique({ where: { userId: req.user.id } });
      if (!owner) {
        return res.status(403).json({
          success: false,
          message: 'Owner profile not found',
        });
      }

      property = await prisma.property.findFirst({ where: { id: propertyId, ownerId: owner.id } });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found or not authorized',
        });
      }

      if (property.status !== 'DRAFT' && property.status !== 'REJECTED') {
        return res.status(400).json({
          success: false,
          message: 'Payment can only be made for draft or rejected properties',
        });
      }

      plan = await prisma.listingPlan.findFirst({ where: { id: planId, isActive: true } });
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Listing plan not found',
        });
      }

      // Convert rupees to paise (e.g., ₹299 -> 29900 paise)
      amount = Math.round(plan.price * 100);
    }

    // Amount validation: must be at least 100 paise (₹1)
    if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be a number in paise',
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount must be at least 100 paise (₹1)',
      });
    }

    const orderReceipt = receipt || (propertyId ? `rcpt_prop_${propertyId.slice(0, 8)}_${Date.now()}` : `rcpt_${Date.now()}`);

    const options = {
      amount: Math.round(amount),
      currency: currency || 'INR',
      receipt: String(orderReceipt).slice(0, 40), // Razorpay receipt max 40 chars
      notes: {
        ...(notes || {}),
        ...(propertyId ? { propertyId } : {}),
        ...(planId ? { planId } : {}),
        ...(req.user?.id ? { userId: req.user.id } : {}),
      },
    };

    let razorpayOrder: any;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr: any) {
      if (rzpErr?.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: 'Razorpay authentication failed. Invalid API credentials.',
        });
      }
      return res.status(500).json({
        success: false,
        message: rzpErr?.error?.description || rzpErr?.message || 'Failed to create order with Razorpay',
      });
    }

    // Save payment record if in property-plan flow
    let paymentRecord: any = null;
    if (property && plan && owner && req.user) {
      paymentRecord = await prisma.payment.create({
        data: {
          userId: req.user.id,
          ownerId: owner.id,
          propertyId: property.id,
          planId: plan.id,
          amount: plan.price,
          currency: currency || 'INR',
          razorpayOrderId: razorpayOrder.id,
          paymentStatus: 'PENDING',
        },
      });

      await prisma.property.update({
        where: { id: property.id },
        data: { status: 'PAYMENT_PENDING', planId: plan.id },
      });
    }

    return res.status(201).json({
      success: true,
      order_id: razorpayOrder.id,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      key_id: razorpayKeyId,
      paymentId: paymentRecord?.id,
      message: 'Razorpay order created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Razorpay: Verify Payment Signature
 * POST /api/verify-payment or POST /api/payments/verify
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export async function verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured on the server',
      });
    }

    const order_id = req.body.razorpay_order_id || req.body.order_id;
    const payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    // Generate expected HMAC-SHA256 signature
    const text = `${order_id}|${payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    const isMatch = generatedSignature === signature;

    if (!isMatch) {
      // Find matching payment record if any and mark as FAILED
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: order_id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: 'FAILED',
            failureReason: 'Signature mismatch verification failed',
          },
        });

        await prisma.property.update({
          where: { id: payment.propertyId },
          data: { status: 'DRAFT' },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch',
      });
    }

    // Signatures match! Update database record if exists
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: order_id },
      include: { plan: true },
    });

    let updatedPayment: any = null;
    if (payment) {
      [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: 'SUCCESS',
            razorpayPaymentId: payment_id,
            razorpaySignature: signature,
            transactionId: payment_id,
          },
        }),
        prisma.property.update({
          where: { id: payment.propertyId },
          data: { status: 'PENDING_APPROVAL' },
        }),
      ]);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order_id,
      payment_id,
      payment: updatedPayment || undefined,
    });
  } catch (error) {
    next(error);
  }
}

// Aliases for backwards compatibility with existing route references
export const createOrder = createRazorpayOrder;
export const verifyPayment = verifyRazorpayPayment;

/**
 * Webhook handler for Cashfree (legacy fallback)
 */
export async function cashfreeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    if (signature && timestamp && process.env.CASHFREE_SECRET_KEY) {
      try {
        const isValid = cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
        if (!isValid) {
          res.status(400).json({ error: 'Invalid webhook signature' });
          return;
        }
      } catch (e) {
        res.status(400).json({ error: 'Signature verification error' });
        return;
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.type as string;
    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;

    if (event === 'PAYMENT_SUCCESS_WEBHOOK' && orderData?.order_id) {
      const payment = await prisma.payment.findFirst({
        where: { cfOrderId: orderData.order_id },
      });
      if (payment && payment.paymentStatus === 'PENDING') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: 'SUCCESS',
              transactionId: paymentData?.cf_payment_id?.toString(),
              paymentMethod: paymentData?.payment_method
                ? JSON.stringify(paymentData.payment_method)
                : null,
            },
          }),
          prisma.property.update({
            where: { id: payment.propertyId },
            data: { status: 'PENDING_APPROVAL' },
          }),
        ]);
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
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
