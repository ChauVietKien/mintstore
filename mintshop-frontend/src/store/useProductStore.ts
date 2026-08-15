import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProducts } from '@/lib/mock-data';
import { api } from '@/lib/api';

export interface ProductSizeOption {
  id?: string;
  name: string;
  extraPrice: number;
}

export interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  basePrice: number;
  image: string;
  categoryId?: string;
  isAvailable: boolean;
  sizes: ProductSizeOption[];
}

interface ProductStore {
  products: ProductItem[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<ProductItem, 'id' | 'isAvailable'>) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getAvailableProducts: () => ProductItem[];
}

const defaultProducts: ProductItem[] = mockProducts.map((p) => ({
  ...p,
  isAvailable: true,
}));

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: defaultProducts,

      fetchProducts: async () => {
        try {
          const res = await api.get('/products');
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const formatted = res.data.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              basePrice: p.basePrice,
              image: p.image || '/images/tra-olong-oi-hong.png',
              isAvailable: p.isAvailable ?? true,
              sizes: p.sizes || [
                { name: 'Vừa', extraPrice: 0 },
                { name: 'Lớn', extraPrice: 10000 },
              ],
            }));
            set({ products: formatted });
          }
        } catch (error) {
          console.warn('Chưa thể tải sản phẩm từ PostgreSQL DB Server, dùng danh sách khởi tạo.');
        }
      },

      addProduct: async (newProd) => {
        const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const localProd: ProductItem = {
          ...newProd,
          id,
          isAvailable: true,
        };

        // 1. Cập nhật state local ngay để giao diện mượt mà
        set({ products: [localProd, ...get().products] });

        // 2. Lưu vĩnh viễn vào PostgreSQL Database qua REST API
        try {
          const res = await api.post('/admin/products', newProd);
          if (res.data?.data) {
            get().fetchProducts();
          }
        } catch (error) {
          console.warn('Lỗi lưu sản phẩm vào PostgreSQL DB API:', error);
        }
      },

      toggleAvailability: async (id) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
          ),
        });

        try {
          await api.patch(`/admin/products/${id}/toggle`);
        } catch (error) {
          console.warn('Lỗi toggle sản phẩm trong DB API:', error);
        }
      },

      deleteProduct: async (id) => {
        set({
          products: get().products.filter((p) => p.id !== id),
        });

        try {
          await api.delete(`/admin/products/${id}`);
        } catch (error) {
          console.warn('Lỗi xóa sản phẩm trong DB API:', error);
        }
      },

      getAvailableProducts: () => {
        return get().products.filter((p) => p.isAvailable);
      },
    }),
    {
      name: 'mintshop-products-storage',
    }
  )
);
