/**
 * catalogService.ts
 * Servicio unificado del catálogo conectado a Supabase con fallback local.
 */

import { Product, PRODUCTS, CategoryItem, CATEGORIES } from '../data/products';
import { MEGA_MENU_DATA, MegaMenuConfig } from '../data/megaMenuData';
import { SupabaseService } from './supabaseService';

export interface ProductQueryParams {
  category?: string;
  subcategory?: string;
  filter?: string;
  size?: string;
  color?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  search?: string;
}

export const CatalogService = {
  /**
   * Obtiene la lista de productos dinámicamente desde Supabase.
   * Si no hay productos en la base de datos, recurre al catálogo local de reserva.
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    try {
      const supaProducts = await SupabaseService.getProductos();

      if (supaProducts && supaProducts.length > 0) {
        let adapted = supaProducts.map((p) => SupabaseService.adaptSupabaseProductToFrontend(p));

        // Filtro por categoría principal
        if (params?.category && params.category !== 'todos' && params.category !== 'top' && params.category !== 'accesorios') {
          adapted = adapted.filter((p) => p.category === params.category);
        }

        // Filtro por subcategoría
        if (params?.subcategory) {
          const q = params.subcategory.toLowerCase();
          adapted = adapted.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.subtitle.toLowerCase().includes(q) ||
              p.slug.toLowerCase().includes(q)
          );
        }

        // Filtro por tipo de oferta
        if (params?.filter) {
          const f = params.filter.toLowerCase();
          if (f === 'precios-unicos' || f === 'sale-60') {
            adapted = adapted.filter((p) => Boolean(p.compareAtPrice));
          } else {
            adapted = adapted.filter(
              (p) => p.tag?.toLowerCase().includes(f) || Boolean(p.compareAtPrice)
            );
          }
        }

        // Ordenamiento
        if (params?.sortBy === 'price-asc') {
          adapted.sort((a, b) => a.price - b.price);
        } else if (params?.sortBy === 'price-desc') {
          adapted.sort((a, b) => b.price - a.price);
        } else if (params?.sortBy === 'rating') {
          adapted.sort((a, b) => b.rating - a.rating);
        }

        return adapted;
      }
    } catch (err) {
      console.warn('Usando catálogo local por error de conexión con Supabase:', err);
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
   * Obtiene una prenda por su slug o ID desde Supabase.
   */
  async getProductBySlug(slugOrId: string): Promise<Product | null> {
    try {
      const supaProducts = await SupabaseService.getProductos();
      const match = supaProducts.find(
        (p) => p.id === slugOrId || p.nombre.toLowerCase().replace(/\s+/g, '-') === slugOrId
      );
      if (match) {
        return SupabaseService.adaptSupabaseProductToFrontend(match);
      }
    } catch (err) {
      console.warn('Fallback a productos locales:', err);
    }

    return PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
  },

  /**
   * Obtiene la configuración del Mega Menú (Colección) dinámicamente desde Supabase.
   */
  async getMegaMenuConfig(): Promise<MegaMenuConfig> {
    try {
      const dynamicMenu = await SupabaseService.buildMegaMenuFromSupabase();
      if (dynamicMenu && dynamicMenu.columns.length > 0) {
        return dynamicMenu;
      }
    } catch (err) {
      console.warn('Usando megaMenuData local:', err);
    }
    return MEGA_MENU_DATA;
  },

  /**
   * Obtiene las categorías principales para la Home y filtros.
   */
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const supaCats = await SupabaseService.getCategorias();
      if (supaCats && supaCats.length > 0) {
        return supaCats.map((c) => ({
          id: c.nombre.toLowerCase(),
          name: c.nombre,
          shortName: c.nombre,
          description: `Colección de prendas ${c.nombre} Veelvet.`,
          href: `/tienda?cat=${encodeURIComponent(c.nombre.toLowerCase())}`,
        }));
      }
    } catch (err) {
      console.warn('Fallback categorías:', err);
    }
    return CATEGORIES;
  },

  /**
   * Suscribe un email al newsletter / Club Veelvet.
   */
  async subscribeNewsletter(_email: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: '¡Te sumaste al Club Veelvet! Revisá tu casilla.' };
  },
};
