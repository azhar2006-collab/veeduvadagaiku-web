import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import razorpay, { razorpayKeyId, razorpayKeySecret, isRazorpayConfigured } from '../config/razorpay';
import cashfree, { isCashfreeConfigured } from '../config/cashfree';

/**
 * Cashfree: Create Order
 * POST /api/payments/cashfree/create-order or POST /api/payments/create-order
 * Request: { propertyId, planId, amount, currency, returnUrl }
 * Returns: { success: true, payment_session_id, order_id, cf_order_id, amount, currency, paymentId }
 */
export async function createCashfreeOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!isCashfreeConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Cashfree is not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env',
      });
    }

    const { propertyId, planId, currency = 'INR', returnUrl } = req.body;
    let amount = req.body.amount;

    let property: any = null;
    let plan: any = null;
    let owner: any = null;

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

      amount = plan.price;
    }

    if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than 0',
      });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const finalReturnUrl =
      returnUrl ||
      `${frontendUrl}/owner/payment/result?order_id={order_id}&propertyId=${propertyId || ''}`;

    const customerId = req.user?.id ? `cust_${req.user.id.slice(0, 20)}` : `cust_${Date.now()}`;
    const customerPhone = req.user?.mobile || '9999999999';
    const customerEmail = req.user?.email || 'customer@veeduvadagaiku.com';
    const customerName = req.user?.name || 'Valued Customer';

    const cfOrderRequest = {
      order_id: orderId,
      order_amount: Number(amount.toFixed(2)),
      order_currency: currency || 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: finalReturnUrl,
      },
    };

    let cfResponse: any;
    try {
      cfResponse = await cashfree.PGCreateOrder(cfOrderRequest);
    } catch (cfErr: any) {
      const errMsg = cfErr?.response?.data?.message || cfErr?.message || 'Cashfree order creation failed';
      return res.status(500).json({
        success: false,
        message: errMsg,
      });
    }

    const cfData = cfResponse.data;

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
          cfOrderId: orderId,
          paymentSessionId: cfData.payment_session_id,
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
      payment_session_id: cfData.payment_session_id,
      order_id: cfData.order_id,
      cf_order_id: cfData.cf_order_id,
      amount: cfData.order_amount,
      currency: cfData.order_currency,
      paymentId: paymentRecord?.id,
      message: 'Cashfree order created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cashfree: Verify Order Status
 * POST /api/payments/cashfree/verify
 * Request: { order_id }
 */
export async function verifyCashfreePayment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isCashfreeConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Cashfree is not configured',
      });
    }

    const orderId = req.body.order_id || req.body.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'order_id is required',
      });
    }

    // Fetch order from Cashfree
    let cfOrder: any;
    try {
      const orderRes = await cashfree.PGFetchOrder(orderId);
      cfOrder = orderRes.data;
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.response?.data?.message || err?.message || 'Failed to fetch Cashfree order',
      });
    }

    const orderStatus = cfOrder.order_status; // PAID, ACTIVE, EXPIRED, TERMINATED

    // Find payment record in DB
    const payment = await prisma.payment.findFirst({
      where: { cfOrderId: orderId },
      include: { plan: true, property: true },
    });

    if (orderStatus === 'PAID') {
      let transactionId = orderId;
      let paymentMethod: string | null = null;

      try {
        const paymentsRes = await cashfree.PGOrderFetchPayments(orderId);
        if (paymentsRes.data && paymentsRes.data.length > 0) {
          const successPayment = paymentsRes.data.find((p: any) => p.payment_status === 'SUCCESS') || paymentsRes.data[0];
          transactionId = String(successPayment.cf_payment_id || orderId);
          paymentMethod = successPayment.payment_group || null;
        }
      } catch (payErr) {
        // Log and continue with default transactionId
        console.warn('Could not fetch payment transactions for order:', orderId, payErr);
      }

      let updatedPayment: any = payment;
      if (payment) {
        [updatedPayment] = await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: 'SUCCESS',
              transactionId,
              paymentMethod,
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
        status: 'PAID',
        message: 'Payment verified successfully',
        order_id: orderId,
        payment: updatedPayment || undefined,
      });
    } else if (orderStatus === 'ACTIVE') {
      return res.status(200).json({
        success: false,
        status: 'PENDING',
        message: 'Payment is pending. Complete the transaction in the checkout.',
        order_id: orderId,
      });
    } else {
      // Mark as failed if in DB
      if (payment && payment.paymentStatus === 'PENDING') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: 'FAILED',
              failureReason: `Cashfree order status: ${orderStatus}`,
            },
          }),
          prisma.property.update({
            where: { id: payment.propertyId },
            data: { status: 'DRAFT' },
          }),
        ]);
      }

      return res.status(400).json({
        success: false,
        status: orderStatus,
        message: `Payment not completed. Status: ${orderStatus}`,
        order_id: orderId,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Razorpay: Create Order
 * POST /api/create-order
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

      amount = Math.round(plan.price * 100);
    }

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
      receipt: String(orderReceipt).slice(0, 40),
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
 */
export async function verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const order_id = req.body.razorpay_order_id || req.body.order_id || req.body.orderId;
    const payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const signature = req.body.razorpay_signature || req.body.signature;

    // If no signature or payment_id is provided, check if this is a Cashfree order!
    if (!signature && !payment_id && order_id) {
      return verifyCashfreePayment(req, res, next);
    }

    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured on the server',
      });
    }

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const text = `${order_id}|${payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    const isMatch = generatedSignature === signature;

    if (!isMatch) {
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

// Unified default exports: prioritize Cashfree for createOrder and verifyPayment
export const createOrder = createCashfreeOrder;
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.body.razorpay_signature || req.body.signature;
  if (signature) {
    return verifyRazorpayPayment(req, res, next);
  }
  return verifyCashfreePayment(req, res, next);
};

/**
 * Webhook handler for Cashfree
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
