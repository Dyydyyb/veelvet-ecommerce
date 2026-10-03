import { create } from 'zustand';
import type { Product } from '../data/products';

export interface CartItem {
  id: string; // unique combo of product.id + size + color
  product: Product;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string | null;
  discountPercentage: number;
  lastAddedItem: CartItem | null;
  
  // Actions
  addItem: (product: Product, size: string, colorName: string, colorHex: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Computed getters
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
  getFreeShippingProgress: () => { threshold: number; remaining: number; percentage: number; isFree: boolean };
}

const FREE_SHIPPING_THRESHOLD = 100000; // $100.000 ARS

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  promoCode: null,
  discountPercentage: 0,
  lastAddedItem: null,

  addItem: (product, size, colorName, colorHex, quantity = 1) => {
    const itemId = `${product.id}-${size}-${colorName}`;
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(item => item.id === itemId);

    let updatedItems: CartItem[];
    let addedItem: CartItem;

    if (existingIndex > -1) {
      const existing = currentItems[existingIndex];
      addedItem = { ...existing, quantity: existing.quantity + quantity };
      updatedItems = currentItems.map((item, index) =>
        index === existingIndex ? addedItem : item
      );
    } else {
      addedItem = {
        id: itemId,
        product,
        size,
        colorName,
        colorHex,
        quantity,
      };
      updatedItems = [...currentItems, addedItem];
    }

    set({
      items: updatedItems,
      isOpen: true,
      lastAddedItem: addedItem,
    });
  },

  removeItem: (id) => {
    set({
      items: get().items.filter(item => item.id !== id),
    });
  },

  updateQuantity: (id, delta) => {
    const updated = get().items
      .map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    set({ items: updated });
  },

  clearCart: () => {
    set({ items: [], promoCode: null, discountPercentage: 0 });
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

  applyPromoCode: (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'VEELVET10' || trimmed === 'SIMPLEMENTE') {
      set({ promoCode: trimmed, discountPercentage: 0.10 });
      return { success: true, message: '¡Cupón del 10% OFF aplicado con éxito!' };
    } else if (trimmed === 'SHOWROOM') {
      set({ promoCode: trimmed, discountPercentage: 0.15 });
      return { success: true, message: '¡Cupón del 15% OFF Showroom Quilmes aplicado!' };
    }
    return { success: false, message: 'El cupón ingresado no es válido o ha expirado.' };
  },

  removePromoCode: () => {
    set({ promoCode: null, discountPercentage: 0 });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  },

  getDiscount: () => {
    const subtotal = get().getSubtotal();
    return subtotal * get().discountPercentage;
  },

  getTotal: () => {
    return get().getSubtotal() - get().getDiscount();
  },

  getTotalItems: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getFreeShippingProgress: () => {
    const subtotal = get().getSubtotal();
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    return {
      threshold: FREE_SHIPPING_THRESHOLD,
      remaining,
      percentage,
      isFree: subtotal >= FREE_SHIPPING_THRESHOLD,
    };
  },
}));
