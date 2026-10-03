import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ApiError } from '../utils/response';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  if (req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
}
