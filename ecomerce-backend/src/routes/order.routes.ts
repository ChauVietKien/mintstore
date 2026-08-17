import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Lấy danh sách đơn hàng của user đã đăng nhập
router.get('/me', authenticateToken as any, getMyOrders as any);

// Route Đặt hàng công khai cho Khách (POST /api/orders)
router.post('/', createOrder);

export default router;
