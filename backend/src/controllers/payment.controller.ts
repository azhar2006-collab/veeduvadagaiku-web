import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../utils/validators';
import cashfree from '../config/cashfree';

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { propertyId, planId } = createPaymentOrderSchema.parse(req.body);
    const owner = await prisma.owner.findUnique({ where: { userId: req.user!.id } });
    if (!owner) throw new ApiError(403, 'Owner profile not found');

    const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId: owner.id } });
    if (!property) throw new ApiError(404, 'Property not found or not authorized');

    if (property.status !== 'DRAFT' && property.status !== 'REJECTED') {
      throw new ApiError(400, 'Payment can only be made for draft or rejected properties');
    }

    const plan = await prisma.listingPlan.findFirst({ where: { id: planId, isActive: true } });
    if (!plan) throw new ApiError(404, 'Listing plan not found');

    // Check for pending payment to prevent duplicates
    const existingPending = await prisma.payment.findFirst({
      where: { propertyId, paymentStatus: 'PENDING' },
    });
    if (existingPending) {
      throw new ApiError(409, 'A pending payment already exists for this property');
    }

    const orderId = `vv_${propertyId.slice(0, 8)}_${Date.now()}`;
    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/owner/payment/result?status={payment_status}&orderId=${orderId}`;

    // Create Cashfree order
    const cfResponse = await cashfree.PGCreateOrder({
      order_id: orderId,
      order_amount: plan.price,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user!.id,
        customer_name: req.user!.name || 'Customer',
        customer_email: req.user!.email || 'noreply@veeduvadagaiku.com',
        customer_phone: req.user!.mobile || '9999999999',
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
      },
      order_note: `Listing plan: ${plan.name} for property ${propertyId}`,
    });

    const cfOrderData = cfResponse.data as any;
    const paymentSessionId: string = cfOrderData.payment_session_id;
    const cfOrderId: string = cfOrderData.cf_order_id?.toString() || orderId;

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        userId: req.user!.id,
        ownerId: owner.id,
        propertyId,
        planId,
        amount: plan.price,
        cfOrderId: orderId,
        paymentSessionId,
        paymentStatus: 'PENDING',
      },
    });

    // Update property status
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'PAYMENT_PENDING', planId },
    });

    res.status(201).json(
      successResponse({
        paymentId: payment.id,
        orderId,
        cfOrderId,
        paymentSessionId,
        amount: plan.price,
        currency: 'INR',
      }, 'Payment order created')
    );
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { orderId, paymentId } = verifyPaymentSchema.parse(req.body);

    const payment = await prisma.payment.findFirst({
      where: paymentId ? { id: paymentId, cfOrderId: orderId } : { cfOrderId: orderId },
      include: { plan: true },
    });
    if (!payment) throw new ApiError(404, 'Payment record not found');

    // If already verified via webhook or previous check, return immediately
    if (payment.paymentStatus === 'SUCCESS') {
      res.json(successResponse({ payment }, 'Payment already verified successfully.'));
      return;
    }

    // Fetch payment status from Cashfree
    const cfRes = await cashfree.PGOrderFetchPayments(orderId);
    const paymentsData = cfRes.data as any[];

    const successfulPayment = Array.isArray(paymentsData)
      ? paymentsData.find((p: any) => p.payment_status === 'SUCCESS')
      : null;

    if (successfulPayment) {
      const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: 'SUCCESS',
            transactionId: successfulPayment.cf_payment_id?.toString(),
            paymentMethod: successfulPayment.payment_method
              ? JSON.stringify(successfulPayment.payment_method)
              : null,
          },
        }),
        prisma.property.update({
          where: { id: payment.propertyId },
          data: { status: 'PENDING_APPROVAL' },
        }),
      ]);

      res.json(successResponse({ payment: updatedPayment }, 'Payment verified. Property is now pending admin approval.'));
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: 'FAILED', failureReason: 'Payment not successful per Cashfree' },
      });
      await prisma.property.update({
        where: { id: payment.propertyId },
        data: { status: 'DRAFT' },
      });
      throw new ApiError(400, 'Payment was not successful. Please try again.');
    }
  } catch (error) {
    next(error);
  }
}

export async function cashfreeWebhook(req: AuthRequest, res: Response, next: NextFunction) {
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

    if (event === 'PAYMENT_FAILED_WEBHOOK' && orderData?.order_id) {
      const payment = await prisma.payment.findFirst({
        where: { cfOrderId: orderData.order_id },
      });
      if (payment) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: 'FAILED',
              failureReason: paymentData?.error_details?.error_description || 'Payment failed',
            },
          }),
          prisma.property.update({
            where: { id: payment.propertyId },
            data: { status: 'DRAFT' },
          }),
        ]);
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}

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
