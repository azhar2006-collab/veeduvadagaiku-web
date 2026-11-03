import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import {
  registerOwner, getOwnerProfile, updateOwnerProfile,
  getOwnerDashboard, getOwnerEnquiries,
} from '../controllers/owner.controller';

const router = Router();

router.post('/register', authenticate, registerOwner);
router.get('/profile', authenticate, requireOwner, getOwnerProfile);
router.put('/profile', authenticate, requireOwner, updateOwnerProfile);
router.get('/dashboard', authenticate, requireOwner, getOwnerDashboard);
router.get('/enquiries', authenticate, requireOwner, getOwnerEnquiries);

export default router;
