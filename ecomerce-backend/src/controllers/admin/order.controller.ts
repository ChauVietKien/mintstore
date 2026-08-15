import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';
import prisma from '../../utils/prisma.js';
import { OrderStatus } from '@prisma/client';

export async function getAdminOrders(req: AuthenticatedRequest, res: Response) {
  try {
    // Đơn hàng đặt trước sẽ xếp ở trên cùng (FIFO - createdAt: asc)
    const dbOrders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format dữ liệu gửi cho Admin UI
    const formattedOrders = dbOrders.map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      shippingAddress: ord.shippingAddress,
      note: ord.note,
      items: ord.items.map((i) => ({
        name: i.productName,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
        note: i.toppings,
      })),
      subtotal: ord.totalAmount - 15000 > 0 ? ord.totalAmount - 15000 : ord.totalAmount,
      shippingFee: 15000,
      totalAmount: ord.totalAmount,
      status: ord.status,
      paymentMethod: ord.paymentMethod,
      createdAt: new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(ord.createdAt).getTime(),
    }));

    res.status(200).json({
      status: 'success',
      data: formattedOrders,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách đơn hàng từ DB:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
      },
      include: {
        items: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: `Đã cập nhật trạng thái đơn ${updatedOrder.orderNumber} sang ${status}`,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng trong DB:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
