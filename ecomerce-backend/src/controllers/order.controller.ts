import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { createOrderInDb, getOrdersByUserIdFromDb } from '../services/order.service.js';
import { getJwtSecret } from '../utils/jwt.js';

export async function createOrder(req: Request, res: Response) {
  try {
    const { customerName, customerPhone, shippingAddress, items } = req.body;
    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp đầy đủ thông tin nhận hàng và món ăn.' });
    }

    let userId = null;
    const token = req.cookies?.token;

    if (token) {
      try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret) as any;
        userId = decoded.userId;
      } catch (err) {
        console.warn('Cookie token provided but invalid in createOrder:', err);
      }
    }

    const newOrder = await createOrderInDb(req.body, userId);
    res.status(201).json({ status: 'success', message: 'Đặt hàng thành công!', data: newOrder });
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function getMyOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Không tìm thấy thông tin xác thực.' });
    }

    const orders = await getOrdersByUserIdFromDb(userId);
    res.status(200).json({ status: 'success', data: orders });
  } catch (error: any) {
    console.error('Lỗi khi lấy đơn hàng của user:', error.message);
    res.status(500).json({ status: 'error', message: 'Lỗi server khi lấy đơn hàng.' });
  }
}
