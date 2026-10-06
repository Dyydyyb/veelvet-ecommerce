/**
 * products.ts
 * Interfaces y definiciones base del catálogo de Veelvet.
 * 100% SUPABASE: Los datos mock han sido completamente eliminados.
 * Todo el catálogo se carga en tiempo real desde Supabase.
 */

export interface ProductColor {
  name: string;
  titulo?: string;
  hex: string;
  class: string;
  images?: string[];
}

export interface Product {
  id: string;
  baseId?: string;
  slug: string;
  baseSlug?: string;
  name: string;
  subtitle: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  categoryIds?: string[];
  categories?: string[];
  categoryNames?: string[];
  subcategoryId?: string;
  subcategoryName?: string;
  subcategorySlug?: string;
  subcategoryIds?: string[];
  subcategories?: string[];
  subcategoryNames?: string[];
  subcategorySlugs?: string[];
  price: number;
  compareAtPrice?: number;
  description: string;
  composition: string;
  fit: string;
  images: {
    primary: string;
    secondary: string;
    lookbook?: string;
  };
  allImages?: string[];
  colors: ProductColor[];
  sizes: string[];
  inStock: boolean;
  tag?: string;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  measureType: 'buzo' | 'pantalon' | 'conjunto';
  allowInstallments?: boolean;
  allowTransferDiscount?: boolean;
  selectedColorVariant?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  badge?: string;
  image?: string;
  badgeColor?: string;
}

export const PRODUCT_COLORS: Record<string, ProductColor> = {
  negro: { name: 'Negro Washed', hex: '#161616', class: 'bg-[#161616]' },
  gris: { name: 'Gris Melange', hex: '#9B9B9B', class: 'bg-[#9B9B9B]' },
  beige: { name: 'Beige Crudo', hex: '#E2DAC8', class: 'bg-[#E2DAC8]' },
  chocolate: { name: 'Marrón Chocolate', hex: '#3B291D', class: 'bg-[#3B291D]' },
  azulNavy: { name: 'Azul Veelvet', hex: '#1B2A4A', class: 'bg-[#1B2A4A]' },
};

// 100% Supabase: Colecciones vacías en memoria. Todos los datos provienen de Supabase.
export const PRODUCTS: Product[] = [];
export const CATEGORIES: CategoryItem[] = [];
