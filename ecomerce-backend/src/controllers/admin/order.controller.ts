import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';

// Dữ liệu mẫu đơn hàng (Mock data nếu chưa kết nối DB)
let mockOrders = [
  {
    id: "ord_101",
    orderNumber: "MINT-8831",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    shippingAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    items: [
      { name: "Trà Olong Ổi Hồng", size: "Lớn", quantity: 2, price: 75000 },
      { name: "Wafu Pasta Heo Nướng", size: "Vừa", quantity: 1, price: 75000 },
    ],
    totalAmount: 225000,
    status: "PENDING",
    paymentMethod: "COD",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ord_102",
    orderNumber: "MINT-8832",
    customerName: "Trần Thị B",
    customerPhone: "0987654321",
    shippingAddress: "45 Lê Lợi, Quận 1, TP.HCM",
    items: [
      { name: "Trà Đá Xay Ổi Hồng Kem Phô Mai", size: "Vừa", quantity: 1, price: 75000 },
    ],
    totalAmount: 75000,
    status: "BREWING",
    paymentMethod: "MOMO",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export async function getAdminOrders(req: AuthenticatedRequest, res: Response) {
  res.status(200).json({
    status: 'success',
    data: mockOrders,
  });
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = mockOrders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ status: 'error', message: 'Không tìm thấy đơn hàng' });
  }

  mockOrders[orderIndex].status = status;

  res.status(200).json({
    status: 'success',
    message: `Đã cập nhật trạng thái đơn ${mockOrders[orderIndex].orderNumber} sang ${status}`,
    data: mockOrders[orderIndex],
  });
}
