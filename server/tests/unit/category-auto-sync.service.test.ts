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
    platformCategory: { findFirst: jest.fn() },
    userPlatform: { findFirst: jest.fn() },
  },
}));

jest.mock('../../src/jobs/category-sync.job', () => ({
  enqueueCategorySync: jest.fn().mockResolvedValue({ jobId: 'job-1' }),
}));

jest.mock('../../src/services/platform-category.service', () => ({
  isSyncSupported: jest.fn().mockReturnValue(true),
}));

import { Platform } from '@prisma/client';
import { triggerSyncIfNeeded } from '../../src/services/category-auto-sync.service';
import { prisma } from '../../src/utils/prisma';
import { enqueueCategorySync } from '../../src/jobs/category-sync.job';
import { isSyncSupported } from '../../src/services/platform-category.service';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockEnqueue = enqueueCategorySync as jest.Mock;
const mockIsSyncSupported = isSyncSupported as jest.Mock;

const STALE_DATE = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
const FRESH_DATE = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

beforeEach(() => {
  jest.clearAllMocks();
  mockIsSyncSupported.mockReturnValue(true);
});

describe('triggerSyncIfNeeded', () => {
  it('skips when platform sync is not supported', async () => {
    mockIsSyncSupported.mockReturnValue(false);
    await triggerSyncIfNeeded(Platform.EBAY);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('skips when categories are still fresh (< 7 days old)', async () => {
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue({ syncedAt: FRESH_DATE });
    await triggerSyncIfNeeded(Platform.ALLEGRO);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('enqueues Allegro sync with userId "system" when stale', async () => {
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue({ syncedAt: STALE_DATE });
    await triggerSyncIfNeeded(Platform.ALLEGRO);
    expect(mockEnqueue).toHaveBeenCalledWith({ platform: Platform.ALLEGRO, userId: 'system' });
  });

  it('enqueues Allegro sync when no categories exist (first run)', async () => {
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue(null);
    await triggerSyncIfNeeded(Platform.ALLEGRO);
    expect(mockEnqueue).toHaveBeenCalledWith({ platform: Platform.ALLEGRO, userId: 'system' });
  });

  it('enqueues OLX sync with the explicitly provided userId', async () => {
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue({ syncedAt: STALE_DATE });
    await triggerSyncIfNeeded(Platform.OLX, 'user-42');
    expect(mockEnqueue).toHaveBeenCalledWith({ platform: Platform.OLX, userId: 'user-42' });
  });

  it('skips OLX sync when stale but no active user account exists', async () => {
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue({ syncedAt: STALE_DATE });
    (mockPrisma.userPlatform.findFirst as jest.Mock).mockResolvedValue(null);
    await triggerSyncIfNeeded(Platform.OLX);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('enqueues OLX sync with a found active user when no userId provided', async () => {
    (mockPrisma.platformCategory.findFirst as jest.Mock).mockResolvedValue({ syncedAt: STALE_DATE });
    (mockPrisma.userPlatform.findFirst as jest.Mock).mockResolvedValue({ userId: 'user-99' });
    await triggerSyncIfNeeded(Platform.OLX);
    // fire-and-forget: give the queued promise time to settle
    await new Promise((r) => setTimeout(r, 50));
    expect(mockEnqueue).toHaveBeenCalledWith({ platform: Platform.OLX, userId: 'user-99' });
  });
});
