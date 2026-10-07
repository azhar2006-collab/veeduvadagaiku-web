import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  cashfreeWebhook,
  getPaymentHistory,
} from '../controllers/payment.controller';

const router = Router();

// Razorpay standard checkout endpoints
router.post('/create-order', optionalAuth, createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);
router.post('/verify-payment', verifyRazorpayPayment);

// Payment history
router.get('/history', authenticate, requireOwner, getPaymentHistory);

// Legacy Cashfree webhook
router.post('/webhook', cashfreeWebhook as any);

export default router;
