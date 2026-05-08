import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/platform.controller';
import * as olxCtrl from '../controllers/olx.controller';
import * as ebayCtrl from '../controllers/ebay.controller';
import * as otomotoCtrl from '../controllers/otomoto.controller';

const router = Router();

// Callbacki OAuth — bez auth (wywołuje zewnętrzny serwer)
router.get('/platforms/allegro/oauth/callback', ctrl.getAllegroOAuthCallback);
router.get('/platforms/olx/oauth/callback', ctrl.getOlxOAuthCallback);
router.get('/platforms/ebay/oauth/callback', ebayCtrl.getEbayOAuthCallback);

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
router.get('/platforms/otomoto/categories/:categoryId', otomotoCtrl.getOtomotoCategory);
router.get('/platforms/otomoto/adverts', otomotoCtrl.getOtomotoAdverts);

// OLX OAuth
router.get('/platforms/olx/oauth/start', ctrl.getOlxOAuthStart);
router.get('/platforms/olx/delivery/settings', olxCtrl.getOlxDeliverySettings);
router.get('/platforms/olx/categories/:categoryId/attributes', olxCtrl.getOlxCategoryAttributes);
router.get('/platforms/olx/adverts', olxCtrl.getOlxAdverts);

// eBay OAuth + diagnostics
router.get('/platforms/ebay/oauth/start', ebayCtrl.getEbayOAuthStart);
router.get('/platforms/ebay/policies/fulfillment', ebayCtrl.getEbayFulfillmentPolicies);
router.get('/platforms/ebay/policies/payment', ebayCtrl.getEbayPaymentPolicies);
router.get('/platforms/ebay/policies/return', ebayCtrl.getEbayReturnPolicies);
router.get('/platforms/ebay/offers', ebayCtrl.getEbayOffers);

export default router;
