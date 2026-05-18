import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/order.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.getOrders);
router.get('/stats', ctrl.getOrderStats);
router.post('/sync', ctrl.syncOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id/status', ctrl.patchOrderStatus);

export default router;
