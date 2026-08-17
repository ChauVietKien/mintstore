import { api } from '@/lib/api';
import { OrderStatus } from '@/store/useOrderStore';

export const orderService = {
  getAdminOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data?.data || [];
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/me');
    return response.data?.data || [];
  },

  createOrder: async (orderPayload: any) => {
    const response = await api.post('/orders', orderPayload);
    return response.data?.data;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },
};
