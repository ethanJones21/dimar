-- Agrega formato de venta a products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_format TEXT NOT NULL DEFAULT 'unit'
    CHECK (sale_format IN ('unit', 'pack'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS pack_size INTEGER;

CREATE INDEX IF NOT EXISTS idx_products_sale_format ON products (sale_format);
