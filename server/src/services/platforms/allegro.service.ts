import { Platform, PlatformStatus } from '@prisma/client';
import { env } from '../../utils/env';
import { getPresignedUrl } from '../image.service';
import { uploadImageToAllegro, createAllegroOffer, getAllegroOffer } from '../allegro-api.service';
import { BasePlatformService, ListingWithRelations, PublishResult, SyncStatusResult } from './base.platform.service';
import { mockPublish, mockSync } from './helpers';

const ALLEGRO_WEB = env.ALLEGRO_SANDBOX
  ? 'https://allegro.pl.allegrosandbox.pl'
  : 'https://allegro.pl';

const CONDITION_MAP: Record<string, string> = {
  NEW: 'new',
  USED: 'used',
  DAMAGED: 'used',
};

function mapAllegroStatus(status: string): PlatformStatus {
  switch (status) {
    case 'ACTIVE': return PlatformStatus.ACTIVE;
    case 'ENDED': return PlatformStatus.ENDED;
    case 'ACTIVATING': return PlatformStatus.PENDING;
    default: return PlatformStatus.ENDED;
  }
}

export class AllegroService extends BasePlatformService {
  platform: Platform = 'ALLEGRO';
  mockMode = env.ALLEGRO_MOCK;

  protected async _mockPublish(_listing: ListingWithRelations): Promise<PublishResult> {
    // MOCK MODE — wymaga ALLEGRO_MOCK=false i prawdziwego tokenu
    return mockPublish(this.platform, 'https://allegro.pl/oferta');
  }

  protected async _mockSync(externalId: string): Promise<SyncStatusResult> {
    return mockSync(externalId);
  }

  protected async _realPublish(listing: ListingWithRelations, categoryId: string): Promise<PublishResult> {
    const imageIds: string[] = [];
    for (const img of listing.images.slice(0, 8)) {
      const url = await getPresignedUrl(img.s3Key);
      const id = await uploadImageToAllegro(listing.userId, url);
      imageIds.push(id);
    }

    const payload = {
      name: listing.title,
      category: { id: categoryId },
      parameters: [{ id: 'stan', values: [CONDITION_MAP[listing.condition] ?? 'used'] }],
      images: imageIds.map((imageId) => ({ imageId })),
      description: {
        sections: [{ items: [{ type: 'TEXT', content: listing.description }] }],
      },
      sellingMode: {
        format: 'BUY_NOW',
        price: { amount: Number(listing.basePrice).toFixed(2), currency: listing.currency },
      },
      stock: { available: listing.quantity, unit: 'UNIT' },
    };

    const offer = await createAllegroOffer(listing.userId, payload);

    return {
      externalId: offer.id,
      externalUrl: `${ALLEGRO_WEB}/oferta/${offer.id}`,
      status: 'ACTIVE',
    };
  }

  protected async _realSync(externalId: string, userId: string): Promise<SyncStatusResult> {
    const offer = await getAllegroOffer(userId, externalId);
    return {
      status: mapAllegroStatus(offer.publication?.status ?? ''),
      externalUrl: `${ALLEGRO_WEB}/oferta/${externalId}`,
    };
  }
}
