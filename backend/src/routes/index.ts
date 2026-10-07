import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import ownerRoutes from './owner.routes';
import propertyRoutes from './property.routes';
import paymentRoutes from './payment.routes';
import enquiryRoutes from './enquiry.routes';
import favouriteRoutes from './favourite.routes';
import planRoutes from './plan.routes';
import adminRoutes from './admin.routes';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/payment.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Direct Razorpay Standard Checkout endpoints (POST /api/create-order, POST /api/verify-payment)
router.post('/create-order', optionalAuth, createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);

// Modular domain routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/owners', ownerRoutes);
router.use('/properties', propertyRoutes);
router.use('/payments', paymentRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/favourites', favouriteRoutes);
router.use('/plans', planRoutes);
router.use('/admin', adminRoutes);

export default router;
