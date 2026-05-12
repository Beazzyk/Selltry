import { Request } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export function getUserId(req: Request): string {
  return (req as AuthRequest).userId;
}
