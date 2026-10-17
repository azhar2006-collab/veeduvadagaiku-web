import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import {
  createCashfreeOrder,
  verifyCashfreePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  cashfreeWebhook,
  getPaymentHistory,
} from '../controllers/payment.controller';

const router = Router();

// Primary Razorpay endpoints
router.post('/create-order', optionalAuth, createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);
router.post('/verify-payment', verifyRazorpayPayment);

// Explicit Razorpay endpoints
router.post('/razorpay/create-order', optionalAuth, createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Cashfree endpoints (falls back to Razorpay if Cashfree unconfigured)
router.post('/cashfree/create-order', optionalAuth, createCashfreeOrder);
router.post('/cashfree/verify', verifyCashfreePayment);

// Payment history
router.get('/history', authenticate, requireOwner, getPaymentHistory);

// Cashfree webhook
router.post('/webhook', cashfreeWebhook as any);

export default router;
