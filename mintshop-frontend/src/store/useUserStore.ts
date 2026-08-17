import { create } from 'zustand';
import { userService, AdminUserItem } from '@/services/userService';

interface UserStore {
  users: AdminUserItem[];
  loading: boolean;
  error: string | null;
  fetchAdminUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchAdminUsers: async () => {
    set({ loading: true, error: null });
    try {
      const usersData = await userService.getAdminUsers();
      set({ users: usersData });
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      set({ error: err.message || 'Không thể tải danh sách người dùng' });
    } finally {
      set({ loading: false });
    }
  },
}));
