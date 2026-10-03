import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { successResponse, ApiError } from '../utils/response';
import { createPlanSchema } from '../utils/validators';

export async function listPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.listingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(successResponse(plans));
  } catch (error) {
    next(error);
  }
}

export async function getPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await prisma.listingPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) throw new ApiError(404, 'Plan not found');
    res.json(successResponse(plan));
  } catch (error) {
    next(error);
  }
}

// Admin-only
export async function createPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createPlanSchema.parse(req.body);
    const plan = await prisma.listingPlan.create({ data });
    res.status(201).json(successResponse(plan, 'Plan created'));
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createPlanSchema.partial().parse(req.body);
    const plan = await prisma.listingPlan.update({ where: { id: req.params.id }, data });
    res.json(successResponse(plan, 'Plan updated'));
  } catch (error) {
    next(error);
  }
}

export async function deletePlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.listingPlan.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json(successResponse(null, 'Plan deactivated'));
  } catch (error) {
    next(error);
  }
}
