import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SelectedTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  basePrice: number;
  size: string; // Vd: "S", "M", "L"
  sizeExtraPrice: number;
  sugarLevel: string; // Vd: "100%", "70%", "50%", "0%"
  iceLevel: string; // Vd: "100%", "70%", "50%", "0%"
  toppings: SelectedTopping[];
  note?: string;
  quantity: number;
  unitPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'unitPrice'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const toppingsPrice = newItem.toppings?.reduce((acc, t) => acc + t.price, 0) || 0;
        const unitPrice = newItem.basePrice + newItem.sizeExtraPrice + toppingsPrice;
        
        const existingIndex = get().items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.size === newItem.size &&
            item.sugarLevel === newItem.sugarLevel &&
            item.iceLevel === newItem.iceLevel &&
            JSON.stringify(item.toppings) === JSON.stringify(newItem.toppings) &&
            item.note === newItem.note
        );

        if (existingIndex > -1) {
          const updatedItems = [...get().items];
          updatedItems[existingIndex].quantity += newItem.quantity;
          set({ items: updatedItems });
        } else {
          const id = `${newItem.productId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          set({ items: [...get().items, { ...newItem, id, unitPrice }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'mintshop-cart-storage', // Tên key trong localStorage
    }
  )
);
