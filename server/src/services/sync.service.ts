import { ListingStatus, PlatformStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { getPlatformService } from './platforms';

export interface SyncResult {
  platform: string;
  status: PlatformStatus;
  synced: boolean;
  error?: string;
}

export async function syncListingPlatforms(userId: string, listingId: string): Promise<SyncResult[]> {
  const platformListings = await prisma.platformListing.findMany({
    where: {
      listingId,
      listing: { userId },
      status: { in: [PlatformStatus.ACTIVE, PlatformStatus.PENDING] },
      externalId: { not: null },
    },
  });

  const results: SyncResult[] = [];

  for (const pl of platformListings) {
    try {
      const service = getPlatformService(pl.platform);
      const syncResult = await service.syncStatus(pl.externalId!, userId);

      await prisma.platformListing.update({
        where: { listingId_platform: { listingId, platform: pl.platform } },
        data: {
          status: syncResult.status,
          lastSyncedAt: new Date(),
          ...(syncResult.externalUrl && { externalUrl: syncResult.externalUrl }),
        },
      });

      results.push({ platform: pl.platform, status: syncResult.status, synced: true });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      results.push({ platform: pl.platform, status: pl.status, synced: false, error });
    }
  }

  await updateListingStatus(listingId, results);

  return results;
}

async function updateListingStatus(listingId: string, results: SyncResult[]): Promise<void> {
  if (results.length === 0) return;

  const statuses = results.map((r) => r.status);
  const allActive = statuses.every((s) => s === PlatformStatus.ACTIVE);
  const anyActive = statuses.some((s) => s === PlatformStatus.ACTIVE);
  const allEnded = statuses.every((s) => s === PlatformStatus.ENDED);

  let nextStatus: ListingStatus | null = null;
  if (allActive) nextStatus = ListingStatus.ACTIVE;
  else if (anyActive) nextStatus = ListingStatus.PARTIALLY_ACTIVE;
  else if (allEnded) nextStatus = ListingStatus.ENDED;

  if (nextStatus) {
    await prisma.listing.update({ where: { id: listingId }, data: { status: nextStatus } });
  }
}
