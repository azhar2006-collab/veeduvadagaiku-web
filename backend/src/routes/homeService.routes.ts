import { Router } from 'express';
import {
  getHomeServices,
  getHomeServiceById,
  createHomeService,
  updateHomeServiceStatus,
  deleteHomeService,
} from '../controllers/homeService.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getHomeServices);
router.get('/:id', getHomeServiceById);
router.post('/', createHomeService);                            // public submit
router.put('/:id/status', authenticate, updateHomeServiceStatus); // admin
router.delete('/:id', authenticate, deleteHomeService);         // admin

export default router;
