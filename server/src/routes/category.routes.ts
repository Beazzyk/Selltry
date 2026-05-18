import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/category.controller';

const router = Router();

router.use(authMiddleware);

router.get('/categories/mappings', ctrl.getCategoryMappings);
router.get('/categories', ctrl.getCategories);
router.get('/vehicles/makes', ctrl.getVehicleMakes);
router.get('/vehicles/makes/:makeId/models', ctrl.getVehicleModels);
router.get('/vehicles/models/:modelId/generations', ctrl.getVehicleGenerations);

// Kategorie pobierane z API platform (Allegro, OLX, Otomoto)
// Stały segment /sync-jobs musi być przed parametrycznym /:platform
router.get('/platform/sync-jobs/:jobId', ctrl.getPlatformCategorySyncJobStatus);
router.get('/platform/:platform', ctrl.getPlatformCategories);
router.get('/platform/:platform/search', ctrl.searchPlatformCategories);
router.get('/platform/:platform/sync-status', ctrl.getPlatformCategorySyncStatus);
router.post('/platform/:platform/sync', ctrl.triggerPlatformCategorySync);
router.get('/platform/:platform/breadcrumb/:externalId', ctrl.getPlatformCategoryBreadcrumb);

export default router;
