process.env.ENCRYPTION_KEY = 'test-key-exactly-32-characters!!';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters!!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters!';
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_BUCKET = 'test-bucket';
process.env.S3_REGION = 'us-east-1';
process.env.S3_ACCESS_KEY = 'key';
process.env.S3_SECRET_KEY = 'secret';

jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    platformCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('../../src/jobs/category-sync.job', () => ({
  enqueueCategorySync: jest.fn(),
}));

jest.mock('../../src/services/allegro-api.service', () => ({
  fetchAllAllegroCategoriesAsApp: jest.fn(),
}));

jest.mock('../../src/services/olx-api.service', () => ({
  fetchAllOlxCategories: jest.fn(),
}));

jest.mock('../../src/services/otomoto-api.service', () => ({
  fetchAllOtomotoCategories: jest.fn(),
}));

import { Platform } from '@prisma/client';
import {
  isSyncSupported,
  getPlatformCategories,
  searchPlatformCategories,
  getCategoryBreadcrumb,
  getSyncStatus,
} from '../../src/services/platform-category.service';
import { prisma } from '../../src/utils/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => jest.clearAllMocks());

describe('isSyncSupported', () => {
  it('returns true for ALLEGRO', () => expect(isSyncSupported(Platform.ALLEGRO)).toBe(true));
  it('returns true for OLX', () => expect(isSyncSupported(Platform.OLX)).toBe(true));
  it('returns true for OTOMOTO', () => expect(isSyncSupported(Platform.OTOMOTO)).toBe(true));
  it('returns false for EBAY', () => expect(isSyncSupported(Platform.EBAY)).toBe(false));
  it('returns false for OVOKO', () => expect(isSyncSupported(Platform.OVOKO)).toBe(false));
});

describe('getPlatformCategories', () => {
  it('queries root categories (parentExternalId = null) when parentId is undefined', async () => {
    (mockPrisma.platformCategory.findMany as jest.Mock).mockResolvedValue([]);
    await getPlatformCategories(Platform.ALLEGRO, undefined);
    expect(mockPrisma.platformCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ parentExternalId: null }) }),
    );
  });

  it('queries root categories when parentId is empty string', async () => {
    (mockPrisma.platformCategory.findMany as jest.Mock).mockResolvedValue([]);
    await getPlatformCategories(Platform.ALLEGRO, '');
    expect(mockPrisma.platformCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ parentExternalId: null }) }),
    );
  });

  it('queries children when parentId is a non-empty string', async () => {
    (mockPrisma.platformCategory.findMany as jest.Mock).mockResolvedValue([]);
    await getPlatformCategories(Platform.ALLEGRO, 'parent-123');
    expect(mockPrisma.platformCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ parentExternalId: 'parent-123' }) }),
    );
  });
});

describe('searchPlatformCategories', () => {
  it('performs case-insensitive name search and returns results', async () => {
    const nodes = [{ id: '1', externalId: 'e1', parentExternalId: null, name: 'Auto', isLeaf: true, depth: 0 }];
    (mockPrisma.platformCategory.findMany as jest.Mock).mockResolvedValue(nodes);

    const results = await searchPlatformCategories(Platform.ALLEGRO, 'auto');

    expect(mockPrisma.platformCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { platform: Platform.ALLEGRO, name: { contains: 'auto', mode: 'insensitive' } },
      }),
    );
    expect(results).toEqual(nodes);
  });
});

describe('getCategoryBreadcrumb', () => {
  it('returns empty array when category not found', async () => {
    (mockPrisma.platformCategory.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getCategoryBreadcrumb(Platform.ALLEGRO, 'unknown');
    expect(result).toEqual([]);
  });

  it('returns single-element array for a root category', async () => {
    const node = { id: '1', externalId: 'e1', parentExternalId: null, name: 'Root', isLeaf: false, depth: 0 };
    (mockPrisma.platformCategory.findUnique as jest.Mock).mockResolvedValueOnce(node);
    const result = await getCategoryBreadcrumb(Platform.ALLEGRO, 'e1');
    expect(result).toEqual([node]);
  });

  it('returns path from root to leaf for a nested category', async () => {
    const parent = { id: '1', externalId: 'p1', parentExternalId: null, name: 'Parent', isLeaf: false, depth: 0 };
    const child = { id: '2', externalId: 'c1', parentExternalId: 'p1', name: 'Child', isLeaf: true, depth: 1 };
    (mockPrisma.platformCategory.findUnique as jest.Mock)
      .mockResolvedValueOnce(child)
      .mockResolvedValueOnce(parent);

    const result = await getCategoryBreadcrumb(Platform.ALLEGRO, 'c1');
    expect(result).toEqual([parent, child]);
  });

  it('stops traversal when a parent is missing from DB', async () => {
    const child = { id: '2', externalId: 'c1', parentExternalId: 'missing', name: 'Child', isLeaf: true, depth: 1 };
    (mockPrisma.platformCategory.findUnique as jest.Mock)
      .mockResolvedValueOnce(child)
      .mockResolvedValueOnce(null);

    const result = await getCategoryBreadcrumb(Platform.ALLEGRO, 'c1');
    expect(result).toEqual([child]);
  });
});

describe('getSyncStatus', () => {
  it('returns supported: false without hitting DB for unsupported platform', async () => {
    const status = await getSyncStatus(Platform.EBAY);
    expect(status).toEqual({ count: 0, lastSync: null, supported: false });
    expect(mockPrisma.platformCategory.count).not.toHaveBeenCalled();
  });

  it('returns count and lastSync for a supported platform with data', async () => {
    const syncDate = new Date('2026-05-01');
    (mockPrisma.platformCategory.count as jest.Mock).mockResolvedValue(1500);
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue({ syncedAt: syncDate });

    const status = await getSyncStatus(Platform.ALLEGRO);
    expect(status).toEqual({ count: 1500, lastSync: syncDate, supported: true });
  });

  it('returns lastSync: null when no categories exist', async () => {
    (mockPrisma.platformCategory.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue(null);

    const status = await getSyncStatus(Platform.OLX);
    expect(status).toEqual({ count: 0, lastSync: null, supported: true });
  });
});
