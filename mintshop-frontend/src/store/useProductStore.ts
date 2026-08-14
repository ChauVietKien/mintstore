import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProducts } from '@/lib/mock-data';

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
  addProduct: (product: Omit<ProductItem, 'id' | 'isAvailable'>) => void;
  toggleAvailability: (id: string) => void;
  deleteProduct: (id: string) => void;
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

      addProduct: (newProd) => {
        const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const product: ProductItem = {
          ...newProd,
          id,
          isAvailable: true,
        };
        set({ products: [product, ...get().products] });
      },

      toggleAvailability: (id) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
          ),
        });
      },

      deleteProduct: (id) => {
        set({
          products: get().products.filter((p) => p.id !== id),
        });
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
