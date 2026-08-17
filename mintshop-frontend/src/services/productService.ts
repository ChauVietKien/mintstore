import { api } from '@/lib/api';
import { ProductItem } from '@/store/useProductStore';

export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data?.data || [];
  },

  createProduct: async (productData: Omit<ProductItem, 'id' | 'isAvailable'>) => {
    const response = await api.post('/admin/products', productData);
    return response.data?.data;
  },

  toggleAvailability: async (id: string) => {
    const response = await api.patch(`/admin/products/${id}/toggle`);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },
};
