import { Platform } from '@prisma/client';
import { env } from '../../utils/env';
import { BasePlatformService, ListingWithRelations, PublishResult, SyncStatusResult } from './base.platform.service';
import { mockPublish, mockSync } from './helpers';

export class OvokoService extends BasePlatformService {
  platform: Platform = 'OVOKO';
  mockMode = env.OVOKO_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga OVOKO_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://ovoko.pl/oferta');
  }

  protected async _mockSync(externalId: string): Promise<SyncStatusResult> {
    return mockSync(externalId);
  }

  protected async _realPublish(_listing: ListingWithRelations, _categoryId: string): Promise<PublishResult> {
    throw new Error('Real Ovoko API not implemented yet');
  }

  protected async _realSync(_externalId: string, _userId: string): Promise<SyncStatusResult> {
    throw new Error('Real Ovoko sync not implemented yet');
  }
}
