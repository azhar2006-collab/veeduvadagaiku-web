import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { firebaseLogin, getMe } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/firebase-login', authLimiter, firebaseLogin);
router.get('/me', authenticate, getMe);

export default router;
