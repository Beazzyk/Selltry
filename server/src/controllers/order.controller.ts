import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus, Platform } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import * as orderService from '../services/order.service';
import { syncOrdersForUser } from '../services/order-sync.service';

function userId(req: Request) { return (req as AuthRequest).userId; }

const STATUS_ENUM = z.enum([
  'NEW','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURNED','REFUNDED',
]);

const filterSchema = z.object({
  platform: z.enum(['ALLEGRO','OVOKO','OTOMOTO','OLX','EBAY']).optional(),
  status: STATUS_ENUM.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = filterSchema.parse(req.query);
    res.json(await orderService.listOrders(userId(req), {
      ...filters,
      platform: filters.platform as Platform | undefined,
      status: filters.status as OrderStatus | undefined,
    }));
  } catch (err) { next(err); }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await orderService.getOrder(userId(req), req.params.id));
  } catch (err) { next(err); }
}

export async function patchOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = z.object({ status: STATUS_ENUM }).parse(req.body);
    res.json(await orderService.updateOrderStatus(userId(req), req.params.id, status as OrderStatus));
  } catch (err) { next(err); }
}

export async function syncOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = (req.query.platforms as string | undefined)?.split(',') ?? [];
    const platforms = raw
      .map((p) => p.trim().toUpperCase() as Platform)
      .filter((p) => Object.values(Platform).includes(p));
    res.json({ synced: await syncOrdersForUser(userId(req), platforms.length ? platforms : undefined) });
  } catch (err) { next(err); }
}

export async function getOrderStats(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await orderService.getOrderStats(userId(req)));
  } catch (err) { next(err); }
}
