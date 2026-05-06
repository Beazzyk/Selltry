import { Platform } from '@prisma/client';
import { env } from '../../utils/env';
import { createImageCollection, createAdvert, buildAdvertPayload } from '../otomoto-api.service';
import { BasePlatformService, ListingWithRelations, PublishResult } from './base.platform.service';
import { mockPublish } from './helpers';

export class OtomotoService extends BasePlatformService {
  platform: Platform = 'OTOMOTO';
  mockMode = env.OTOMOTO_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga OTOMOTO_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://otomoto.pl/oferta');
  }

  protected async _realPublish(listing: ListingWithRelations, categoryId: string): Promise<PublishResult> {
    // 1. Upload zdjęć przez imageCollections API
    let imageCollectionId: string | undefined;
    if (listing.images.length > 0) {
      const s3Keys = listing.images.map((img) => img.s3Key);
      imageCollectionId = await createImageCollection(listing.userId, s3Keys);
    }

    // 2. Buduj i wyślij ogłoszenie
    const payload = buildAdvertPayload({
      title: listing.title,
      description: listing.description,
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
}
