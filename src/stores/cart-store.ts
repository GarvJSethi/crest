"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Cart item representing a product variant in the shopping cart */
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  /** Price in paise (₹599 = 59900) */
  price: number;
  /** Compare-at price in paise for showing discounts */
  compareAtPrice?: number;
  quantity: number;
  sku: string;
  /** Max stock available for this variant */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  /** Add item to cart or increment quantity if already exists */
  addItem: (item: Omit<CartItem, "quantity">) => void;
  /** Remove item from cart by variantId */
  removeItem: (variantId: string) => void;
  /** Update item quantity (removes if quantity <= 0) */
  updateQuantity: (variantId: string, quantity: number) => void;
  /** Clear entire cart */
  clearCart: () => void;
  /** Get total number of items in cart */
  getTotalItems: () => number;
  /** Get subtotal in paise */
  getSubtotal: () => number;
  /** Check if a variant is in the cart */
  isInCart: (variantId: string) => boolean;
  /** Get quantity of a specific variant */
  getItemQuantity: (variantId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );
          if (existing) {
            // Don't exceed max stock
            if (existing.quantity >= item.maxStock) return state;
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + 1, item.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      isInCart: (variantId) =>
        get().items.some((i) => i.variantId === variantId),

      getItemQuantity: (variantId) =>
        get().items.find((i) => i.variantId === variantId)?.quantity ?? 0,
    }),
    {
      name: "crest-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
