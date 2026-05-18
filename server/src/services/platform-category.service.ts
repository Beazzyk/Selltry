import { Platform } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { fetchAllAllegroCategoriesAsApp } from './allegro-api.service';
import { fetchAllOlxCategories } from './olx-api.service';
import { fetchAllOtomotoCategories } from './otomoto-api.service';
import { enqueueCategorySync } from '../jobs/category-sync.job';

export interface PlatformCategoryNode {
  id: string;
  externalId: string;
  parentExternalId: string | null;
  name: string;
  isLeaf: boolean;
  depth: number;
}

const SUPPORTED_PLATFORMS: Platform[] = [Platform.ALLEGRO, Platform.OLX, Platform.OTOMOTO];

export function isSyncSupported(platform: Platform): boolean {
  return SUPPORTED_PLATFORMS.includes(platform);
}

export async function getPlatformCategories(
  platform: Platform,
  parentId?: string,
): Promise<PlatformCategoryNode[]> {
  return prisma.platformCategory.findMany({
    where: {
      platform,
      parentExternalId: parentId != null && parentId !== '' ? parentId : null,
    },
    orderBy: { name: 'asc' },
    select: { id: true, externalId: true, parentExternalId: true, name: true, isLeaf: true, depth: true },
    take: 500,
  });
}

export async function searchPlatformCategories(
  platform: Platform,
  query: string,
): Promise<PlatformCategoryNode[]> {
  return prisma.platformCategory.findMany({
    where: {
      platform,
      name: { contains: query, mode: 'insensitive' },
    },
    orderBy: { name: 'asc' },
    select: { id: true, externalId: true, parentExternalId: true, name: true, isLeaf: true, depth: true },
    take: 100,
  });
}

export async function getCategoryBreadcrumb(
  platform: Platform,
  categoryExternalId: string,
): Promise<PlatformCategoryNode[]> {
  const path: PlatformCategoryNode[] = [];
  let currentId: string | null = categoryExternalId;

  while (currentId) {
    // eslint-disable-next-line no-await-in-loop
    const found: PlatformCategoryNode | null = await prisma.platformCategory.findUnique({
      where: { platform_externalId: { platform, externalId: currentId } },
      select: { id: true, externalId: true, parentExternalId: true, name: true, isLeaf: true, depth: true },
    });
    if (!found) break;
    path.unshift(found);
    currentId = found.parentExternalId;
  }

  return path;
}

export async function getSyncStatus(
  platform: Platform,
): Promise<{ count: number; lastSync: Date | null; supported: boolean }> {
  const supported = isSyncSupported(platform);
  if (!supported) return { count: 0, lastSync: null, supported: false };

  const [count, latest] = await Promise.all([
    prisma.platformCategory.count({ where: { platform } }),
    prisma.platformCategory.findFirst({
      where: { platform },
      orderBy: { syncedAt: 'desc' },
      select: { syncedAt: true },
    }),
  ]);

  return { count, lastSync: latest?.syncedAt ?? null, supported: true };
}

export async function triggerSync(platform: Platform, userId: string): Promise<{ jobId: string }> {
  if (!isSyncSupported(platform)) {
    throw new Error(`Category sync not supported for platform: ${platform}`);
  }
  return enqueueCategorySync({ platform, userId });
}

export async function executeSync(platform: Platform, userId: string): Promise<{ upserted: number }> {
  if (!isSyncSupported(platform)) {
    throw new Error(`Category sync not supported for platform: ${platform}`);
  }

  let rawCategories: Array<{
    externalId: string;
    parentExternalId: string | null;
    name: string;
    isLeaf: boolean;
    depth: number;
  }>;

  switch (platform) {
    case Platform.ALLEGRO:
      rawCategories = await fetchAllAllegroCategoriesAsApp();
      break;
    case Platform.OLX:
      rawCategories = await fetchAllOlxCategories(userId ?? '');
      break;
    case Platform.OTOMOTO:
      rawCategories = await fetchAllOtomotoCategories(userId);
      break;
    default:
      throw new Error(`Unhandled platform: ${platform}`);
  }

  return { upserted: await upsertPlatformCategories(platform, rawCategories) };
}

async function upsertPlatformCategories(
  platform: Platform,
  items: Array<{
    externalId: string;
    parentExternalId: string | null;
    name: string;
    isLeaf: boolean;
    depth: number;
  }>,
): Promise<number> {
  const now = new Date();
  const BATCH = 100;
  let total = 0;

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    await Promise.all(
      batch.map((item) =>
        prisma.platformCategory.upsert({
          where: { platform_externalId: { platform, externalId: item.externalId } },
          create: { ...item, platform, syncedAt: now },
          update: {
            name: item.name,
            isLeaf: item.isLeaf,
            parentExternalId: item.parentExternalId,
            depth: item.depth,
            syncedAt: now,
          },
        }),
      ),
    );
    total += batch.length;
  }

  return total;
}
