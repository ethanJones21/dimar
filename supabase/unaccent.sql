-- ============================================================
-- DIMAR STORE - Búsqueda sin distinción de tildes
-- Ejecuta en el SQL Editor de Supabase
-- ============================================================

-- 1. Habilitar extensión unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Columna generada con nombre normalizado (sin tildes, minúsculas)
--    Se actualiza automáticamente cuando cambia el nombre del producto
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_name TEXT
    GENERATED ALWAYS AS (unaccent(lower(name))) STORED;

-- 3. Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS products_search_name_idx
  ON products USING gin (search_name gin_trgm_ops);

-- Nota: si el índice gin_trgm_ops falla, usa este alternativo:
-- CREATE INDEX IF NOT EXISTS products_search_name_idx ON products (search_name);
