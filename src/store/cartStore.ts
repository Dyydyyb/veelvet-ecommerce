import { create } from 'zustand';
import type { Product } from '../data/products';
import {
  isCyberMondayActive,
  calculateCyberDiscount,
  getFreeShippingThreshold,
} from '../utils/cyberMonday';

export interface CartItem {
  id: string; // unique combo of product.id + size + color
  product: Product;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
}

export interface DiscountDetail {
  discount: number;
  label: string;
  detail: string;
  isCyberMonday: boolean;
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
  getDiscountDetail: () => DiscountDetail;
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
    // Check stock if tracked for this specific color & size
    const colorObj = product.colors?.find(c => c.name === colorName);
    const hasColorStockTracking = Boolean(
      colorObj?.stock_por_talle && Object.keys(colorObj.stock_por_talle).length > 0
    );
    const maxStock = hasColorStockTracking
      ? (colorObj?.stock_por_talle?.[size] ?? 0)
      : (product.stock ?? 999);

    if (hasColorStockTracking && maxStock <= 0) {
      // Out of stock, cannot add
      return;
    }

    const itemId = `${product.id}-${size}-${colorName}`;
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(item => item.id === itemId);

    let updatedItems: CartItem[];
    let addedItem: CartItem;

    if (existingIndex > -1) {
      const existing = currentItems[existingIndex];
      const targetQty = existing.quantity + quantity;
      const finalQty = hasColorStockTracking ? Math.min(targetQty, maxStock) : targetQty;

      if (finalQty === existing.quantity && existing.quantity >= maxStock) {
        set({ isOpen: true });
        return;
      }

      addedItem = { ...existing, quantity: finalQty };
      updatedItems = currentItems.map((item, index) =>
        index === existingIndex ? addedItem : item
      );
    } else {
      const finalQty = hasColorStockTracking ? Math.min(quantity, maxStock) : quantity;
      addedItem = {
        id: itemId,
        product,
        size,
        colorName,
        colorHex,
        quantity: finalQty,
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
          const colorObj = item.product.colors?.find(c => c.name === item.colorName);
          const hasColorStockTracking = Boolean(
            colorObj?.stock_por_talle && Object.keys(colorObj.stock_por_talle).length > 0
          );
          const maxStock = hasColorStockTracking
            ? (colorObj?.stock_por_talle?.[item.size] ?? 0)
            : (item.product.stock ?? 999);

          let newQty = item.quantity + delta;
          if (delta > 0 && hasColorStockTracking && newQty > maxStock) {
            newQty = maxStock;
          }
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
    let percentage = 0;
    if (trimmed === 'VEELVET10' || trimmed === 'SIMPLEMENTE') {
      percentage = 0.10;
    } else if (trimmed === 'SHOWROOM') {
      percentage = 0.15;
    } else {
      return { success: false, message: 'El cupón ingresado no es válido o ha expirado.' };
    }

    set({ promoCode: trimmed, discountPercentage: percentage });
    const detail = get().getDiscountDetail();
    if (detail.isCyberMonday) {
      return {
        success: true,
        message: `¡Cupón registrado! La promo automática de Cyber Monday (${detail.label}) te otorga un beneficio mayor o equivalente y fue priorizada.`,
      };
    }
    return { success: true, message: `¡Cupón del ${(percentage * 100).toFixed(0)}% OFF aplicado con éxito!` };
  },

  removePromoCode: () => {
    set({ promoCode: null, discountPercentage: 0 });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  },

  getDiscountDetail: (): DiscountDetail => {
    const items = get().items;
    const subtotal = get().getSubtotal();

    // 1. Descuento Cyber Monday automático
    const cyberActive = isCyberMondayActive();
    const cyberResult = cyberActive ? calculateCyberDiscount(items) : null;
    const cyberDiscount = cyberResult ? cyberResult.discount : 0;

    // 2. Descuento por cupón manual
    const couponDiscount = Math.round(subtotal * get().discountPercentage);

    // 3. Regla no acumulativa: prevalece el mayor beneficio para el cliente
    if (cyberDiscount > 0 && cyberDiscount >= couponDiscount) {
      return {
        discount: cyberDiscount,
        label: cyberResult!.label,
        detail: cyberResult!.detail,
        isCyberMonday: true,
      };
    } else if (couponDiscount > 0) {
      return {
        discount: couponDiscount,
        label: `Cupón ${get().promoCode} (${(get().discountPercentage * 100).toFixed(0)}% OFF)`,
        detail: 'Descuento aplicado por cupón promocional',
        isCyberMonday: false,
      };
    }

    return {
      discount: 0,
      label: '',
      detail: '',
      isCyberMonday: false,
    };
  },

  getDiscount: () => {
    return get().getDiscountDetail().discount;
  },

  getTotal: () => {
    return Math.max(0, get().getSubtotal() - get().getDiscount());
  },

  getTotalItems: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getFreeShippingProgress: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const payableSubtotal = Math.max(0, subtotal - discount);
    const threshold = getFreeShippingThreshold();
    const remaining = Math.max(0, threshold - payableSubtotal);
    const percentage = Math.min(100, Math.round((payableSubtotal / threshold) * 100));

    return {
      threshold,
      remaining,
      percentage,
      isFree: payableSubtotal >= threshold && itemsHasGarments(get().items),
    };
  },
}));

function itemsHasGarments(items: CartItem[]): boolean {
  return items.length > 0;
}
