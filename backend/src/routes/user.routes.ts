import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, getUserFavourites, getUserEnquiries } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/favourites', getUserFavourites);
router.get('/enquiries', getUserEnquiries);

export default router;
