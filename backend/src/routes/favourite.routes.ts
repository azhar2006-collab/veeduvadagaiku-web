import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { toggleFavourite, getFavouriteIds } from '../controllers/favourite.controller';

const router = Router();

router.use(authenticate);
router.post('/:propertyId', toggleFavourite);
router.get('/', getFavouriteIds);

export default router;
