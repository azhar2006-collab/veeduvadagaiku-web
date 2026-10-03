import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/database';
import { ApiError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string | null;
    mobile?: string | null;
    name: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, mobile: true, name: true, status: true },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account suspended or deleted');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, email: true, mobile: true, name: true, status: true },
      });
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
}
