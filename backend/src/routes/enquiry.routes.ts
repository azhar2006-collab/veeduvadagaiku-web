import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import { createEnquiry, updateEnquiryStatus } from '../controllers/enquiry.controller';

const router = Router();

router.post('/', authenticate, createEnquiry);
router.put('/:id/status', authenticate, requireOwner, updateEnquiryStatus);

export default router;
