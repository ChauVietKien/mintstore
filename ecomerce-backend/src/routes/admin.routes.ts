import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/admin/order.controller.js';

const router = Router();

// Tất cả các route bên dưới đều bắt buộc có JWT Token hợp lệ VÀ có quyền ADMIN
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// Quản lý đơn hàng
router.get('/orders', getAdminOrders as any);
router.patch('/orders/:id/status', updateOrderStatus as any);

export default router;
