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

import { PlatformStatus, ListingStatus } from '@prisma/client';

jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    platformListing: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    listing: {
      update: jest.fn(),
    },
  },
}));

jest.mock('../../src/services/platforms', () => ({
  getPlatformService: jest.fn(),
}));

import { syncListingPlatforms } from '../../src/services/sync.service';
import { prisma } from '../../src/utils/prisma';
import { getPlatformService } from '../../src/services/platforms';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetService = getPlatformService as jest.Mock;

const LISTING_ID = 'listing-1';
const USER_ID = 'user-1';

function makePlatformListing(overrides = {}) {
  return {
    listingId: LISTING_ID,
    platform: 'ALLEGRO',
    externalId: 'EXT-123',
    status: PlatformStatus.ACTIVE,
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe('syncListingPlatforms', () => {
  it('syncs active platform listing and updates status + lastSyncedAt', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([
      makePlatformListing(),
    ]);
    (mockPrisma.platformListing.update as jest.Mock).mockResolvedValue({});
    (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});

    mockGetService.mockReturnValue({
      syncStatus: jest.fn().mockResolvedValue({ status: PlatformStatus.ACTIVE }),
    });

    const results = await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ platform: 'ALLEGRO', status: PlatformStatus.ACTIVE, synced: true });
    expect(mockPrisma.platformListing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: PlatformStatus.ACTIVE, lastSyncedAt: expect.any(Date) }),
      }),
    );
  });

  it('skips platform listings without externalId', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([]);

    const results = await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(results).toHaveLength(0);
    expect(mockPrisma.platformListing.update).not.toHaveBeenCalled();
  });

  it('records error and keeps existing status when sync throws', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([
      makePlatformListing({ status: PlatformStatus.ACTIVE }),
    ]);
    (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});

    mockGetService.mockReturnValue({
      syncStatus: jest.fn().mockRejectedValue(new Error('API timeout')),
    });

    const results = await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(results[0]).toMatchObject({ synced: false, error: 'API timeout', status: PlatformStatus.ACTIVE });
    expect(mockPrisma.platformListing.update).not.toHaveBeenCalled();
  });

  it('updates main listing to ACTIVE when all platforms ACTIVE', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([
      makePlatformListing({ platform: 'ALLEGRO' }),
      makePlatformListing({ platform: 'OLX', externalId: 'EXT-456' }),
    ]);
    (mockPrisma.platformListing.update as jest.Mock).mockResolvedValue({});
    (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});

    mockGetService.mockReturnValue({
      syncStatus: jest.fn().mockResolvedValue({ status: PlatformStatus.ACTIVE }),
    });

    await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.ACTIVE } }),
    );
  });

  it('updates main listing to PARTIALLY_ACTIVE when only some platforms ACTIVE', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([
      makePlatformListing({ platform: 'ALLEGRO' }),
      makePlatformListing({ platform: 'OLX', externalId: 'EXT-456' }),
    ]);
    (mockPrisma.platformListing.update as jest.Mock).mockResolvedValue({});
    (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});

    mockGetService
      .mockReturnValueOnce({ syncStatus: jest.fn().mockResolvedValue({ status: PlatformStatus.ACTIVE }) })
      .mockReturnValueOnce({ syncStatus: jest.fn().mockResolvedValue({ status: PlatformStatus.ENDED }) });

    await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.PARTIALLY_ACTIVE } }),
    );
  });

  it('updates main listing to ENDED when all platforms ENDED', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([
      makePlatformListing({ status: PlatformStatus.ACTIVE }),
    ]);
    (mockPrisma.platformListing.update as jest.Mock).mockResolvedValue({});
    (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});

    mockGetService.mockReturnValue({
      syncStatus: jest.fn().mockResolvedValue({ status: PlatformStatus.ENDED }),
    });

    await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.ENDED } }),
    );
  });

  it('updates externalUrl when sync returns a new one', async () => {
    (mockPrisma.platformListing.findMany as jest.Mock).mockResolvedValue([makePlatformListing()]);
    (mockPrisma.platformListing.update as jest.Mock).mockResolvedValue({});
    (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});

    mockGetService.mockReturnValue({
      syncStatus: jest.fn().mockResolvedValue({
        status: PlatformStatus.ACTIVE,
        externalUrl: 'https://allegro.pl/oferta/EXT-123',
      }),
    });

    await syncListingPlatforms(USER_ID, LISTING_ID);

    expect(mockPrisma.platformListing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ externalUrl: 'https://allegro.pl/oferta/EXT-123' }),
      }),
    );
  });
});
