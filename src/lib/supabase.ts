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
  imagen_url?: string;
  destacada?: boolean;
}

export interface Subcategoria {
  id: string;
  categoria_id: string;
  categorias_ids?: string[]; // Múltiples categorías a las que pertenece
  nombre: string;
  slug: string;
  imagen_url?: string;
  destacada?: boolean;
  categoria?: Categoria;
  categorias?: Categoria[]; // Lista resuelta de todas las categorías asignadas
}

export interface TipoOferta {
  id: string;
  nombre: string;
  etiqueta_badge: string;
  color_badge: string | null;
}

export interface ColorVariant {
  name: string;
  titulo?: string;
  hex: string;
  imagenes: string[];
}

export interface MenuLateralItem {
  id: string;
  orden: number;
  tipo?: 'categoria' | 'subcategoria';
}

export interface Producto {
  id: string;
  subcategoria_id: string | null;
  subcategorias_ids?: string[]; // Soporte para múltiples subcategorías
  categorias_ids?: string[];    // Soporte para múltiples categorías enteras
  tipo_oferta_id: string | null;
  nombre: string;
  precio: number;
  precio_anterior: number | null;
  imagenes_url: string[] | any; // Lista JSON de Cloudflare R2 URLs o payload con { urls, colores, descripcion }
  imagen_principal?: string | null; // Imagen principal que figura en la grilla de productos
  color_principal?: string | null;  // Color que aparece primero por defecto
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
  subcategorias?: Subcategoria[];
  categorias?: Categoria[];
  tipo_oferta?: TipoOferta;
}

export interface PedidoItem {
  productId: string;
  name: string;
  slug?: string;
  size: string;
  colorName: string;
  colorHex?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Pedido {
  id?: string;
  order_number: string;
  cliente_nombre: string;
  cliente_apellido?: string;
  cliente_email: string;
  cliente_telefono?: string;
  cliente_dni?: string;
  direccion_calle?: string;
  direccion_numero?: string;
  direccion_piso_depto?: string;
  direccion_ciudad?: string;
  direccion_provincia?: string;
  direccion_cp?: string;
  notas?: string;
  metodo_envio: string;
  costo_envio: number;
  items: PedidoItem[];
  subtotal: number;
  descuento: number;
  total: number;
  estado_pago: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  mp_preference_id?: string;
  mp_payment_id?: string;
  mp_status?: string;
  mp_status_detail?: string;
  mp_merchant_order_id?: string;
  created_at?: string;
  updated_at?: string;
}

