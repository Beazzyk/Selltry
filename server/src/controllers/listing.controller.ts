import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import * as listingService from '../services/listing.service';
import * as imageService from '../services/image.service';
import * as titleGeneratorService from '../services/title-generator.service';
import { ListingStatus, Platform, PlatformStatus } from '@prisma/client';
import * as syncService from '../services/sync.service';
import * as publishService from '../services/listing-publish.service';
import { enqueuePublish } from '../jobs/publish.job';
import { prisma } from '../utils/prisma';

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  basePrice: z.number().positive(),
  condition: z.enum(['NEW', 'USED', 'DAMAGED']),
  quantity: z.number().int().positive().optional(),
  identMethod: z.enum(['VIN', 'CATALOG_NUMBER', 'MANUAL', 'AI_PARSED']),
  vin: z.string().optional(),
  catalogNumber: z.string().optional(),
  vehicleType: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'OTHER']),
  vehicleMakeId: z.string().optional(),
  vehicleModelId: z.string().optional(),
  vehicleGenId: z.string().optional(),
  vehicleYearRaw: z.number().int().optional(),
  vehicleEngine: z.string().optional(),
  categoryId: z.string().min(1),
  partSide: z.string().optional(),
  partDetails: z.string().optional(),
  damageDescription: z.string().optional(),
  rawUserInput: z.string().optional(),
});

const filterSchema = z.object({
  status: z.nativeEnum(ListingStatus).optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const publishSchema = z.object({
  platforms: z.array(z.enum(['ALLEGRO', 'OVOKO', 'OTOMOTO', 'OLX', 'EBAY'])).min(1),
});

function userId(req: Request): string {
  return (req as AuthRequest).userId;
}

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const listing = await listingService.createListing(userId(req), data);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const filter = filterSchema.parse(req.query);
    const result = await listingService.getListings(userId(req), filter);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await listingService.getListing(userId(req), req.params.id);
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

export async function updateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchema.partial().parse(req.body);
    const listing = await listingService.updateListing(userId(req), req.params.id, data);
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(req: Request, res: Response, next: NextFunction) {
  try {
    await listingService.deleteListing(userId(req), req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function duplicateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await listingService.duplicateListing(userId(req), req.params.id);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

export async function uploadImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const listing = await listingService.getListing(userId(req), req.params.id);
    const existingCount = listing.images.length;

    const uploaded = await Promise.all(
      files.map((file, i) =>
        imageService.uploadImage(
          file.buffer,
          req.params.id,
          existingCount + i,
          existingCount === 0 && i === 0,
        ),
      ),
    );

    res.status(201).json({ uploaded: uploaded.length });
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    await imageService.deleteImage(req.params.imageId, userId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getListingTitles(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findFirst({
      where: { id: req.params.id, userId: userId(req) },
      include: { category: true },
    });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    const titles = await titleGeneratorService.generateTitleForAllPlatforms(listing);
    res.json({ titles, limits: titleGeneratorService.getTitleLimits() });
  } catch (err) {
    next(err);
  }
}

export async function publishListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { platforms } = publishSchema.parse(req.body);
    const uid = userId(req);
    const listing = await listingService.getListing(uid, req.params.id);

    if (!listing.title || !listing.categoryId || listing.images.length === 0) {
      res.status(400).json({ error: 'Listing must have title, category and images' });
      return;
    }

    const activePlatforms = await prisma.userPlatform.findMany({
      where: { userId: uid, platform: { in: platforms as Platform[] }, isActive: true },
      select: { platform: true },
    });
    const activeSet = new Set(activePlatforms.map((p) => p.platform));
    const disconnected = platforms.filter((p) => !activeSet.has(p as Platform));
    if (disconnected.length > 0) {
      res.status(400).json({ error: `Disconnected platforms: ${disconnected.join(', ')}` });
      return;
    }

    await publishService.preparePublish(uid, listing.id, platforms);

    try {
      await enqueuePublish({ userId: uid, listingId: listing.id, platforms });
      res.status(202).json({ queued: true, message: 'Publication queued' });
    } catch {
      // Redis unavailable — fall back to synchronous publish
      console.warn('[publishListing] Redis unavailable, publishing synchronously');
      const results = await publishService.executePublish({ userId: uid, listingId: listing.id, platforms });
      res.status(200).json({ queued: false, results });
    }
  } catch (err) {
    next(err);
  }
}

export async function getPublishStatus(req: Request, res: Response, next: NextFunction) {
  try {
    await listingService.getListing(userId(req), req.params.id);
    const statuses = await prisma.platformListing.findMany({
      where: { listingId: req.params.id },
      select: { platform: true, status: true, externalUrl: true, lastSyncedAt: true, errorMessage: true },
    });
    res.json(Object.fromEntries(statuses.map((item) => [item.platform, {
      status: item.status,
      externalUrl: item.externalUrl,
      lastSyncedAt: item.lastSyncedAt,
      errorMessage: item.errorMessage,
    }])));
  } catch (err) {
    next(err);
  }
}

export async function syncStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = userId(req);
    await listingService.getListing(uid, req.params.id);
    const results = await syncService.syncListingPlatforms(uid, req.params.id);
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = userId(req);
    const [totalListings, activeListings, draftListings, errorListings, endedListings, recentListings, byPlatform, connectedPlatforms] = await Promise.all([
      prisma.listing.count({ where: { userId: uid } }),
      prisma.listing.count({ where: { userId: uid, status: ListingStatus.ACTIVE } }),
      prisma.listing.count({ where: { userId: uid, status: ListingStatus.DRAFT } }),
      prisma.listing.count({ where: { userId: uid, status: ListingStatus.ERROR } }),
      prisma.listing.count({ where: { userId: uid, status: ListingStatus.ENDED } }),
      prisma.listing.findMany({
        where: { userId: uid },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { images: { take: 1, orderBy: { order: 'asc' } }, platformListings: { select: { platform: true, status: true } } },
      }),
      prisma.platformListing.groupBy({
        by: ['platform'],
        where: { listing: { userId: uid }, status: PlatformStatus.ACTIVE },
        _count: { _all: true },
      }),
      prisma.userPlatform.findMany({
        where: { userId: uid, isActive: true },
        select: { platform: true },
      }),
    ]);

    res.json({
      totalListings,
      activeListings,
      draftListings,
      errorListings,
      endedListings,
      listingsByPlatform: byPlatform.map((item) => ({ platform: item.platform, active: item._count._all })),
      connectedPlatforms: connectedPlatforms.map((p) => p.platform),
      recentListings,
    });
  } catch (err) {
    next(err);
  }
}
