import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/platform.controller';

const router = Router();

// Callbacki OAuth — bez auth (wywołuje zewnętrzny serwer)
router.get('/platforms/allegro/oauth/callback', ctrl.getAllegroOAuthCallback);
router.get('/platforms/olx/oauth/callback', ctrl.getOlxOAuthCallback);

router.use(authMiddleware);

// Ogólne
router.get('/platforms', ctrl.getPlatforms);
router.get('/platforms/:platform/test', ctrl.testPlatformConnection);
router.post('/platforms/:platform/connect', ctrl.connectPlatform);
router.delete('/platforms/:platform', ctrl.disconnectPlatform);

// Allegro OAuth
router.get('/platforms/allegro/oauth/start', ctrl.getAllegroOAuthStart);
router.get('/platforms/allegro/categories', ctrl.getAllegroCategories);
router.post('/platforms/allegro/mappings', ctrl.saveAllegroMappings);

// Otomoto — password grant (username/password konta Otomoto Business)
router.post('/platforms/otomoto/connect', ctrl.connectOtomoto);

// OLX OAuth
router.get('/platforms/olx/oauth/start', ctrl.getOlxOAuthStart);

export default router;
