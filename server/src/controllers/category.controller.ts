import { Request, Response, NextFunction } from 'express';
import { CategoryType, Platform } from '@prisma/client';
import * as categoryService from '../services/category.service';
import * as platformCategoryService from '../services/platform-category.service';
import { getCategorySyncJobStatus } from '../jobs/category-sync.job';
import { AuthRequest } from '../middleware/auth.middleware';
import { syncIcecatBrands, isIcecatConfigured } from '../services/icecat.service';

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

export async function getCategoryMappings(req: Request, res: Response, next: NextFunction) {
  try {
    const mappings = await categoryService.getCategoryMappingsExport();
    res.json(mappings);
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

export async function syncAllPlatformCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthRequest).userId;
    const results: Record<string, unknown> = {};

    // Allegro — app token, zawsze działa
    try {
      const { jobId } = await platformCategoryService.triggerSync('ALLEGRO' as import('@prisma/client').Platform, userId);
      results['ALLEGRO'] = { status: 'queued', jobId };
    } catch (err) {
      results['ALLEGRO'] = { status: 'error', error: String(err) };
    }

    // OLX — publiczne API
    try {
      const { jobId } = await platformCategoryService.triggerSync('OLX' as import('@prisma/client').Platform, userId);
      results['OLX'] = { status: 'queued', jobId };
    } catch (err) {
      results['OLX'] = { status: 'error', error: String(err) };
    }

    // Icecat brands (opcjonalnie, gdy skonfigurowane)
    if (isIcecatConfigured()) {
      try {
        const icecat = await syncIcecatBrands();
        results['ICECAT_BRANDS'] = { status: 'done', upserted: icecat.upserted };
      } catch (err) {
        results['ICECAT_BRANDS'] = { status: 'error', error: String(err) };
      }
    } else {
      results['ICECAT_BRANDS'] = { status: 'skipped', reason: 'ICECAT_USERNAME/ICECAT_PASSWORD not set' };
    }

    res.status(202).json(results);
  } catch (err) {
    next(err);
  }
}

export async function syncIcecatBrandsEndpoint(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isIcecatConfigured()) {
      res.status(400).json({ error: 'ICECAT_USERNAME i ICECAT_PASSWORD muszą być ustawione w .env' });
      return;
    }
    const result = await syncIcecatBrands();
    res.json({ status: 'done', ...result });
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
