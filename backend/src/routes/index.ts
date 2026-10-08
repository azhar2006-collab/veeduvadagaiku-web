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
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Direct checkout endpoints (Cashfree primary, Razorpay fallback supported)
router.post('/create-order', optionalAuth, createOrder);
router.post('/verify-payment', verifyPayment);

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
