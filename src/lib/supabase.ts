import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikuwvjvhtbouafjayrvj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdXd2anZodGJvdWFmamF5cnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzYzNDQsImV4cCI6MjEwNjU1MjM0NH0.qar2GCV5r7zopChl3m9499-KJRoqey-MVJxmlVgbJKg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// Tipos de datos sincronizados con Supabase
// ==========================================

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  destacada?: boolean;
}

export interface Subcategoria {
  id: string;
  categoria_id: string;
  nombre: string;
  slug: string;
  categoria?: Categoria;
}

export interface TipoOferta {
  id: string;
  nombre: string;
  etiqueta_badge: string;
  color_badge: string | null;
}

export interface ColorVariant {
  name: string;
  hex: string;
  imagenes: string[];
}

export interface Producto {
  id: string;
  subcategoria_id: string | null;
  tipo_oferta_id: string | null;
  nombre: string;
  precio: number;
  precio_anterior: number | null;
  imagenes_url: string[] | any; // Lista JSON de Cloudflare R2 URLs o payload con { urls, colores, descripcion }
  destacado: boolean;
  stock: number;
  created_at: string;
  descripcion?: string | null;
  colores?: ColorVariant[];
  talles?: string[];
  permite_cuotas?: boolean;
  permite_transferencia_descuento?: boolean;
  // Relaciones
  subcategoria?: Subcategoria;
  tipo_oferta?: TipoOferta;
}

