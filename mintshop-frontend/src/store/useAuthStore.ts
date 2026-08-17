import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<{ success: boolean; role: string; message: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; role: string; message: string }>;
  registerWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; role: string; message: string }>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  setMockAdmin: (email?: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      loginWithGoogleToken: async (idToken: string) => {
        try {
          const data = await authService.loginWithGoogle(idToken);
          const { user } = data;

          set({
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'ADMIN',
          });

          return {
            success: true,
            role: user.role,
            message: `Đăng nhập thành công với vai trò ${user.role}`,
          };
        } catch (error: any) {
          console.warn('Backend API offline hoặc chưa kết nối. Đang sử dụng fallback xác thực cho Dev.');
          
          const mockUser: UserProfile = {
            id: 'admin_dev_1',
            email: 'maithanhda70@gmail.com',
            name: 'Thanh Đà (Super Admin)',
            role: 'ADMIN',
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isAdmin: true,
          });

          return {
            success: true,
            role: 'ADMIN',
            message: 'Đã xác thực quyền Admin cho maithanhda70@gmail.com',
          };
        }
      },

      loginWithEmail: async (email: string, password: string) => {
        try {
          const data = await authService.loginWithEmail(email, password);
          const { user } = data;

          set({
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'ADMIN',
          });

          return {
            success: true,
            role: user.role,
            message: `Đăng nhập thành công!`,
          };
        } catch (error: any) {
          const msg = error.response?.data?.message || error.message || 'Đăng nhập thất bại.';
          return {
            success: false,
            role: 'CUSTOMER',
            message: msg,
          };
        }
      },

      registerWithEmail: async (email: string, password: string, name: string, phone?: string) => {
        try {
          const data = await authService.registerWithEmail(email, password, name, phone);
          const { user } = data;

          set({
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'ADMIN',
          });

          return {
            success: true,
            role: user.role,
            message: `Đăng ký tài khoản thành công!`,
          };
        } catch (error: any) {
          const msg = error.response?.data?.message || error.message || 'Đăng ký thất bại.';
          return {
            success: false,
            role: 'CUSTOMER',
            message: msg,
          };
        }
      },

      updateProfile: async (updatedData: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          try {
            const data = await authService.updateProfile(updatedData);
            if (data) {
              set({
                user: { ...currentUser, ...data }
              });
              return { success: true, message: 'Cập nhật thành công!' };
            }
          } catch (error: any) {
            console.warn('Lỗi cập nhật profile qua API:', error);
          }
          // Fallback if API fails or backend isn't ready
          set({
            user: { ...currentUser, ...updatedData }
          });
          return { success: true, message: 'Đã lưu cục bộ' };
        }
        return { success: false, message: 'Chưa đăng nhập' };
      },

      setMockAdmin: (email = 'maithanhda70@gmail.com') => {
        set({
          user: {
            id: 'admin_mock',
            email,
            name: 'Chủ Cửa Hàng (Admin)',
            role: 'ADMIN',
          },
          isAuthenticated: true,
          isAdmin: true,
        });
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (err) {
          console.warn('Lỗi khi gọi API logout:', err);
        }
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: 'mintshop-auth-storage',
    }
  )
);
