import { OrderStatus, Platform, Prisma } from '@prisma/client';

// Mock Prisma
jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      groupBy: jest.fn(),
    },
    orderItem: {},
  },
}));

// Mock image service — presigned URLs are not relevant in unit tests
jest.mock('../../src/services/image.service', () => ({
  enrichImagesWithUrls: jest.fn((imgs: unknown[]) =>
    Promise.resolve(imgs.map((img) => ({ ...(img as object), url: 'https://example.com/img.webp' }))),
  ),
}));

import { prisma } from '../../src/utils/prisma';
import {
  listOrders,
  getOrder,
  updateOrderStatus,
  upsertOrders,
  getOrderStats,
} from '../../src/services/order.service';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const BASE_ORDER = {
  id: 'ord-1',
  userId: 'user-1',
  platform: Platform.ALLEGRO,
  externalOrderId: 'ext-001',
  status: 'NEW' as OrderStatus,
  buyerLogin: 'jan123',
  buyerEmail: 'jan@example.com',
  buyerFirstName: 'Jan',
  buyerLastName: 'Kowalski',
  buyerPhone: '500100200',
  deliveryAddress: { street: 'ul. Kwiatowa 1', city: 'Warszawa', zipCode: '00-001' },
  totalAmount: new Prisma.Decimal(250),
  currency: 'PLN',
  platformOrderUrl: null,
  listingId: null,
  syncedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    { id: 'item-1', orderId: 'ord-1', externalId: 'ext-item-1', title: 'Lampa tylna Suzuki Samurai', quantity: 1, unitPrice: new Prisma.Decimal(250), listingId: null },
  ],
  listing: null,
};

describe('listOrders', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns paginated orders with default filters', async () => {
    (mockPrisma.order.count as jest.Mock).mockResolvedValue(1);
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([BASE_ORDER]);

    const result = await listOrders('user-1');

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.pages).toBe(1);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('passes platform filter to Prisma', async () => {
    (mockPrisma.order.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([]);

    await listOrders('user-1', { platform: Platform.OLX });

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ platform: Platform.OLX }) }),
    );
  });

  it('passes status filter to Prisma', async () => {
    (mockPrisma.order.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([]);

    await listOrders('user-1', { status: 'SHIPPED' });

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'SHIPPED' }) }),
    );
  });

  it('builds search OR query when search is provided', async () => {
    (mockPrisma.order.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([]);

    await listOrders('user-1', { search: 'suzuki' });

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it('respects pagination params', async () => {
    (mockPrisma.order.count as jest.Mock).mockResolvedValue(50);
    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const result = await listOrders('user-1', { page: 3, limit: 10 });

    expect(result.pages).toBe(5);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });
});

describe('getOrder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns order when found', async () => {
    (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(BASE_ORDER);

    const result = await getOrder('user-1', 'ord-1');

    expect(result.id).toBe('ord-1');
    expect(result.items).toHaveLength(1);
  });

  it('throws 404 when order not found', async () => {
    (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(getOrder('user-1', 'missing')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('enforces userId ownership', async () => {
    (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(getOrder('other-user', 'ord-1')).rejects.toMatchObject({ statusCode: 404 });
    expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'other-user' }) }),
    );
  });
});

describe('updateOrderStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates status when order belongs to user', async () => {
    (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(BASE_ORDER);
    (mockPrisma.order.update as jest.Mock).mockResolvedValue({ ...BASE_ORDER, status: 'SHIPPED' as OrderStatus, items: BASE_ORDER.items, listing: null });

    const result = await updateOrderStatus('user-1', 'ord-1', 'SHIPPED');

    expect(result.status).toBe('SHIPPED');
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ord-1' }, data: expect.objectContaining({ status: 'SHIPPED' }) }),
    );
  });

  it('throws 404 when order not owned by user', async () => {
    (mockPrisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(updateOrderStatus('other', 'ord-1', 'SHIPPED')).rejects.toMatchObject({ statusCode: 404 });
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });
});

describe('upsertOrders', () => {
  beforeEach(() => jest.clearAllMocks());

  it('upserts each order and returns count', async () => {
    (mockPrisma.order.upsert as jest.Mock).mockResolvedValue(BASE_ORDER);

    const count = await upsertOrders('user-1', Platform.ALLEGRO, [
      {
        externalOrderId: 'ext-001',
        status: 'NEW',
        totalAmount: 250,
        items: [{ title: 'Lampa', quantity: 1, unitPrice: 250 }],
      },
      {
        externalOrderId: 'ext-002',
        status: 'SHIPPED',
        totalAmount: 100,
        items: [{ title: 'Filtr', quantity: 2, unitPrice: 50 }],
      },
    ]);

    expect(count).toBe(2);
    expect(mockPrisma.order.upsert).toHaveBeenCalledTimes(2);
  });

  it('passes correct platform and userId to upsert', async () => {
    (mockPrisma.order.upsert as jest.Mock).mockResolvedValue(BASE_ORDER);

    await upsertOrders('user-42', Platform.OLX, [
      { externalOrderId: 'olx-1', status: 'NEW', totalAmount: 50, items: [] },
    ]);

    expect(mockPrisma.order.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { platform_externalOrderId: { platform: Platform.OLX, externalOrderId: 'olx-1' } },
        create: expect.objectContaining({ userId: 'user-42', platform: Platform.OLX }),
      }),
    );
  });

  it('returns 0 for empty input', async () => {
    const count = await upsertOrders('user-1', Platform.ALLEGRO, []);
    expect(count).toBe(0);
    expect(mockPrisma.order.upsert).not.toHaveBeenCalled();
  });
});

describe('getOrderStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps groupBy result to record', async () => {
    (mockPrisma.order.groupBy as jest.Mock).mockResolvedValue([
      { status: 'NEW', _count: { id: 5 } },
      { status: 'SHIPPED', _count: { id: 2 } },
      { status: 'DELIVERED', _count: { id: 10 } },
    ]);

    const stats = await getOrderStats('user-1');

    expect(stats).toEqual({ NEW: 5, SHIPPED: 2, DELIVERED: 10 });
  });

  it('returns empty object when no orders', async () => {
    (mockPrisma.order.groupBy as jest.Mock).mockResolvedValue([]);

    const stats = await getOrderStats('user-1');

    expect(stats).toEqual({});
  });
});
