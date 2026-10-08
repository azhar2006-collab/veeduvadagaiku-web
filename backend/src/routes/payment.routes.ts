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

// Primary Cashfree endpoints
router.post('/cashfree/create-order', optionalAuth, createCashfreeOrder);
router.post('/cashfree/verify', verifyCashfreePayment);

// Generic checkout endpoints (Cashfree default)
router.post('/create-order', optionalAuth, createCashfreeOrder);
router.post('/verify', verifyCashfreePayment);
router.post('/verify-payment', verifyCashfreePayment);

// Razorpay endpoints (for backwards compatibility)
router.post('/razorpay/create-order', optionalAuth, createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Payment history
router.get('/history', authenticate, requireOwner, getPaymentHistory);

// Cashfree webhook
router.post('/webhook', cashfreeWebhook as any);

export default router;
