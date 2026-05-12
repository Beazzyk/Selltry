import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import * as olxApiService from '../services/olx-api.service';

function userId(req: Request): string {
  return (req as AuthRequest).userId;
}

const olxCategoryAttributesSchema = z.object({
  categoryId: z.string().min(1),
});

export async function getOlxDeliverySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await olxApiService.getDeliverySettings(userId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getOlxCategoryAttributes(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = olxCategoryAttributesSchema.parse(req.params);
    const data = await olxApiService.getCategoryAttributes(userId(req), categoryId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getOlxAdverts(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await olxApiService.getAdverts(userId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
}
