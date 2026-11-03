import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  email?: string | null;
  mobile?: string | null;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}
