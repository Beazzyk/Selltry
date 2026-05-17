import { Request, Response, NextFunction } from 'express';
import { CategoryType, Platform } from '@prisma/client';
import * as categoryService from '../services/category.service';
import * as platformCategoryService from '../services/platform-category.service';
import { getCategorySyncJobStatus } from '../jobs/category-sync.job';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const validType = type && Object.values(CategoryType).includes(type as CategoryType)
      ? (type as CategoryType)
      : undefined;
    const tree = await categoryService.getCategoryTree(validType);
    res.json(tree);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const types = await categoryService.getCategoryTypes();
    res.json(types);
  } catch (err) {
    next(err);
  }
}

export async function getBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    if (!type || !Object.values(CategoryType).includes(type as CategoryType)) {
      res.status(400).json({ error: 'Valid ?type= required' });
      return;
    }
    const brands = await categoryService.getBrands(type as CategoryType);
    res.json(brands);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleMakes(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const makes = await categoryService.getVehicleMakes(type as string | undefined);
    res.json(makes);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleModels(req: Request, res: Response, next: NextFunction) {
  try {
    const models = await categoryService.getVehicleModels(req.params.makeId);
    res.json(models);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleGenerations(req: Request, res: Response, next: NextFunction) {
  try {
    const generations = await categoryService.getVehicleGenerations(req.params.modelId);
    res.json(generations);
  } catch (err) {
    next(err);
  }
}

function parsePlatform(raw: string): Platform | null {
  const upper = raw.toUpperCase();
  return Object.values(Platform).includes(upper as Platform) ? (upper as Platform) : null;
}

export async function getPlatformCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = parsePlatform(req.params.platform ?? '');
    if (!platform) { res.status(400).json({ error: 'Unknown platform' }); return; }
    const { parentId } = req.query;
    const categories = await platformCategoryService.getPlatformCategories(
      platform,
      typeof parentId === 'string' ? parentId : undefined,
    );
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function searchPlatformCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = parsePlatform(req.params.platform ?? '');
    if (!platform) { res.status(400).json({ error: 'Unknown platform' }); return; }
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length < 2) { res.status(400).json({ error: '?q= must be at least 2 characters' }); return; }
    const results = await platformCategoryService.searchPlatformCategories(platform, q);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getPlatformCategorySyncStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = parsePlatform(req.params.platform ?? '');
    if (!platform) { res.status(400).json({ error: 'Unknown platform' }); return; }
    const status = await platformCategoryService.getSyncStatus(platform);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

export async function triggerPlatformCategorySync(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = parsePlatform(req.params.platform ?? '');
    if (!platform) { res.status(400).json({ error: 'Unknown platform' }); return; }
    const { jobId } = await platformCategoryService.triggerSync(platform, (req as AuthRequest).userId);
    res.status(202).json({ jobId, status: 'queued' });
  } catch (err) {
    next(err);
  }
}

export async function getPlatformCategorySyncJobStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    const status = await getCategorySyncJobStatus(jobId);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

export async function getPlatformCategoryBreadcrumb(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = parsePlatform(req.params.platform ?? '');
    if (!platform) { res.status(400).json({ error: 'Unknown platform' }); return; }
    const breadcrumb = await platformCategoryService.getCategoryBreadcrumb(platform, req.params.externalId);
    res.json(breadcrumb);
  } catch (err) {
    next(err);
  }
}
