import { api } from '@/lib/api';
import { UserProfile } from '@/store/useAuthStore';

export const authService = {
  loginWithGoogle: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data?.data;
  },

  loginWithEmail: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data?.data;
  },

  registerWithEmail: async (email: string, password: string, name: string, phone?: string) => {
    const response = await api.post('/auth/register', { email, password, name, phone });
    return response.data?.data;
  },

  updateProfile: async (updatedData: Partial<UserProfile>) => {
    const response = await api.patch('/auth/profile', updatedData);
    return response.data?.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
