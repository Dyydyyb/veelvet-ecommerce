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

export interface CyberItemBreakdown {
  itemId: string;
  originalTotal: number;
  payableTotal: number;
  discountTotal: number;
  badge: string;
  has50Discount: boolean;
}

/**
 * Calcula el desglose detallado por ítem para el carrito de compras:
 * - 1 prenda: 20% OFF
 * - 2 prendas (cualquiera sea el producto): la 1ra al 20% OFF y la 2da de menor valor al 50% OFF
 * - En pares sucesivos (4, 6...): las segundas prendas de cada par al 50% OFF y las primeras al 20% OFF
 * - Prendas impares restantes: 20% OFF
 */
export function getCyberCartItemsBreakdown(items: CartItem[]): Map<string, CyberItemBreakdown> {
  const result = new Map<string, CyberItemBreakdown>();
  if (!items || items.length === 0) return result;

  // 1. Expandir todas las unidades individuales
  interface UnitRecord {
    itemId: string;
    price: number;
    discountRate: number; // 0.2 o 0.5
  }

  const units: UnitRecord[] = [];
  for (const item of items) {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.product.price) || 0);
    for (let q = 0; q < qty; q++) {
      units.push({ itemId: item.id, price, discountRate: 0.2 });
    }
  }

  if (units.length === 0) return result;

  // Ordenar de mayor a menor valor para maximizar el beneficio del cliente
  units.sort((a, b) => b.price - a.price);

  const totalUnits = units.length;
  const pairsCount = Math.floor(totalUnits / 2);

  // Cada par: 1ra unidad 20% OFF, 2da unidad (de igual o menor valor) 50% OFF
  for (let i = 0; i < pairsCount; i++) {
    units[2 * i].discountRate = 0.2;
    units[2 * i + 1].discountRate = 0.5;
  }
  // La unidad impar restante (si hay) mantiene 20% OFF

  // Agrupar por cada CartItem
  for (const item of items) {
    const itemUnits = units.filter((u) => u.itemId === item.id);
    const originalTotal = item.product.price * item.quantity;
    let payableTotal = 0;
    let unitsWith50 = 0;
    let unitsWith20 = 0;

    for (const u of itemUnits) {
      const discountedUnitPrice = Math.round(u.price * (1 - u.discountRate));
      payableTotal += discountedUnitPrice;
      if (u.discountRate === 0.5) unitsWith50++;
      else unitsWith20++;
    }

    const discountTotal = Math.max(0, originalTotal - payableTotal);
    let badge = '-20%';
    let has50Discount = false;

    if (unitsWith50 > 0 && unitsWith20 === 0) {
      badge = '-50% (2da prenda)';
      has50Discount = true;
    } else if (unitsWith50 > 0 && unitsWith20 > 0) {
      badge = `${unitsWith50} al 50%`;
      has50Discount = true;
    }

    result.set(item.id, {
      itemId: item.id,
      originalTotal,
      payableTotal,
      discountTotal,
      badge,
      has50Discount,
    });
  }

  return result;
}

/**
 * Calcula el mejor descuento automático para el cliente (Opción A):
 * - 1 prenda: 20% OFF.
 * - 2 o más prendas de CUALQUIER combinación:
 *   Por cada par de prendas (ordenadas de mayor a menor precio):
 *   - 1ra prenda del par: 20% OFF
 *   - 2da prenda del par (la de igual o menor valor): 50% OFF
 *   - Prendas impares restantes: 20% OFF
 * - Aplica siempre, no requiere que sea el mismo modelo de prenda.
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

  // 2. Si hay 1 sola prenda: 20% OFF directo
  if (totalUnits === 1) {
    const discount = Math.round(subtotal * 0.2);
    return {
      discount,
      label: 'Cyber Monday: 20% OFF',
      detail: '20% OFF especial de Cyber Monday en toda la tienda',
      appliedRule: 'flat_20',
      pairsCount: 0,
      oddCount: 1,
    };
  }

  // 3. Con 2 o más prendas de cualquier tipo:
  // Por cada par: 1ra prenda al 20% OFF y 2da prenda de menor valor al 50% OFF
  const pairsCount = Math.floor(totalUnits / 2);
  const oddCount = totalUnits % 2;

  let totalDiscount = 0;
  for (let i = 0; i < pairsCount; i++) {
    const firstItemPrice = units[2 * i];
    const secondItemPrice = units[2 * i + 1];
    totalDiscount += Math.round(firstItemPrice * 0.2) + Math.round(secondItemPrice * 0.5);
  }

  if (oddCount === 1) {
    const oddItemPrice = units[totalUnits - 1];
    totalDiscount += Math.round(oddItemPrice * 0.2);
  }

  const roundedDiscount = Math.round(totalDiscount);
  const isExactPairs = oddCount === 0;

  return {
    discount: roundedDiscount,
    label: isExactPairs
      ? (pairsCount === 1 ? 'Cyber Monday: 2da prenda al 50% OFF' : `Cyber Monday: ${pairsCount} prendas al 50% OFF`)
      : (pairsCount === 1 ? 'Cyber Monday: 2da al 50% + 20% en restante' : `Cyber Monday: ${pairsCount} al 50% + 20% en restante`),
    detail: isExactPairs
      ? (pairsCount === 1 ? '50% OFF en la 2da prenda + 20% OFF en la 1ra' : `50% OFF en la 2da prenda de cada par + 20% en las 1ras`)
      : `50% OFF en la 2da prenda de cada par + 20% OFF en prendas individuales`,
    appliedRule: 'pair_50',
    pairsCount,
    oddCount,
  };
}
