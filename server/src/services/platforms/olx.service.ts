import { Platform, PlatformStatus } from '@prisma/client';
import { env } from '../../utils/env';
import { createAdvert, buildAdvertPayload, getImagePresignedUrls, getAdvert } from '../olx-api.service';
import { toPlainText } from '../../utils/description-converter';
import { BasePlatformService, ListingWithRelations, PublishResult, SyncStatusResult } from './base.platform.service';
import { mockPublish, mockSync } from './helpers';

function mapOlxStatus(status: string): PlatformStatus {
  switch (status) {
    case 'active':
    case 'limited': return PlatformStatus.ACTIVE;
    case 'removed':
    case 'outdated': return PlatformStatus.ENDED;
    default: return PlatformStatus.PENDING;
  }
}

export class OlxService extends BasePlatformService {
  platform: Platform = 'OLX';
  mockMode = env.OLX_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga OLX_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://olx.pl/oferta');
  }

  protected async _mockSync(externalId: string): Promise<SyncStatusResult> {
    return mockSync(externalId);
  }

  protected async _realPublish(listing: ListingWithRelations, categoryId: string): Promise<PublishResult> {
    const imageUrls = await getImagePresignedUrls(
      listing.images.slice(0, 8).map((img) => img.s3Key),
    );

    const payload = buildAdvertPayload({
      title: listing.title,
      description: toPlainText(listing.description),
      categoryId,
      condition: listing.condition,
      basePrice: Number(listing.basePrice),
      currency: listing.currency,
      imageUrls,
    });

    const advert = await createAdvert(listing.userId, payload);

    return {
      externalId: String(advert.id),
      externalUrl: advert.url ?? `https://www.olx.pl/oferta/${advert.id}`,
      status: 'ACTIVE',
    };
  }

  protected async _realSync(externalId: string, userId: string): Promise<SyncStatusResult> {
    const advert = await getAdvert(userId, externalId);
    return {
      status: mapOlxStatus(String(advert.status ?? '')),
      externalUrl: String(advert.url ?? ''),
    };
  }
}
