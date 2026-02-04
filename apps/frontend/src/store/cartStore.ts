import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image_url: string;
  availableStock?: number;
}

interface CartState {
  items: CartItem[];
}

interface CartActions {
  addItem: (product: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSize: (id: string, size: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

type CartStore = CartState & CartActions & {
  total: number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => item.productId === product.productId && item.size === product.size
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += product.quantity;
          set({ items: newItems, total: get().getTotal() });
        } else {
          const newItem: CartItem = {
            ...product,
            id: `${product.productId}-${product.size}-${Date.now()}`,
          };
          set({ items: [...items, newItem], total: get().getTotal() });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id), total: get().getTotal() });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const items = get().items;
        const index = items.findIndex((item) => item.id === id);
        if (index >= 0) {
          const newItems = [...items];
          newItems[index].quantity = quantity;
          set({ items: newItems, total: get().getTotal() });
        }
      },

      updateSize: (id, size) => {
        const items = get().items;
        const index = items.findIndex((item) => item.id === id);
        if (index >= 0) {
          const newItems = [...items];
          newItems[index].size = size;
          set({ items: newItems });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'outsiders-cart',
      skipHydration: true,
    }
  )
);
