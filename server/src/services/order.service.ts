import { OrderStatus, Platform, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { enrichImagesWithUrls } from './image.service';

const ORDER_WITH_ITEMS = {
  items: true,
  listing: {
    select: {
      id: true,
      title: true,
      images: { take: 1, orderBy: { order: 'asc' as const } },
    },
  },
} satisfies Prisma.OrderInclude;

export interface OrderFilters {
  platform?: Platform;
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export type RawOrderInput = {
  externalOrderId: string;
  status: OrderStatus;
  buyerLogin?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  deliveryAddress?: object;
  totalAmount: number;
  currency?: string;
  platformOrderUrl?: string;
  items: { externalId?: string; title: string; quantity: number; unitPrice: number }[];
};

export async function listOrders(userId: string, filters: OrderFilters = {}) {
  const { platform, status, search, page = 1, limit = 20 } = filters;

  const where: Prisma.OrderWhereInput = {
    userId,
    ...(platform && { platform }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { externalOrderId: { contains: search, mode: 'insensitive' } },
        { buyerLogin: { contains: search, mode: 'insensitive' } },
        { buyerFirstName: { contains: search, mode: 'insensitive' } },
        { buyerLastName: { contains: search, mode: 'insensitive' } },
        { items: { some: { title: { contains: search, mode: 'insensitive' } } } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: ORDER_WITH_ITEMS,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const enriched = await Promise.all(
    items.map(async (order) => ({
      ...order,
      listing: order.listing
        ? { ...order.listing, images: await enrichImagesWithUrls(order.listing.images) }
        : null,
    })),
  );

  return { items: enriched, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: ORDER_WITH_ITEMS,
  });
  if (!order) throw new AppError(404, 'Order not found');

  return {
    ...order,
    listing: order.listing
      ? { ...order.listing, images: await enrichImagesWithUrls(order.listing.images) }
      : null,
  };
}

export async function updateOrderStatus(userId: string, orderId: string, status: OrderStatus) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new AppError(404, 'Order not found');
  return prisma.order.update({
    where: { id: orderId },
    data: { status, updatedAt: new Date() },
    include: ORDER_WITH_ITEMS,
  });
}

export async function upsertOrders(
  userId: string,
  platform: Platform,
  orders: RawOrderInput[],
): Promise<number> {
  let count = 0;
  for (const raw of orders) {
    const { items, ...orderData } = raw;
    await prisma.order.upsert({
      where: { platform_externalOrderId: { platform, externalOrderId: raw.externalOrderId } },
      create: {
        ...orderData,
        userId,
        platform,
        totalAmount: new Prisma.Decimal(orderData.totalAmount),
        currency: orderData.currency ?? 'PLN',
        syncedAt: new Date(),
        items: { create: items.map((i) => ({ ...i, unitPrice: new Prisma.Decimal(i.unitPrice) })) },
      },
      update: { status: orderData.status, syncedAt: new Date() },
    });
    count++;
  }
  return count;
}

export async function getOrderStats(userId: string) {
  const counts = await prisma.order.groupBy({
    by: ['status'],
    where: { userId },
    _count: { id: true },
  });
  return Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
}
