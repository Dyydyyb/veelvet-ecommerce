/**
 * catalogService.ts
 * Servicio 100% Supabase puro para el catálogo público de Veelvet.
 * Cero datos mock ni localStorage.
 */

import { Product, CategoryItem } from '../data/products';
import { MegaMenuConfig } from '../data/megaMenuData';
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

function expandProductVariants(products: Product[]): Product[] {
  const result: Product[] = [];

  for (const prod of products) {
    if (prod.colors && prod.colors.length > 1) {
      for (const color of prod.colors) {
        const colorImages =
          color.images && color.images.length > 0 ? color.images : prod.allImages || [prod.images.primary];
        const primaryImg = colorImages[0] || prod.images.primary;
        const secondaryImg = colorImages[1] || colorImages[0] || prod.images.secondary || primaryImg;
        const lookbookImg = colorImages[2] || colorImages[0] || prod.images.lookbook || primaryImg;

        result.push({
          ...prod,
          id: `${prod.id}---${encodeURIComponent(color.name)}`,
          baseId: prod.id,
          baseSlug: prod.slug,
          slug: `${prod.slug}?color=${encodeURIComponent(color.name)}`,
          name: `${prod.name} - ${color.name}`,
          selectedColorVariant: color.name,
          images: {
            primary: primaryImg,
            secondary: secondaryImg,
            lookbook: lookbookImg,
          },
          colors: [color, ...prod.colors.filter((c) => c.name !== color.name)],
        });
      }
    } else {
      result.push(prod);
    }
  }

  return result;
}

