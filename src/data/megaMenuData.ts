/**
 * megaMenuData.ts
 * Interfaces y configuración dinámica del Mega Menú para "Colección".
 * 100% SUPABASE: Los datos provienen de las tablas categorias, subcategorias y tipos_oferta.
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
  title?: string;
  hasUnderline?: boolean;
  items: MegaMenuItem[];
}

export interface MegaMenuConfig {
  columns: MegaMenuColumn[];
}

// Configuración vacía inicial. Se puebla 100% dinámicamente desde Supabase.
export const MEGA_MENU_DATA: MegaMenuConfig = {
  columns: [],
};
