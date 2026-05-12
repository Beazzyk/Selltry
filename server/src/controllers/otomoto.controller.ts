import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import * as otomotoApiService from '../services/otomoto-api.service';

function userId(req: Request): string {
  return (req as AuthRequest).userId;
}

const categoryParamsSchema = z.object({
  categoryId: z.string().min(1),
});

export async function getOtomotoCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = categoryParamsSchema.parse(req.params);
    const data = await otomotoApiService.getCategory(userId(req), categoryId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getOtomotoAdverts(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await otomotoApiService.getAccountAdverts(userId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
}
