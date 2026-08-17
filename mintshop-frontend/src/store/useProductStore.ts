import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productService } from '@/services';

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

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],

      fetchProducts: async () => {
        try {
          const data = await productService.getProducts();
          if (data && Array.isArray(data)) {
            const formatted = data.map((p: any) => ({
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
          console.warn('Chưa thể kết nối tới Backend API.');
        }
      },

      addProduct: async (newProd) => {
        const id = `prod_${Date.now()}`;
        const localProd: ProductItem = {
          ...newProd,
          id,
          isAvailable: true,
        };

        set({ products: [localProd, ...get().products] });

        try {
          const data = await productService.createProduct(newProd);
          if (data) {
            get().fetchProducts();
          }
        } catch (error) {
          console.warn('Lỗi lưu sản phẩm vào DB API:', error);
        }
      },

      toggleAvailability: async (id) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
          ),
        });

        try {
          await productService.toggleAvailability(id);
        } catch (error) {
          console.warn('Lỗi toggle sản phẩm trong DB API:', error);
        }
      },

      deleteProduct: async (id) => {
        set({
          products: get().products.filter((p) => p.id !== id),
        });

        try {
          await productService.deleteProduct(id);
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
