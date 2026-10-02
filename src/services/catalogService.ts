/**
 * catalogService.ts
 * Capa de abstracción y servicio API para el catálogo de Veelvet.
 * 
 * Permite alternar entre los datos locales tipados y un Backend / CRM / Headless CMS
 * mediante la variable de entorno `VITE_API_URL`.
 * 
 * Cuando se implemente el backend (Strapi, Supabase, Shopify, NestJS, etc.),
 * solo se activa `VITE_API_URL` y las funciones ya tienen los contratos listos.
 */

import { Product, PRODUCTS, CategoryItem, CATEGORIES } from '../data/products';
import { MEGA_MENU_DATA, MegaMenuConfig } from '../data/megaMenuData';

export interface ProductQueryParams {
  category?: string;
  subcategory?: string;
  filter?: string;
  size?: string;
  color?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  search?: string;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const CatalogService = {
  /**
   * Obtiene la lista de productos con filtros aplicados.
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    if (API_BASE_URL) {
      try {
        const query = new URLSearchParams();
        if (params?.category && params.category !== 'todos') query.set('cat', params.category);
        if (params?.subcategory) query.set('sub', params.subcategory);
        if (params?.filter) query.set('filter', params.filter);
        if (params?.size) query.set('size', params.size);
        if (params?.color) query.set('color', params.color);
        if (params?.sortBy) query.set('sort', params.sortBy);

        const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json: ApiResponse<Product[]> = await res.json();
        return json.data;
      } catch (err) {
        console.warn('Fallo al conectar con el backend, usando datos locales:', err);
      }
    }

    // Fallback a datos locales
    let result = [...PRODUCTS];

    if (params?.category && params.category !== 'todos' && params.category !== 'top' && params.category !== 'accesorios') {
      result = result.filter((p) => p.category === params.category);
    }

    if (params?.subcategory) {
      const q = params.subcategory.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (q.includes('zip') && p.name.toLowerCase().includes('cierre'))
      );
    }

    if (params?.filter === 'precios-unicos' || params?.filter === 'sale-60') {
      result = result.filter((p) => Boolean(p.compareAtPrice));
    }

    return result;
  },

  /**
   * Obtiene un producto por su slug único.
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${slug}`);
        if (res.ok) {
          const json: ApiResponse<Product> = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Fallback a datos locales para producto:', err);
      }
    }
    return PRODUCTS.find((p) => p.slug === slug) || null;
  },

  /**
   * Obtiene la estructura completa del Mega Menú de Colección
   * (columnas, categorías padre, subcategorías y etiquetas).
   */
  async getMegaMenuConfig(): Promise<MegaMenuConfig> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/mega-menu`);
        if (res.ok) {
          const json: ApiResponse<MegaMenuConfig> = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Fallback a megaMenuData local:', err);
      }
    }
    return MEGA_MENU_DATA;
  },

  /**
   * Obtiene las categorías principales del catálogo.
   */
  async getCategories(): Promise<CategoryItem[]> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) {
          const json: ApiResponse<CategoryItem[]> = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Fallback a CATEGORIES local:', err);
      }
    }
    return CATEGORIES;
  },

  /**
   * Suscribe un email al newsletter / Club Veelvet.
   */
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (res.ok) return { success: true, message: 'Suscripción exitosa' };
      } catch (err) {
        console.warn('Fallback suscripción:', err);
      }
    }
    // Simulación exitosa local
    return { success: true, message: '¡Te sumaste al Club Veelvet! Revisá tu casilla.' };
  },
};
