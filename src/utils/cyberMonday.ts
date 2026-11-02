import type { CartItem } from '../store/cartStore';

export interface CyberDiscountResult {
  discount: number;
  label: string;
  detail: string;
  appliedRule: 'pair_50' | 'flat_20' | 'none';
  pairsCount: number;
  oddCount: number;
}

export const CYBER_MONDAY_CONFIG = {
  name: 'Cyber Monday 2026',
  // Activo desde el 2 de noviembre 00:00hs hasta el 5 de noviembre a las 00:00hs (GMT-3 Argentina)
  startDate: '2026-11-02T00:00:00-03:00',
  endDate: '2026-11-05T00:00:00-03:00',
  freeShippingThreshold: 70000, // $70.000 durante Cyber Monday
  standardFreeShippingThreshold: 100000, // $100.000 estándar
};

/**
 * Determina si la promoción de Cyber Monday está activa.
 * Se activa automáticamente del 2 de noviembre a las 00:00hs
 * hasta el 5 de noviembre a las 00:00hs (GMT-3 Argentina).
 * Pasada esa fecha y hora, el sistema vuelve automáticamente a la normalidad
 * sin necesidad de redeployar ni modificar código.
 * Permite forzar el estado con ?cyber=true o ?cyber=false en la URL para pruebas.
 */
export function isCyberMondayActive(): boolean {
  if (typeof window !== 'undefined') {
    if (window.location.search.includes('cyber=false')) return false;
    if (window.location.search.includes('cyber=true')) return true;
  }

  const now = new Date().getTime();
  const start = new Date(CYBER_MONDAY_CONFIG.startDate).getTime();
  const end = new Date(CYBER_MONDAY_CONFIG.endDate).getTime();

  return now >= start && now <= end;
}

/**
 * Obtiene el umbral actual de compra para acceder a envío gratis.
 */
export function getFreeShippingThreshold(): number {
  return isCyberMondayActive()
    ? CYBER_MONDAY_CONFIG.freeShippingThreshold
    : CYBER_MONDAY_CONFIG.standardFreeShippingThreshold;
}

/**
 * Calcula el mejor descuento automático para el cliente (Opción A):
 * - 1 prenda: 20% OFF.
 * - Pares de prendas (2, 4, 6...): la 2da prenda de menor valor al 50% OFF.
 * - Prendas impares restantes: 20% OFF.
 * - Si por diferencia de precios el 20% en todo supera a la promo 2da al 50%,
 *   el sistema otorga automáticamente el 20% en todo para garantizar el mejor beneficio.
 * - NUNCA se acumulan descuentos en una misma prenda.
 */
export function calculateCyberDiscount(items: CartItem[]): CyberDiscountResult {
  if (!items || items.length === 0) {
    return {
      discount: 0,
      label: '',
      detail: '',
      appliedRule: 'none',
      pairsCount: 0,
      oddCount: 0,
    };
  }

  // 1. Desglosar todas las unidades individuales de prendas en el carrito
  const units: number[] = [];
  for (const item of items) {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.product.price) || 0);
    for (let q = 0; q < qty; q++) {
      units.push(price);
    }
  }

  if (units.length === 0) {
    return {
      discount: 0,
      label: '',
      detail: '',
      appliedRule: 'none',
      pairsCount: 0,
      oddCount: 0,
    };
  }

  // Ordenar de mayor a menor precio para optimizar el beneficio del cliente
  units.sort((a, b) => b - a);
  const totalUnits = units.length;
  const subtotal = units.reduce((acc, p) => acc + p, 0);

  // 2. Opción: 2da al 50% en pares + 20% en prendas impares
  const pairsCount = Math.floor(totalUnits / 2);
  let pairDiscount = 0;

  for (let i = 0; i < pairsCount; i++) {
    // La 2da prenda de cada par recibe 50% de descuento
    const secondItemPrice = units[2 * i + 1];
    pairDiscount += secondItemPrice * 0.5;
  }

  const oddCount = totalUnits % 2;
  if (oddCount === 1) {
    // La prenda que queda sola sin par recibe 20% de descuento
    const oddItemPrice = units[totalUnits - 1];
    pairDiscount += oddItemPrice * 0.2;
  }

  // 3. Opción: 20% directo sobre todas las prendas
  const flatDiscount = subtotal * 0.2;

  // 4. Seleccionar la mejor opción para el comprador (sin duplicar ni pisar)
  const pairDiscountRounded = Math.round(pairDiscount);
  const flatDiscountRounded = Math.round(flatDiscount);

  if (pairDiscountRounded >= flatDiscountRounded && pairsCount >= 1) {
    const isExactPairs = oddCount === 0;
    return {
      discount: pairDiscountRounded,
      label: isExactPairs
        ? 'Cyber Monday: 2da prenda al 50% OFF'
        : 'Cyber Monday: 2da al 50% + 20% en prenda restante',
      detail: isExactPairs
        ? `50% OFF en la 2da prenda de menor valor de cada par`
        : `50% OFF en 2da unidad + 20% OFF en la prenda individual`,
      appliedRule: 'pair_50',
      pairsCount,
      oddCount,
    };
  } else {
    return {
      discount: flatDiscountRounded,
      label: 'Cyber Monday: 20% OFF',
      detail: '20% OFF especial de Cyber Monday en toda la tienda',
      appliedRule: 'flat_20',
      pairsCount: 0,
      oddCount: totalUnits,
    };
  }
}
