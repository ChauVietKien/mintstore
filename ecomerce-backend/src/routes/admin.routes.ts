import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';
import { getAdminOrders, updateOrderStatus } from '../controllers/admin/order.controller.js';
import { createProduct, toggleProductAvailability, deleteProduct } from '../controllers/admin/product.controller.js';
import { getAdminUsers } from '../controllers/admin/user.controller.js';

const router = Router();

// Tất cả các route bên dưới đều bắt buộc có JWT Token hợp lệ VÀ có quyền ADMIN
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// Quản lý đơn hàng
router.get('/orders', getAdminOrders as any);
router.patch('/orders/:id/status', updateOrderStatus as any);

// Quản lý sản phẩm thực đơn
router.post('/products', createProduct as any);
router.patch('/products/:id/toggle', toggleProductAvailability as any);
router.delete('/products/:id', deleteProduct as any);

//Router lay danh sach nguoi dung
router.get('/users', getAdminUsers as any)

export default router;
