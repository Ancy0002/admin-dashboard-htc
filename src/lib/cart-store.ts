import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [
        {
          id: "0FRQHV2W",
          name: "Bio Bergamot & Patchouli Hand Wash 380ml (Biotique Royal) Refillable",
          price: 200,
          quantity: 1,
        },
      ],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.id === item.id);
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
                  : entry,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: item.quantity ?? 1 }],
          };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "htc-cart" },
  ),
);
