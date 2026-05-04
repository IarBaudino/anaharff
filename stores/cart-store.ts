"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
  description?: string;
  picture_url?: string;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  /** Resta cantidad del ítem; si queda ≤0 lo quita del carrito. */
  decrementBy: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const q = Math.max(1, Math.round(quantity));
          const idx = state.items.findIndex((i) => i.id === item.id);
          if (idx < 0) {
            return { items: [...state.items, { ...item, quantity: q }] };
          }
          const next = [...state.items];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + q };
          return { items: next };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => {
          const q = Math.max(1, Math.round(quantity));
          return {
            items: state.items.map((i) => (i.id === id ? { ...i, quantity: q } : i)),
          };
        }),
      decrementBy: (id, quantity) =>
        set((state) => {
          const n = Math.max(0, Math.round(quantity));
          if (n === 0) return state;
          const idx = state.items.findIndex((i) => i.id === id);
          if (idx < 0) return state;
          const item = state.items[idx];
          const nextQty = item.quantity - n;
          if (nextQty <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          const next = [...state.items];
          next[idx] = { ...item, quantity: nextQty };
          return { items: next };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "anaharff-cart-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
