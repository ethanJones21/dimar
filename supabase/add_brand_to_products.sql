-- Agrega la columna brand a la tabla products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand TEXT;

-- Índice para filtrado eficiente por marca
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand)
  WHERE brand IS NOT NULL;
