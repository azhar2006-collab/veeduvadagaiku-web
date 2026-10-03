import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import { createOrder, verifyPayment, cashfreeWebhook, getPaymentHistory } from '../controllers/payment.controller';

const router = Router();

// Cashfree webhook — no auth required, signature verified inside controller
router.post('/webhook', cashfreeWebhook as any);

router.post('/create-order', authenticate, requireOwner, createOrder);
router.post('/verify', authenticate, requireOwner, verifyPayment);
router.get('/history', authenticate, requireOwner, getPaymentHistory);

export default router;
