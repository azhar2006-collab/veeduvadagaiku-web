import { Router } from 'express';
import { listPlans, getPlan } from '../controllers/plan.controller';

const router = Router();

router.get('/', listPlans);
router.get('/:id', getPlan);

export default router;
