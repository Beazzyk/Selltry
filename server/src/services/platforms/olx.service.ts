import { Platform } from '@prisma/client';
import { env } from '../../utils/env';
import { createAdvert, buildAdvertPayload, getImagePresignedUrls } from '../olx-api.service';
import { BasePlatformService, ListingWithRelations, PublishResult } from './base.platform.service';
import { mockPublish } from './helpers';

export class OlxService extends BasePlatformService {
  platform: Platform = 'OLX';
  mockMode = env.OLX_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga OLX_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://olx.pl/oferta');
  }

  protected async _realPublish(listing: ListingWithRelations, categoryId: string): Promise<PublishResult> {
    // 1. Generuj presigned URLs dla zdjęć (OLX przyjmuje URL-e bezpośrednio)
    const imageUrls = await getImagePresignedUrls(
      listing.images.slice(0, 8).map((img) => img.s3Key),
    );

    // 2. Buduj i wyślij ogłoszenie
    const payload = buildAdvertPayload({
      title: listing.title,
      description: listing.description,
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
}
