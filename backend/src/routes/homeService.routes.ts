import { Router } from 'express';
import {
  getHomeServices,
  getHomeServiceById,
  createHomeService,
  updateHomeServiceStatus,
  deleteHomeService,
} from '../controllers/homeService.controller';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

router.get('/', getHomeServices);
router.get('/:id', getHomeServiceById);
router.post('/', authenticate, requireOwner, createHomeService);      // Only Owners & Admin can upload
router.put('/:id/status', authenticate, requireAdmin, updateHomeServiceStatus); // admin only
router.delete('/:id', authenticate, requireAdmin, deleteHomeService);   // admin only

export default router;
