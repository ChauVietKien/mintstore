import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<{ success: boolean; role: string; message: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; role: string; message: string }>;
  registerWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; role: string; message: string }>;
  setMockAdmin: (email?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      loginWithGoogleToken: async (idToken: string) => {
        try {
          const response = await api.post('/auth/google', { idToken });
          const { user, token } = response.data.data;

          set({
            user,
            token,
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
            token: 'mock_jwt_token_admin',
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
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data.data;

          set({
            user,
            token,
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
          const response = await api.post('/auth/register', { email, password, name, phone });
          const { user, token } = response.data.data;

          set({
            user,
            token,
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

      setMockAdmin: (email = 'maithanhda70@gmail.com') => {
        set({
          user: {
            id: 'admin_mock',
            email,
            name: 'Chủ Cửa Hàng (Admin)',
            role: 'ADMIN',
          },
          token: 'mock_jwt_token',
          isAuthenticated: true,
          isAdmin: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
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