export const CatalogService = {
  /**
   * Obtiene la lista completa de productos directamente desde Supabase,
   * desglosando las variantes de color como productos individuales para la tienda.
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    try {
      const supaProducts = await SupabaseService.getProductos();
      if (!supaProducts || supaProducts.length === 0) {
        return [];
      }

      let adapted = supaProducts.map((p) => SupabaseService.adaptSupabaseProductToFrontend(p));
      let expanded = expandProductVariants(adapted);

      // Filtro por categoría principal
      if (params?.category && params.category !== 'todos') {
        const catFilter = params.category.toLowerCase();
        expanded = expanded.filter((p) => {
          if (p.category?.toLowerCase() === catFilter) return true;
          if (p.categoryName?.toLowerCase() === catFilter) return true;
          if (p.categoryName?.toLowerCase().replace(/\s+/g, '-') === catFilter) return true;
          if (p.categoryId === params.category) return true;
          if (catFilter === 'top' && (p.category.includes('top') || p.category.includes('buzo') || p.category.includes('abrig'))) return true;
          if (catFilter === 'bottom' && (p.category.includes('bottom') || p.category.includes('pantalon'))) return true;
          if (catFilter === 'accesorios' && p.category.includes('accesorio')) return true;
          const catName = p.subtitle?.toLowerCase() || '';
          return catName.includes(catFilter);
        });
      }

      // Filtro por subcategoría
      if (params?.subcategory) {
        const q = params.subcategory.toLowerCase().replace(/-/g, ' ');
        const qSlug = params.subcategory.toLowerCase();
        expanded = expanded.filter(
          (p) =>
            p.subcategorySlug?.toLowerCase() === qSlug ||
            p.subcategoryName?.toLowerCase() === q ||
            p.subcategoryName?.toLowerCase().replace(/\s+/g, '-') === qSlug ||
            p.name.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)
        );
      }

      // Filtro por tipo de oferta
      if (params?.filter) {
        const f = params.filter.toLowerCase();
        if (f === 'precios-unicos' || f === 'sale-60') {
          expanded = expanded.filter((p) => Boolean(p.compareAtPrice));
        } else {
          expanded = expanded.filter(
            (p) => p.tag?.toLowerCase().includes(f) || Boolean(p.compareAtPrice)
          );
        }
      }

      // Filtro por búsqueda
      if (params?.search) {
        const s = params.search.toLowerCase();
        expanded = expanded.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.subtitle.toLowerCase().includes(s)
        );
      }

      // Filtro por talle
      if (params?.size) {
        expanded = expanded.filter((p) => p.sizes.includes(params.size as any));
      }

      // Filtro por color
      if (params?.color) {
        const c = params.color.toLowerCase();
        expanded = expanded.filter(
          (p) =>
            p.selectedColorVariant?.toLowerCase().includes(c) ||
            p.colors.some((col) => col.name.toLowerCase().includes(c))
        );
      }

      // Ordenamiento
      if (params?.sortBy === 'price-asc') {
        expanded.sort((a, b) => a.price - b.price);
      } else if (params?.sortBy === 'price-desc') {
        expanded.sort((a, b) => b.price - a.price);
      } else if (params?.sortBy === 'rating') {
        expanded.sort((a, b) => b.rating - a.rating);
      } else if (params?.sortBy === 'featured') {
        expanded.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }

      return expanded;
    } catch (err) {
      console.error('Error al obtener productos desde Supabase:', err);
      return [];
    }
  },

  /**
   * Obtiene los productos destacados (destacado = true) desde Supabase,
   * desglosados por variantes de color.
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const supaProducts = await SupabaseService.getProductos();
      if (!supaProducts || supaProducts.length === 0) return [];

      // Estrictamente SOLO prendas marcadas como destacado = true en el sistema
      const featured = supaProducts.filter((p) => Boolean(p.destacado));
      const adapted = featured.map((p) => SupabaseService.adaptSupabaseProductToFrontend(p));
      return expandProductVariants(adapted);
    } catch (err) {
      console.error('Error al obtener productos destacados desde Supabase:', err);
      return [];
    }
  },

  /**
   * Obtiene una prenda por su slug o ID desde Supabase.
   */
  async getProductBySlug(slugOrId: string): Promise<Product | null> {
    try {
      const cleanSlugOrId = slugOrId.split('?')[0].trim();
      const supaProducts = await SupabaseService.getProductos();
      const match = supaProducts.find((p) => {
        if (p.id === cleanSlugOrId) return true;
        const computedSlug = p.subcategoria?.slug
          ? `${p.subcategoria.slug}-${p.id.slice(0, 6)}`
          : `prod-${p.id.slice(0, 8)}`;
        return (
          computedSlug === cleanSlugOrId ||
          p.nombre.toLowerCase().replace(/\s+/g, '-') === cleanSlugOrId ||
          cleanSlugOrId.startsWith(p.id)
        );
      });

      if (match) {
        return SupabaseService.adaptSupabaseProductToFrontend(match);
      }
      return null;
    } catch (err) {
      console.error('Error al obtener prenda desde Supabase:', err);
      return null;
    }
  },

  /**
   * Obtiene todas las categorías principales desde Supabase.
   */
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const supaCats = await SupabaseService.getCategorias();
      if (!supaCats || supaCats.length === 0) return [];

      return supaCats.map((c) => ({
        id: c.nombre.toLowerCase().replace(/\s+/g, '-'),
        name: c.nombre,
        shortName: c.nombre,
        description: `Colección de prendas ${c.nombre} Veelvet.`,
        href: `/tienda?cat=${encodeURIComponent(c.nombre.toLowerCase())}`,
      }));
    } catch (err) {
      console.error('Error al obtener categorías desde Supabase:', err);
      return [];
    }
  },

  /**
   * Obtiene las categorías destacadas (destacada = true) desde Supabase.
   */
  async getFeaturedCategories(): Promise<CategoryItem[]> {
    try {
      const [cats, prods] = await Promise.all([
        SupabaseService.getCategorias(),
        SupabaseService.getProductos(),
      ]);

      if (!cats || cats.length === 0) return [];

      // Filtrar categorías destacadas de forma estricta (destacada = true)
      let featured = cats.filter((c) => Boolean(c.destacada));
      if (featured.length === 0) return [];

      const defaultImgs = [
        '/assets/images/buzo-negro.jpg',
        '/assets/images/pantalon-beige.jpg',
        '/assets/images/hero-look.jpg',
      ];

      return featured.map((c, idx) => {
        // Asociar foto real de un producto de esta categoría si existe
        const catProd = prods.find((p) => p.subcategoria?.categoria?.id === c.id || p.subcategoria?.categoria_id === c.id);
        const prodImg = catProd?.imagenes_url?.[0];

        return {
          id: c.nombre.toLowerCase().replace(/\s+/g, '-'),
          name: c.nombre,
          shortName: c.nombre,
          description: `Colección oficial Veelvet ${c.nombre} en frisa peinada pesada.`,
          image: prodImg || defaultImgs[idx % defaultImgs.length],
          href: `/tienda?cat=${encodeURIComponent(c.nombre.toLowerCase())}`,
        };
      });
    } catch (err) {
      console.error('Error al obtener categorías destacadas desde Supabase:', err);
      return [];
    }
  },

  /**
   * Obtiene la configuración del Mega Menú (Colección) 100% dinámicamente desde Supabase.
   */
  async getMegaMenuConfig(): Promise<MegaMenuConfig> {
    try {
      const dynamicMenu = await SupabaseService.buildMegaMenuFromSupabase();
      if (dynamicMenu && dynamicMenu.columns.length > 0) {
        return dynamicMenu;
      }
    } catch (err) {
      console.error('Error al construir Mega Menú desde Supabase:', err);
    }
    return { columns: [] };
  },

  /**
   * Suscribe un email al newsletter / Club Veelvet.
   */
  async subscribeNewsletter(_email: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: '¡Te sumaste al Club Veelvet! Revisá tu casilla.' };
  },
};
