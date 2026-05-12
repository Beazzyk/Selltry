import { Platform, PlatformStatus } from '@prisma/client';
import { env } from '../../utils/env';
import { createImageCollection, createAdvert, buildAdvertPayload, getAccountAdvert } from '../otomoto-api.service';
import { toPlainText } from '../../utils/description-converter';
import { BasePlatformService, ListingWithRelations, PublishResult, SyncStatusResult } from './base.platform.service';
import { mockPublish, mockSync } from './helpers';

function mapOtomotoStatus(status: string): PlatformStatus {
  switch (status) {
    case 'active': return PlatformStatus.ACTIVE;
    case 'inactive':
    case 'removed':
    case 'banned': return PlatformStatus.ENDED;
    default: return PlatformStatus.PENDING;
  }
}

export class OtomotoService extends BasePlatformService {
  platform: Platform = 'OTOMOTO';
  mockMode = env.OTOMOTO_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga OTOMOTO_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://otomoto.pl/oferta');
  }

  protected async _mockSync(externalId: string): Promise<SyncStatusResult> {
    return mockSync(externalId);
  }

  protected async _realPublish(listing: ListingWithRelations, categoryId: string): Promise<PublishResult> {
    let imageCollectionId: string | undefined;
    if (listing.images.length > 0) {
      const s3Keys = listing.images.map((img) => img.s3Key);
      imageCollectionId = await createImageCollection(listing.userId, s3Keys);
    }

    const payload = buildAdvertPayload({
      title: listing.title,
      description: toPlainText(listing.description),
      categoryId,
      condition: listing.condition,
      basePrice: Number(listing.basePrice),
      currency: listing.currency,
      quantity: listing.quantity,
      imageCollectionId,
    });

    const advert = await createAdvert(listing.userId, payload);

    return {
      externalId: String(advert.id),
      externalUrl: advert.url ?? `https://otomoto.pl/oferta/${advert.id}`,
      status: 'ACTIVE',
    };
  }

  protected async _realSync(externalId: string, userId: string): Promise<SyncStatusResult> {
    const advert = await getAccountAdvert(userId, externalId);
    return {
      status: mapOtomotoStatus(String(advert.status ?? '')),
      externalUrl: String(advert.url ?? ''),
    };
  }
}
