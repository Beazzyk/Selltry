import { ListingStatus, Platform, PlatformStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import * as marginService from './margin.service';
import * as titleGeneratorService from './title-generator.service';
import * as categoryService from './category.service';
import { getPlatformService } from './platforms';

export interface PublishJobData {
  userId: string;
  listingId: string;
  platforms: string[];
}

export async function preparePublish(userId: string, listingId: string, platforms: string[]): Promise<void> {
  const marginRules = await marginService.getMarginRules(userId);

  await prisma.listing.update({ where: { id: listingId }, data: { status: ListingStatus.PUBLISHING } });

  for (const platform of platforms) {
    const rule = marginRules.find((r) => r.platform === platform);
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    const finalPrice = marginService.calculateFinalPrice(Number(listing!.basePrice), rule ?? null);
    const platformTitle = await titleGeneratorService.generateTitle(listing as never, platform as Platform);

    await prisma.platformListing.upsert({
      where: { listingId_platform: { listingId, platform: platform as Platform } },
      create: { listingId, platform: platform as Platform, finalPrice, platformTitle, status: PlatformStatus.PENDING },
      update: { finalPrice, platformTitle, status: PlatformStatus.PENDING, errorMessage: null },
    });
  }
}

export async function executePublish(data: PublishJobData): Promise<Record<string, string>> {
  const { userId, listingId, platforms } = data;
  const results: Record<string, string> = {};

  for (const platform of platforms) {
    try {
      const categoryId = await categoryService.getExternalCategoryId(listingId, platform as Platform);
      const dbListing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { category: true, images: true },
      });
      const service = getPlatformService(platform as Platform);
      const result = await service.publishListing(dbListing!, categoryId);

      await prisma.platformListing.update({
        where: { listingId_platform: { listingId, platform: platform as Platform } },
        data: { externalId: result.externalId, externalUrl: result.externalUrl, status: PlatformStatus.ACTIVE, publishedAt: new Date() },
      });
      results[platform] = 'ACTIVE';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await prisma.platformListing.update({
        where: { listingId_platform: { listingId, platform: platform as Platform } },
        data: { status: PlatformStatus.ERROR, errorMessage: message },
      });
      results[platform] = 'ERROR';
    }
  }

  await updateListingStatus(listingId, results, userId);
  return results;
}

async function updateListingStatus(
  listingId: string,
  results: Record<string, string>,
  _userId: string,
): Promise<void> {
  const values = Object.values(results);
  const allActive = values.every((s) => s === 'ACTIVE');
  const anyActive = values.some((s) => s === 'ACTIVE');
  const nextStatus = allActive ? ListingStatus.ACTIVE : anyActive ? ListingStatus.PARTIALLY_ACTIVE : ListingStatus.ERROR;
  await prisma.listing.update({ where: { id: listingId }, data: { status: nextStatus } });
}
