import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ApiError } from '../utils/response';

export function requireOwner(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Owner access required');
  }
  next();
}
