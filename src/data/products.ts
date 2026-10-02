export interface ProductColor {
  name: string;
  hex: string;
  class: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: 'buzos' | 'pantalones' | 'conjuntos';
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
  colors: ProductColor[];
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  inStock: boolean;
  tag?: 'NUEVO' | 'BEST SELLER' | 'EDICIÓN LIMITADA' | 'ESENCIAL';
  rating: number;
  reviewsCount: number;
  featured: boolean;
  measureType: 'buzo' | 'pantalon' | 'conjunto';
}

export const PRODUCT_COLORS: Record<string, ProductColor> = {
  negro: { name: 'Negro Washed', hex: '#161616', class: 'bg-[#161616]' },
  gris: { name: 'Gris Melange', hex: '#9B9B9B', class: 'bg-[#9B9B9B]' },
  beige: { name: 'Beige Crudo', hex: '#E2DAC8', class: 'bg-[#E2DAC8]' },
  chocolate: { name: 'Marrón Chocolate', hex: '#3B291D', class: 'bg-[#3B291D]' },
  azulNavy: { name: 'Azul Veelvet', hex: '#1B2A4A', class: 'bg-[#1B2A4A]' },
};

export const PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    slug: 'buzo-cierre-heavy-oversize',
    name: 'Buzo con Cierre Boxy Heavy',
    subtitle: 'Frisa de algodón prémium 380g • Unisex',
    category: 'buzos',
    price: 68000,
    compareAtPrice: 79000,
    description: 'La silueta insignia de Veelvet. Desarrollado en frisa invisible peinada de 380 gramos con tacto extra suave. Calce boxy relajado con hombros caídos y capucha anatómica con doble capa. Cuenta con cierre frontal metálico YKK de diente reforzado y tiracierres personalizado.',
    composition: '100% Algodón peinado pesado de fibra larga con acabado soft-touch antipilling.',
    fit: 'Boxy / Oversized unisex. Recomendamos llevar tu talle habitual para un look holgado o un talle menos si preferís un calce más tradicional.',
    images: {
      primary: '/assets/images/buzo-negro.jpg',
      secondary: '/assets/images/hero-look.jpg',
      lookbook: '/assets/images/hero-look.jpg',
    },
    colors: [PRODUCT_COLORS.negro, PRODUCT_COLORS.beige, PRODUCT_COLORS.chocolate, PRODUCT_COLORS.gris],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    tag: 'BEST SELLER',
    rating: 4.9,
    reviewsCount: 42,
    featured: true,
    measureType: 'buzo',
  },
  {
    id: 'prod-02',
    slug: 'pantalon-ancho-jogger-baggy',
    name: 'Pantalón Ancho Wide Leg',
    subtitle: 'Caída pesada recta • Cintura ajustable',
    category: 'pantalones',
    price: 62000,
    compareAtPrice: 72000,
    description: 'Pantalón de frisa prémium con corte wide leg fluido. Diseñado para un calce unisex impecable que cae de forma prolija sobre cualquier tipo de calzado. Cintura elástica reforzada con cordón tubular de algodón al tono y bolsillos laterales profundos con costuras de seguridad.',
    composition: '100% Algodón rústico peinado premium de textura densa y respirable.',
    fit: 'Tiro medio-alto, pierna ancha recta. Calce unisex cómodo y relajado.',
    images: {
      primary: '/assets/images/pantalon-beige.jpg',
      secondary: '/assets/images/hero-look.jpg',
      lookbook: '/assets/images/pantalon-beige.jpg',
    },
    colors: [PRODUCT_COLORS.beige, PRODUCT_COLORS.negro, PRODUCT_COLORS.chocolate, PRODUCT_COLORS.gris],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    tag: 'NUEVO',
    rating: 4.8,
    reviewsCount: 28,
    featured: true,
    measureType: 'pantalon',
  },
  {
    id: 'prod-03',
    slug: 'conjunto-veelvet-boxy-full-set',
    name: 'Conjunto Veelvet Boxy Tracksuit',
    subtitle: 'Buzo con cierre + Pantalón ancho a juego',
    category: 'conjuntos',
    price: 119000,
    compareAtPrice: 130000,
    description: 'El conjunto definitivo del streetwear contemporáneo. Incluye el Buzo con Cierre Boxy Heavy y el Pantalón Ancho Wide Leg confeccionados en la misma partida de frisa de alta densidad para asegurar una armonía de color perfecta. Comprando el conjunto accedés a un precio preferencial y envío bonificado.',
    composition: '100% Frisa pesada de algodón peinado premium (380g/m²).',
    fit: 'Set holgado unisex diseñado para uso diario o para elevar cualquier outfit urbano.',
    images: {
      primary: '/assets/images/hero-look.jpg',
      secondary: '/assets/images/buzo-negro.jpg',
      lookbook: '/assets/images/pantalon-beige.jpg',
    },
    colors: [PRODUCT_COLORS.beige, PRODUCT_COLORS.negro, PRODUCT_COLORS.chocolate, PRODUCT_COLORS.azulNavy],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    tag: 'ESENCIAL',
    rating: 5.0,
    reviewsCount: 39,
    featured: true,
    measureType: 'conjunto',
  },
  {
    id: 'prod-04',
    slug: 'buzo-cierre-chocolate-earth',
    name: 'Buzo con Cierre Chocolate Earth',
    subtitle: 'Tono marrón profundo • Cierre YKK niquelado',
    category: 'buzos',
    price: 68000,
    compareAtPrice: 79000,
    description: 'Versión del Buzo con Cierre en tono marrón chocolate tierra, un color sofisticado y versátil. Desarrollado en frisa con teñido reactivo que mantiene el color intacto lavado tras lavado.',
    composition: '100% Algodón peinado 380g.',
    fit: 'Boxy unisex clásico con ribete elástico en puños y bajo.',
    images: {
      primary: '/assets/images/buzo-negro.jpg',
      secondary: '/assets/images/hero-look.jpg',
    },
    colors: [PRODUCT_COLORS.chocolate, PRODUCT_COLORS.negro, PRODUCT_COLORS.beige],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    tag: 'EDICIÓN LIMITADA',
    rating: 4.9,
    reviewsCount: 19,
    featured: true,
    measureType: 'buzo',
  },
  {
    id: 'prod-05',
    slug: 'pantalon-ancho-negro-washed',
    name: 'Pantalón Ancho Washed Black',
    subtitle: 'Negro con ligero lavado mineral • Unisex',
    category: 'pantalones',
    price: 62000,
    description: 'El básico insustituible para todos los días. Pantalón de pierna ancha en negro profundo con tacto aterciopelado. Caída libre sin elásticos en los tobillos que estiliza la figura.',
    composition: '100% Algodón peinado suave.',
    fit: 'Pierna ancha, calce unisex holgado.',
    images: {
      primary: '/assets/images/pantalon-beige.jpg',
      secondary: '/assets/images/buzo-negro.jpg',
    },
    colors: [PRODUCT_COLORS.negro, PRODUCT_COLORS.gris, PRODUCT_COLORS.beige],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    rating: 4.8,
    reviewsCount: 15,
    featured: false,
    measureType: 'pantalon',
  },
  {
    id: 'prod-06',
    slug: 'conjunto-veelvet-total-black',
    name: 'Conjunto Total Black Monochrome',
    subtitle: 'Buzo cierre + Pantalón ancho negro',
    category: 'conjuntos',
    price: 119000,
    compareAtPrice: 130000,
    description: 'Conjunto monocromático en negro riguroso. Elegancia minimalista y máxima comodidad para el ritmo de la ciudad.',
    composition: '100% Frisa pesada de algodón peinado 380g.',
    fit: 'Boxy fit superior con pantalón ancho de caída pesada.',
    images: {
      primary: '/assets/images/buzo-negro.jpg',
      secondary: '/assets/images/pantalon-beige.jpg',
    },
    colors: [PRODUCT_COLORS.negro, PRODUCT_COLORS.chocolate],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    tag: 'BEST SELLER',
    rating: 5.0,
    reviewsCount: 31,
    featured: false,
    measureType: 'conjunto',
  }
];

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

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'todos',
    name: 'Toda la Colección',
    shortName: 'Todo',
    description: 'Colección completa de siluetas urbanas unisex Veelvet.',
    href: '/tienda',
  },
  {
    id: 'buzos',
    name: 'Buzos con Cierre',
    shortName: 'Buzos',
    description: 'Frisa prémium de 380g, calce boxy y cierres metálicos YKK.',
    image: '/assets/images/buzo-negro.jpg',
    href: '/tienda?cat=buzos',
    badge: 'BEST SELLER',
    badgeColor: 'bg-navy text-white',
  },
  {
    id: 'pantalones',
    name: 'Pantalones Anchos',
    shortName: 'Pantalones',
    description: 'Caída pesada y silueta fluida para máxima libertad.',
    image: '/assets/images/pantalon-beige.jpg',
    href: '/tienda?cat=pantalones',
  },
  {
    id: 'conjuntos',
    name: 'Conjuntos Completos',
    shortName: 'Conjuntos',
    description: 'Coordinados monocromáticos con precio especial.',
    image: '/assets/images/hero-look.jpg',
    href: '/tienda?cat=conjuntos',
    badge: 'RECOMENDADO',
    badgeColor: 'bg-beige-300 text-navy',
  },
  {
    id: 'nuevo-drop',
    name: 'Nuevo Drop Esencial',
    shortName: 'Nuevo Drop',
    description: 'Lanzamientos exclusivos de la temporada actual.',
    href: '/tienda?cat=buzos',
    badge: 'DROP ACTIVO',
    badgeColor: 'bg-amber-600 text-white',
  },
  {
    id: 'final-temporada',
    name: 'Final de Temporada',
    shortName: 'Sale',
    description: 'Últimas unidades y piezas seleccionadas con descuento.',
    href: '/tienda',
    badge: 'SALE 20% OFF',
    badgeColor: 'bg-red-700 text-white',
  },
  {
    id: 'musculosas',
    name: 'Musculosas & Tops',
    shortName: 'Musculosas',
    description: 'Cápsula de verano en desarrollo.',
    href: '/tienda',
    badge: 'PRÓXIMAMENTE',
    badgeColor: 'bg-beige-200 text-navy/70',
  }
];
