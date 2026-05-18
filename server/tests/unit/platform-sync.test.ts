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
process.env.OTOMOTO_MOCK = 'true';
process.env.EBAY_MOCK = 'true';
process.env.OVOKO_MOCK = 'true';

import { PlatformStatus } from '@prisma/client';
import { AllegroService } from '../../src/services/platforms/allegro.service';
import { OlxService } from '../../src/services/platforms/olx.service';
import { OtomotoService } from '../../src/services/platforms/otomoto.service';
import { EbayService } from '../../src/services/platforms/ebay.service';
import { OvokoService } from '../../src/services/platforms/ovoko.service';

describe('platform mockSync', () => {
  it('AllegroService.syncStatus returns ACTIVE in mock mode', async () => {
    const service = new AllegroService();
    const result = await service.syncStatus('MOCK-ALLEGRO-123', 'user-1');
    expect(result.status).toBe(PlatformStatus.ACTIVE);
  });

  it('OlxService.syncStatus returns ACTIVE in mock mode', async () => {
    const service = new OlxService();
    const result = await service.syncStatus('MOCK-OLX-123', 'user-1');
    expect(result.status).toBe(PlatformStatus.ACTIVE);
  });

  it('OtomotoService.syncStatus returns ACTIVE in mock mode', async () => {
    const service = new OtomotoService();
    const result = await service.syncStatus('MOCK-OTOMOTO-123', 'user-1');
    expect(result.status).toBe(PlatformStatus.ACTIVE);
  });

  it('EbayService.syncStatus returns ACTIVE in mock mode', async () => {
    const service = new EbayService();
    const result = await service.syncStatus('MOCK-EBAY-123', 'user-1');
    expect(result.status).toBe(PlatformStatus.ACTIVE);
  });

  it('OvokoService.syncStatus returns ACTIVE in mock mode', async () => {
    const service = new OvokoService();
    const result = await service.syncStatus('MOCK-OVOKO-123', 'user-1');
    expect(result.status).toBe(PlatformStatus.ACTIVE);
  });

  it('EbayService._realSync throws not-implemented error', async () => {
    const service = new EbayService();
    service.mockMode = false;
    await expect(service.syncStatus('EXT-123', 'user-1')).rejects.toThrow('not implemented');
  });

  it('OvokoService._realSync throws not-implemented error', async () => {
    const service = new OvokoService();
    service.mockMode = false;
    await expect(service.syncStatus('EXT-123', 'user-1')).rejects.toThrow('not implemented');
  });
});
