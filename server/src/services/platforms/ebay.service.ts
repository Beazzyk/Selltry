import { Platform } from '@prisma/client';
import { env } from '../../utils/env';
import { BasePlatformService, ListingWithRelations, PublishResult, SyncStatusResult } from './base.platform.service';
import { mockPublish, mockSync } from './helpers';

export class EbayService extends BasePlatformService {
  platform: Platform = 'EBAY';
  mockMode = env.EBAY_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga EBAY_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://ebay.com/itm');
  }

  protected async _mockSync(externalId: string): Promise<SyncStatusResult> {
    return mockSync(externalId);
  }

  protected async _realPublish(_listing: ListingWithRelations, _categoryId: string): Promise<PublishResult> {
    throw new Error('Real eBay API not implemented yet');
  }

  protected async _realSync(_externalId: string, _userId: string): Promise<SyncStatusResult> {
    throw new Error('Real eBay sync not implemented yet');
  }
}
