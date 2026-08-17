import { Request, Response } from 'express';
import { getAllAdminOrdersFromDb, updateOrderStatusInDb } from '../../services/order.service.js';

export async function getAdminOrders(req: Request, res: Response) {
  try {
    const orders = await getAllAdminOrdersFromDb();
    res.status(200).json({ status: 'success', data: orders });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateOrderStatusInDb(id, status);
    res.status(200).json({ status: 'success', message: 'Đã cập nhật trạng thái đơn hàng.', data: updated });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}
