import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';

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
  timestamp: number; // Thêm mốc thời gian để sắp xếp chuẩn xác
}

interface OrderStore {
  orders: Order[];
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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
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
  {
    id: "ord_102",
    orderNumber: "MINT-8832",
    customerName: "Trần Thị B (Đơn 2 - Đặt 10 phút trước)",
    customerPhone: "0987654321",
    shippingAddress: "45 Lê Lợi, Quận 1, TP.HCM",
    items: [
      { name: "Trà Đá Xay Ổi Hồng Kem Phô Mai", size: "Vừa", quantity: 1, price: 75000, note: "Nhiều kem phô mai" },
    ],
    subtotal: 75000,
    shippingFee: 15000,
    totalAmount: 90000,
    status: "PENDING",
    paymentMethod: "MOMO",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now() - 10 * 60 * 1000,
  },
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: defaultOrders,

      createOrder: (data) => {
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

        // Đơn nào đặt trước sẽ ở trên cùng -> Thêm đơn mới vào cuối danh sách (hoặc sắp xếp theo timestamp tăng dần)
        set({ orders: [...get().orders, newOrder] });
        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((ord) =>
            ord.id === orderId ? { ...ord, status } : ord
          ),
        });
      },
    }),
    {
      name: 'mintshop-orders-storage',
    }
  )
);
