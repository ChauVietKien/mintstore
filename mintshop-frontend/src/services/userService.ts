import { api } from '@/lib/api';

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  _count: { orders: number };
}

export const userService = {
  getAdminUsers: async (): Promise<AdminUserItem[]> => {
    const response = await api.get('/admin/users');
    return response.data?.data || [];
  },
};
