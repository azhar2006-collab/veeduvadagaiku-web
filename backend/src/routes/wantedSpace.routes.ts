import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  listWantedSpaces,
  getWantedSpace,
  createWantedSpace,
  updateWantedSpace,
  initiateWantedSpacePayment,
  verifyWantedSpacePayment,
  myWantedSpaces,
  markWantedSpaceFulfilled,
  deleteWantedSpace,
  renewWantedSpace,
  adminListWantedSpaces,
  adminApproveWantedSpace,
  adminRejectWantedSpace,
  adminRemoveWantedSpace,
  wantedSpaceWebhook,
} from '../controllers/wantedSpace.controller';

const router = Router();

// Public
router.get('/', optionalAuth, listWantedSpaces);
router.get('/:id', optionalAuth, getWantedSpace);

// Webhook (no auth)
router.post('/webhook', wantedSpaceWebhook);

// Authenticated user routes
router.post('/', authenticate, createWantedSpace);
router.put('/:id', authenticate, updateWantedSpace);
router.post('/:id/payment/initiate', authenticate, initiateWantedSpacePayment);
router.post('/payment/verify', authenticate, verifyWantedSpacePayment);
router.get('/my/requirements', authenticate, myWantedSpaces);
router.patch('/:id/fulfill', authenticate, markWantedSpaceFulfilled);
router.delete('/:id', authenticate, deleteWantedSpace);
router.post('/:id/renew', authenticate, renewWantedSpace);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, adminListWantedSpaces);
router.patch('/admin/:id/approve', authenticate, requireAdmin, adminApproveWantedSpace);
router.patch('/admin/:id/reject', authenticate, requireAdmin, adminRejectWantedSpace);
router.patch('/admin/:id/remove', authenticate, requireAdmin, adminRemoveWantedSpace);

export default router;
