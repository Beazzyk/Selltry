import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateDescription } from '../services/description-generator.service';
import { getUserId } from '../utils/request-helpers';
import * as listingService from '../services/listing.service';

const generateSchema = z.object({
  categoryType: z.string().min(1),
  categoryName: z.string().optional(),
  brand: z.string().optional(),
  productModel: z.string().optional(),
  condition: z.enum(['NEW', 'USED', 'DAMAGED']),
  title: z.string().min(3),
  partSide: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().optional(),
  attributes: z.record(z.unknown()).optional(),
});

export async function generateListingDescription(req: Request, res: Response, next: NextFunction) {
  try {
    const input = generateSchema.parse(req.body);
    const html = await generateDescription(input);
    res.json({ description: html });
  } catch (err) {
    next(err);
  }
}

export async function generateFromExistingListing(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = getUserId(req);
    const listing = await listingService.getListing(uid, req.params.id);
    const attrs = (listing.attributes ?? {}) as Record<string, unknown>;

    const html = await generateDescription({
      categoryType: 'AUTOMOTIVE',
      condition: listing.condition,
      title: listing.title,
      partSide: listing.partSide ?? undefined,
      vehicleYear: listing.vehicleYearRaw ?? undefined,
      attributes: attrs,
    });

    res.json({ description: html });
  } catch (err) {
    next(err);
  }
}
