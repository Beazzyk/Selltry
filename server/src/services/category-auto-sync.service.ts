import { Platform } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { enqueueCategorySync } from '../jobs/category-sync.job';
import { isSyncSupported } from './platform-category.service';

const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dni

async function isSyncStale(platform: Platform): Promise<boolean> {
  const latest = await prisma.platformCategory.findFirst({
    where: { platform },
    orderBy: { syncedAt: 'desc' },
    select: { syncedAt: true },
  });
  return !latest || Date.now() - latest.syncedAt.getTime() > STALE_MS;
}

async function findAnyActiveUser(platform: Platform): Promise<string | null> {
  const record = await prisma.userPlatform.findFirst({
    where: { platform, isActive: true },
    select: { userId: true },
  });
  return record?.userId ?? null;
}

// Allegro — używa tokenu aplikacji (userId = 'system')
// OLX/Otomoto — używa tokenu usera; userId przekazany z callbacku OAuth lub szukany w DB
export async function triggerSyncIfNeeded(platform: Platform, userId?: string): Promise<void> {
  if (!isSyncSupported(platform)) return;

  const stale = await isSyncStale(platform);
  if (!stale) return;

  let syncUserId = userId ?? 'system';

  if (platform !== Platform.ALLEGRO && syncUserId === 'system') {
    const found = await findAnyActiveUser(platform);
    if (!found) {
      console.log(`[AutoSync] ${platform}: no active user, skipping`);
      return;
    }
    syncUserId = found;
  }

  console.log(`[AutoSync] Queueing ${platform} category sync`);
  enqueueCategorySync({ platform, userId: syncUserId }).catch((err: Error) =>
    console.warn(`[AutoSync] Failed to enqueue ${platform}:`, err.message),
  );
}

export async function triggerStartupSync(): Promise<void> {
  const platforms: Platform[] = [Platform.ALLEGRO, Platform.OLX, Platform.OTOMOTO];
  await Promise.allSettled(platforms.map((p) => triggerSyncIfNeeded(p)));
}
