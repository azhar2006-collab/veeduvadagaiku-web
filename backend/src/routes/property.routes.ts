import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireOwner } from '../middleware/ownerAuth';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import {
  listProperties, getProperty, getLocalities,
  createProperty, updateProperty, deleteProperty,
  getOwnerProperties, uploadImages, deleteImage, reorderImages,
} from '../controllers/property.controller';

const router = Router();

// Public routes
router.get('/', optionalAuth, listProperties);
router.get('/localities', getLocalities);
router.get('/owner/list', authenticate, requireOwner, getOwnerProperties);
router.get('/:id', optionalAuth, getProperty);

// Owner routes
router.post('/', authenticate, requireOwner, createProperty);
router.put('/:id', authenticate, requireOwner, updateProperty);
router.delete('/:id', authenticate, requireOwner, deleteProperty);
router.post('/:id/images', authenticate, requireOwner, uploadLimiter, upload.array('images', 10), uploadImages);
router.delete('/:id/images/:imageId', authenticate, requireOwner, deleteImage);
router.put('/:id/images/reorder', authenticate, requireOwner, reorderImages);

export default router;
