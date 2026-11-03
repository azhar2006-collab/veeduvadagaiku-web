import { Router } from 'express';
import {
  getHomeServices,
  getHomeServiceById,
  createHomeService,
  updateHomeServiceStatus,
  deleteHomeService,
} from '../controllers/homeService.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

router.get('/', getHomeServices);
router.get('', getHomeServices);
router.get('/:id', getHomeServiceById);
router.post('/', optionalAuth, createHomeService);
router.post('', optionalAuth, createHomeService);
router.post('/create', optionalAuth, createHomeService);
router.put('/:id/status', authenticate, requireAdmin, updateHomeServiceStatus); // admin only
router.delete('/:id', authenticate, requireAdmin, deleteHomeService);   // admin only

export default router;
