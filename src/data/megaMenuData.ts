/**
 * megaMenuData.ts
 * Configuración dinámica de categorías y subcategorías para el Mega Menú de "Colección".
 * Diseñado para ser gestionado fácilmente desde un futuro CRM/CMS (Strapi, Shopify, Supabase, etc.).
 */

export interface MegaMenuItem {
  name: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export interface MegaMenuColumn {
  id: string;
  title?: string; // Opcional para la primera columna de destacados
  hasUnderline?: boolean;
  items: MegaMenuItem[];
}

export interface MegaMenuConfig {
  columns: MegaMenuColumn[];
}

export const MEGA_MENU_DATA: MegaMenuConfig = {
  columns: [
    // Columna 1: Destacados, Promociones y Drops (sin línea de encabezado, como en la referencia)
    {
      id: 'destacados',
      items: [
        { name: 'Precios únicos', href: '/tienda?filter=precios-unicos', badge: 'HOT', badgeColor: 'bg-red-600 text-white' },
        { name: 'Final Count Unit 03', href: '/tienda?filter=unit-03', badge: 'DROP', badgeColor: 'bg-navy text-white' },
        { name: 'Sale Final Hasta 60%Off', href: '/tienda?filter=sale-60', highlight: true, badge: '-60%', badgeColor: 'bg-amber-600 text-white' },
        { name: 'Cargos', href: '/tienda?cat=pantalones&sub=cargos' },
        { name: 'Hoodies', href: '/tienda?cat=buzos&sub=hoodies' },
        { name: 'Remeras', href: '/tienda?cat=top&sub=remeras' },
        { name: 'Zip Up', href: '/tienda?cat=buzos&sub=zip-up', badge: 'BEST SELLER', badgeColor: 'bg-beige-300 text-navy' },
        { name: 'Campera', href: '/tienda?cat=top&sub=campera' },
      ],
    },

    // Columna 2: Top (con encabezado bold y línea horizontal inferior)
    {
      id: 'top',
      title: 'Top',
      hasUnderline: true,
      items: [
        { name: 'Campera', href: '/tienda?cat=top&sub=campera' },
        { name: 'Remeras', href: '/tienda?cat=top&sub=remeras' },
        { name: 'Musculosas', href: '/tienda?cat=top&sub=musculosas', badge: 'DROP', badgeColor: 'bg-beige-200 text-navy' },
        { name: 'Camisas', href: '/tienda?cat=top&sub=camisas' },
        { name: 'Hoodies', href: '/tienda?cat=buzos&sub=hoodies' },
        { name: 'Zip Up', href: '/tienda?cat=buzos&sub=zip-up' },
      ],
    },

    // Columna 3: Bottom (con encabezado bold y línea horizontal inferior)
    {
      id: 'bottom',
      title: 'Bottom',
      hasUnderline: true,
      items: [
        { name: 'Sastrero', href: '/tienda?cat=pantalones&sub=sastrero' },
        { name: 'Cargos', href: '/tienda?cat=pantalones&sub=cargos' },
        { name: 'Denim', href: '/tienda?cat=pantalones&sub=denim' },
        { name: 'Sweatpant', href: '/tienda?cat=pantalones&sub=sweatpant' },
        { name: 'Shorts', href: '/tienda?cat=pantalones&sub=shorts' },
      ],
    },

    // Columna 4: Accesorios (con encabezado bold y línea horizontal inferior)
    {
      id: 'accesorios',
      title: 'Accesorios',
      hasUnderline: true,
      items: [
        { name: 'Morrales', href: '/tienda?cat=accesorios&sub=morrales' },
        { name: 'Bijou', href: '/tienda?cat=accesorios&sub=bijou' },
        { name: 'Medias', href: '/tienda?cat=accesorios&sub=medias' },
        { name: 'Ver todo', href: '/tienda', highlight: true },
      ],
    },
  ],
};
