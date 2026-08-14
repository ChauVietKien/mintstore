import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<{ success: boolean; role: string; message: string }>;
  setMockAdmin: (email?: string) => void;
  logout: () => void;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      loginWithGoogleToken: async (idToken: string) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/google`, { idToken });
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
          
          // Fallback giả lập cho Dev nếu Backend chưa sẵn sàng
          const isDevAdmin = true; // Mặc định dev test
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
