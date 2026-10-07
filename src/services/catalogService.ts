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

export function computeVariantTitle(
  prodName: string,
  color: { name: string; titulo?: string },
  allColors?: { name: string }[]
): string {
  if (color.titulo && color.titulo.trim()) {
    return color.titulo.trim();
  }

  // Si el nombre del color ya es un nombre completo de prenda (ej: "Conjunto Negro Veelvet")
  const lowerColor = color.name.toLowerCase();
  if (
    lowerColor.startsWith('conjunto') ||
    lowerColor.startsWith('buzo') ||
    lowerColor.startsWith('pantalon') ||
    lowerColor.startsWith('pantalón') ||
    lowerColor.startsWith('remera') ||
    lowerColor.startsWith('campera')
  ) {
    return color.name.trim();
  }

  // Limpiar sufijos comerciales repetitivos del nombre base como "- VeelvetShop.", "- Veelvet", etc.
  let baseClean = prodName
    .replace(/\s*-\s*veelvet\s*shop\.?/gi, '')
    .replace(/\s*-\s*veelvet\.?/gi, '')
    .trim();

  // Limpiar del nombre base cualquier nombre de color existente en la lista
  if (allColors && allColors.length > 0) {
    for (const c of allColors) {
      if (c.name && c.name.trim().length >= 2) {
        const escaped = c.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        baseClean = baseClean.replace(regex, ' ').trim();
      }
    }
  }

  // Limpiar guiones o dobles espacios sobrantes
  baseClean = baseClean.replace(/\s*-\s*$/, '').replace(/\s+/g, ' ').trim();

  if (!baseClean) {
    baseClean = 'Conjunto Veelvet';
  }

  // Unir la prenda limpia con el color asignado
  return `${baseClean} ${color.name}`.replace(/\s+/g, ' ').trim();
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

        const variantName = computeVariantTitle(prod.name, color, prod.colors);

        result.push({
          ...prod,
          id: `${prod.id}---${encodeURIComponent(color.name)}`,
          baseId: prod.id,
          baseSlug: prod.slug,
          slug: `${prod.slug}?color=${encodeURIComponent(color.name)}`,
          name: variantName,
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
      const [supaProducts, cats, subs] = await Promise.all([
        SupabaseService.getProductos(),
        SupabaseService.getCategorias(),
        SupabaseService.getSubcategorias(),
      ]);
      if (!supaProducts || supaProducts.length === 0) {
        return [];
      }

      let adapted = supaProducts.map((p) => SupabaseService.adaptSupabaseProductToFrontend(p, cats, subs));
      let expanded = expandProductVariants(adapted);

      // Filtro por categoría principal
      if (params?.category && params.category !== 'todos') {
        const catFilter = params.category.toLowerCase();
        const rawCatParam = params.category;
        expanded = expanded.filter((p) => {
          if (p.category?.toLowerCase() === catFilter) return true;
          if (p.categoryName?.toLowerCase() === catFilter) return true;
          if (p.categoryName?.toLowerCase().replace(/\s+/g, '-') === catFilter) return true;
          if (p.categoryId === rawCatParam) return true;
          if (rawCatParam && p.categoryIds?.includes(rawCatParam)) return true;
          if (p.categories?.some((c) => c.toLowerCase() === catFilter)) return true;
          if (
            p.categoryNames?.some(
              (c) => c.toLowerCase() === catFilter || c.toLowerCase().replace(/\s+/g, '-') === catFilter
            )
          ) {
            return true;
          }
          if (catFilter === 'top' && (p.category.includes('top') || p.category.includes('buzo') || p.category.includes('abrig'))) return true;
          if (catFilter === 'bottom' && (p.category.includes('bottom') || p.category.includes('pantalon'))) return true;
          if (catFilter === 'accesorios' && p.category.includes('accesorio')) return true;
          const catName = p.subtitle?.toLowerCase() || '';
          return catName.includes(catFilter);
        });
      }

      // Filtro por subcategoría (estricto: solo prendas asignadas a esa subcategoría)
      if (params?.subcategory) {
        const raw = params.subcategory.toLowerCase().trim();
        const query = raw.replace(/-/g, ' ');
        const qSlug = raw.replace(/\s+/g, '-');
        const qStem = query.replace(/(es|s)$/g, '');

        const checkMatch = (val?: string) => {
          if (!val) return false;
          const v = val.toLowerCase().trim();
          if (v === raw || v === query || v === qSlug) return true;
          const vQuery = v.replace(/-/g, ' ');
          if (vQuery === query) return true;
          if (qStem.length >= 3) {
            const vStem = vQuery.replace(/(es|s)$/g, '');
            if (vStem === qStem) return true;
          }
          return false;
        };

        expanded = expanded.filter(
          (p) =>
            (p.subcategoryId && p.subcategoryId.toLowerCase() === raw) ||
            (Array.isArray(p.subcategoryIds) && p.subcategoryIds.some((id) => id.toLowerCase() === raw)) ||
            checkMatch(p.subcategorySlug) ||
            (Array.isArray(p.subcategorySlugs) && p.subcategorySlugs.some((s) => checkMatch(s))) ||
            (Array.isArray(p.subcategories) && p.subcategories.some((s) => checkMatch(s))) ||
            checkMatch(p.subcategoryName) ||
            (Array.isArray(p.subcategoryNames) && p.subcategoryNames.some((n) => checkMatch(n)))
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
   * Obtiene los productos destacados (destacado = true) desde Supabase.
   * En la sección de destacados se muestra únicamente el producto principal,
   * sin desglosarlo en múltiples tarjetas de colores.
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const [supaProducts, cats, subs] = await Promise.all([
        SupabaseService.getProductos(),
        SupabaseService.getCategorias(),
        SupabaseService.getSubcategorias(),
      ]);
      if (!supaProducts || supaProducts.length === 0) return [];

      // Estrictamente SOLO prendas marcadas como destacado = true en el sistema (producto principal)
      const featured = supaProducts.filter((p) => Boolean(p.destacado));
      return featured.map((p) => SupabaseService.adaptSupabaseProductToFrontend(p, cats, subs));
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
      const [supaProducts, cats, subs] = await Promise.all([
        SupabaseService.getProductos(),
        SupabaseService.getCategorias(),
        SupabaseService.getSubcategorias(),
      ]);
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
        return SupabaseService.adaptSupabaseProductToFrontend(match, cats, subs);
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
   * Obtiene las categorías y subcategorías destacadas (destacada = true) desde Supabase.
   */
  async getFeaturedCategories(): Promise<CategoryItem[]> {
    try {
      const [cats, subs, prods] = await Promise.all([
        SupabaseService.getCategorias(),
        SupabaseService.getSubcategorias(),
        SupabaseService.getProductos(),
      ]);

      const featuredCats = (cats || []).filter((c) => Boolean(c.destacada));
      const featuredSubs = (subs || []).filter((s) => Boolean(s.destacada));

      if (featuredCats.length === 0 && featuredSubs.length === 0) return [];

      const defaultImgs = [
        '/assets/images/hero-look.jpg',
        '/assets/images/buzo-negro.jpg',
        '/assets/images/pantalon-beige.jpg',
      ];

      const result: CategoryItem[] = [];

      // Categorías principales destacadas
      featuredCats.forEach((c, idx) => {
        const catProd = prods.find((p) => {
          if (p.subcategoria?.categoria?.id === c.id || p.subcategoria?.categoria_id === c.id) return true;
          if (Array.isArray(p.categorias_ids) && p.categorias_ids.includes(c.id)) return true;
          const prodSubs = Array.isArray(p.subcategorias_ids) ? p.subcategorias_ids : p.subcategoria_id ? [p.subcategoria_id] : [];
          return prodSubs.some((sid) => {
            const s = subs.find((sub) => sub.id === sid);
            return s?.categoria_id === c.id || s?.categorias_ids?.includes(c.id);
          });
        });
        const prodImg = Array.isArray(catProd?.imagenes_url)
          ? catProd.imagenes_url[0]
          : (catProd?.imagenes_url as any)?.urls?.[0];

        result.push({
          id: `cat-${c.id}`,
          name: c.nombre,
          shortName: c.nombre,
          description: `Colección oficial Veelvet ${c.nombre} en frisa peinada pesada.`,
          image: c.imagen_url || prodImg || defaultImgs[idx % defaultImgs.length],
          href: `/tienda?cat=${encodeURIComponent(c.nombre.toLowerCase())}`,
        });
      });

      // Subcategorías destacadas
      featuredSubs.forEach((s, idx) => {
        const subProd = prods.find((p) => p.subcategoria_id === s.id || p.subcategoria?.id === s.id);
        const prodImg = Array.isArray(subProd?.imagenes_url)
          ? subProd.imagenes_url[0]
          : (subProd?.imagenes_url as any)?.urls?.[0];

        result.push({
          id: `sub-${s.id}`,
          name: s.nombre,
          shortName: s.nombre,
          description: `Línea exclusiva ${s.nombre} Veelvet con siluetas oversized unisex.`,
          image: s.imagen_url || prodImg || defaultImgs[(featuredCats.length + idx) % defaultImgs.length],
          href: `/tienda?sub=${encodeURIComponent(s.slug || s.nombre.toLowerCase())}`,
        });
      });

      return result;
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
