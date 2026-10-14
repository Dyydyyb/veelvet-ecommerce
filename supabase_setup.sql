-- ============================================================
-- VEELVET E-COMMERCE - CONFIGURACIÓN SUPABASE COMPLETA
-- Ejecutá todo este script en el SQL Editor de tu proyecto de Supabase:
-- https://supabase.com/dashboard/project/ikuwvjvhtbouafjayrvj/sql
-- ============================================================

-- 1. Desactivar Row Level Security (RLS) para permitir lectura y escritura desde la web y el panel de administración
ALTER TABLE IF EXISTS categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subcategorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tipos_oferta DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS productos DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar columnas de destacado en categorias y productos
ALTER TABLE IF EXISTS categorias ADD COLUMN IF NOT EXISTS destacada boolean DEFAULT false;
ALTER TABLE IF EXISTS productos ADD COLUMN IF NOT EXISTS destacado boolean DEFAULT false;

-- 3. Índices de optimización para búsquedas rápidas en Supabase
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos (destacado);
CREATE INDEX IF NOT EXISTS idx_productos_subcategoria ON productos (subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_categorias_destacada ON categorias (destacada);
CREATE INDEX IF NOT EXISTS idx_categorias_orden ON categorias (orden);

-- ============================================================
-- 4. TABLA DE PEDIDOS (MERCADO PAGO CHECKOUT PRO & GESTIÓN)
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  cliente_nombre text NOT NULL,
  cliente_apellido text,
  cliente_email text NOT NULL,
  cliente_telefono text,
  cliente_dni text,
  direccion_calle text,
  direccion_numero text,
  direccion_piso_depto text,
  direccion_ciudad text,
  direccion_provincia text,
  direccion_cp text,
  notas text,
  metodo_envio text NOT NULL,
  costo_envio numeric DEFAULT 0,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  descuento numeric DEFAULT 0,
  total numeric NOT NULL,
  estado_pago text DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado', 'cancelado'
  mp_preference_id text,
  mp_payment_id text,
  mp_status text,
  mp_status_detail text,
  mp_merchant_order_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS pedidos DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pedidos_order_number ON pedidos (order_number);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago ON pedidos (estado_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos (created_at DESC);
