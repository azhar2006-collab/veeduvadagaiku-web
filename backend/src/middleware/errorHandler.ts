import { Request, Response, NextFunction } from 'express';
import { ApiError, errorResponse } from '../utils/response';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.statusCode));
    return;
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json(errorResponse(`Validation error: ${messages}`, 400));
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json(errorResponse('Token expired. Please login again.', 401));
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json(errorResponse('Invalid token', 401));
    return;
  }

  // Prisma unique constraint
  if ((err as any).code === 'P2002') {
    res.status(409).json(errorResponse('A record with this data already exists', 409));
    return;
  }

  // Prisma record not found
  if ((err as any).code === 'P2025') {
    res.status(404).json(errorResponse('Record not found', 404));
    return;
  }

  // Generic server error - never expose internal details
  res.status(500).json(errorResponse('An unexpected error occurred. Please try again.', 500));
}
