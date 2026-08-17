import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';
import { orderService } from '@/services';

export type OrderStatus = 'PENDING' | 'BREWING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  name: string;
  productName?: string;
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
  latitude?: number;
  longitude?: number;
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
  fetchMyOrders: () => Promise<void>;
  createOrder: (data: {
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    latitude?: number;
    longitude?: number;
    note?: string;
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    paymentMethod: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      fetchOrders: async () => {
        try {
          const data = await orderService.getAdminOrders();
          if (data && Array.isArray(data)) {
            set({ orders: data });
          }
        } catch (error) {
          console.warn('Chưa thể kết nối Backend API để tải đơn hàng.');
        }
      },

      fetchMyOrders: async () => {
        try {
          const data = await orderService.getMyOrders();
          if (data && Array.isArray(data)) {
            set({ orders: data });
          }
        } catch (error) {
          console.warn('Chưa thể kết nối Backend API để tải đơn hàng của user.');
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

        set({ orders: [...get().orders, newOrder] });

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
          const created = await orderService.createOrder(apiPayload);
          if (created) {
            get().fetchOrders();
          }
        } catch (error) {
          console.warn('Lỗi lưu đơn hàng vào DB API:', error);
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
          await orderService.updateOrderStatus(orderId, status);
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
