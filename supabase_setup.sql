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
