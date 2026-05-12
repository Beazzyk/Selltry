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
process.env.ALLEGRO_MOCK = 'true';
process.env.OLX_MOCK = 'true';

jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    listing: { update: jest.fn(), findUnique: jest.fn(), findUniqueOrThrow: jest.fn() },
    platformListing: { upsert: jest.fn(), update: jest.fn() },
  },
}));
jest.mock('../../src/services/margin.service', () => ({
  getMarginRules: jest.fn().mockResolvedValue([]),
  calculateFinalPrice: jest.fn().mockReturnValue(100),
}));
jest.mock('../../src/services/title-generator.service', () => ({
  generateTitle: jest.fn().mockResolvedValue('Test Title'),
}));
jest.mock('../../src/services/category.service', () => ({
  getExternalCategoryId: jest.fn().mockResolvedValue('ext-cat-1'),
}));
jest.mock('../../src/services/platforms', () => ({
  getPlatformService: jest.fn(),
}));

import { PlatformStatus, ListingStatus } from '@prisma/client';
import { executePublish, preparePublish } from '../../src/services/listing-publish.service';
import { prisma } from '../../src/utils/prisma';
import { getPlatformService } from '../../src/services/platforms';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetService = getPlatformService as jest.Mock;

const JOB_DATA = { userId: 'user-1', listingId: 'listing-1', platforms: ['ALLEGRO'] };

beforeEach(() => {
  jest.clearAllMocks();
  const mockListing = { id: 'listing-1', basePrice: 100, categoryId: 'cat-1', userId: 'user-1', category: { id: 'cat-1', name: 'Test' } };
  (mockPrisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
  (mockPrisma.listing.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockListing);
  (mockPrisma.listing.update as jest.Mock).mockResolvedValue({});
  (mockPrisma.platformListing.upsert as jest.Mock).mockResolvedValue({});
  (mockPrisma.platformListing.update as jest.Mock).mockResolvedValue({});
});

describe('executePublish', () => {
  it('returns ACTIVE for platform when publish succeeds', async () => {
    mockGetService.mockReturnValue({
      publishListing: jest.fn().mockResolvedValue({
        externalId: 'EXT-1',
        externalUrl: 'https://allegro.pl/oferta/EXT-1',
        status: 'ACTIVE',
      }),
    });

    const results = await executePublish(JOB_DATA);

    expect(results['ALLEGRO']).toBe('ACTIVE');
    expect(mockPrisma.platformListing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: PlatformStatus.ACTIVE, externalId: 'EXT-1' }),
      }),
    );
  });

  it('returns ERROR for platform when publish fails', async () => {
    mockGetService.mockReturnValue({
      publishListing: jest.fn().mockRejectedValue(new Error('API error')),
    });

    const results = await executePublish(JOB_DATA);

    expect(results['ALLEGRO']).toBe('ERROR');
    expect(mockPrisma.platformListing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: PlatformStatus.ERROR, errorMessage: 'API error' }),
      }),
    );
  });

  it('updates listing to ACTIVE when all platforms succeed', async () => {
    mockGetService.mockReturnValue({
      publishListing: jest.fn().mockResolvedValue({ externalId: 'EXT-1', externalUrl: 'url', status: 'ACTIVE' }),
    });

    await executePublish(JOB_DATA);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.ACTIVE } }),
    );
  });

  it('updates listing to ERROR when all platforms fail', async () => {
    mockGetService.mockReturnValue({
      publishListing: jest.fn().mockRejectedValue(new Error('fail')),
    });

    await executePublish(JOB_DATA);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.ERROR } }),
    );
  });

  it('updates listing to PARTIALLY_ACTIVE when some platforms succeed', async () => {
    const data = { ...JOB_DATA, platforms: ['ALLEGRO', 'OLX'] };
    mockGetService
      .mockReturnValueOnce({ publishListing: jest.fn().mockResolvedValue({ externalId: 'E1', externalUrl: 'u1', status: 'ACTIVE' }) })
      .mockReturnValueOnce({ publishListing: jest.fn().mockRejectedValue(new Error('fail')) });

    await executePublish(data);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.PARTIALLY_ACTIVE } }),
    );
  });
});

describe('preparePublish', () => {
  it('sets listing to PUBLISHING and creates PENDING platformListings', async () => {
    await preparePublish('user-1', 'listing-1', ['ALLEGRO']);

    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ListingStatus.PUBLISHING } }),
    );
    expect(mockPrisma.platformListing.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: PlatformStatus.PENDING }),
      }),
    );
  });
});
