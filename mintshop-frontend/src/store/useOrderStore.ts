import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';
import { api } from '@/lib/api';

export type OrderStatus = 'PENDING' | 'BREWING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  timestamp: number;
}

interface OrderStore {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  createOrder: (data: {
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    note?: string;
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    paymentMethod: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const defaultOrders: Order[] = [
  {
    id: "ord_101",
    orderNumber: "MINT-8831",
    customerName: "Nguyễn Văn A (Đơn 1 - Đặt 20 phút trước)",
    customerPhone: "0901234567",
    shippingAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    note: "Giao giờ hành chính",
    items: [
      { name: "Trà Olong Ổi Hồng", size: "Lớn", quantity: 2, price: 75000, note: "50% Đường, ít đá" },
      { name: "Wafu Pasta Heo Nướng", size: "Vừa", quantity: 1, price: 75000 },
    ],
    subtotal: 225000,
    shippingFee: 15000,
    totalAmount: 240000,
    status: "PENDING",
    paymentMethod: "COD",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now() - 20 * 60 * 1000,
  },
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: defaultOrders,

      fetchOrders: async () => {
        try {
          const res = await api.get('/admin/orders');
          if (res.data?.data && Array.isArray(res.data.data)) {
            set({ orders: res.data.data });
          }
        } catch (error) {
          console.warn('Chưa thể tải đơn hàng từ PostgreSQL DB Server.');
        }
      },

      createOrder: async (data) => {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `MINT-${randomCode}`;
        const now = Date.now();
        const id = `ord_${now}`;

        const orderItems: OrderItem[] = data.items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.unitPrice,
          note: item.note,
        }));

        const newOrder: Order = {
          id,
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          note: data.note,
          items: orderItems,
          subtotal: data.subtotal,
          shippingFee: data.shippingFee,
          totalAmount: data.totalAmount,
          status: 'PENDING',
          paymentMethod: data.paymentMethod,
          createdAt: new Date(now).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          timestamp: now,
        };

        // 1. Lưu local state để phản hồi giao diện tức thì
        set({ orders: [...get().orders, newOrder] });

        // 2. Gửi Đơn Hàng Thật lên PostgreSQL Database qua REST API
        try {
          const apiPayload = {
            ...data,
            items: data.items.map((i) => ({
              productId: i.productId,
              name: i.name,
              size: i.size,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              note: i.note,
            })),
          };
          const res = await api.post('/orders', apiPayload);
          if (res.data?.data) {
            get().fetchOrders();
          }
        } catch (error) {
          console.warn('Lỗi lưu đơn hàng vào PostgreSQL DB API:', error);
        }

        return newOrder;
      },

      updateOrderStatus: async (orderId, status) => {
        set({
          orders: get().orders.map((ord) =>
            ord.id === orderId ? { ...ord, status } : ord
          ),
        });

        try {
          await api.patch(`/admin/orders/${orderId}/status`, { status });
        } catch (error) {
          console.warn('Lỗi cập nhật trạng thái đơn hàng trong DB API:', error);
        }
      },
    }),
    {
      name: 'mintshop-orders-storage',
    }
  )
);
