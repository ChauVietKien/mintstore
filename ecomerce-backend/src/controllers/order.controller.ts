import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export async function createOrder(req: Request, res: Response) {
  try {
    const { customerName, customerPhone, shippingAddress, note, items, subtotal, shippingFee, totalAmount, paymentMethod } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp đầy đủ thông tin nhận hàng và món ăn.' });
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MINT-${randomCode}`;

    // Tìm một product ID hợp lệ hoặc tạo order với orderItems
    const firstProduct = await prisma.product.findFirst();
    const fallbackProductId = firstProduct?.id;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        shippingAddress,
        note: note || '',
        totalAmount: totalAmount || (subtotal + shippingFee),
        status: OrderStatus.PENDING,
        paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.COD,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || fallbackProductId || '',
            productName: item.name,
            size: item.size || 'Vừa',
            quantity: item.quantity || 1,
            price: item.unitPrice || item.price || 0,
            toppings: item.note || '',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Đặt hàng thành công!',
      data: newOrder,
    });
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng trong DB:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
