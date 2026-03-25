-- ============================================================
-- DIMAR STORE - Tabla de Banners
-- Ejecuta en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  badge       TEXT,
  cta_text    TEXT,
  cta_url     TEXT DEFAULT '/products',
  image_url   TEXT NOT NULL,
  bg_color    TEXT DEFAULT 'from-blue-600 to-blue-800',
  type        TEXT NOT NULL DEFAULT 'hero'
                CHECK (type IN ('hero', 'promo')),
  order_index INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para ordenar y filtrar rápido
CREATE INDEX IF NOT EXISTS banners_active_type_order
  ON banners (active, type, order_index);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "banners_public_read" ON banners
  FOR SELECT USING (active = true);

-- Solo admin puede gestionar
CREATE POLICY "banners_admin_all" ON banners
  FOR ALL USING (public.is_admin());

-- ============================================================
-- SEED — Banners de prueba
-- ============================================================

-- Hero banners (slider principal)
INSERT INTO banners (title, subtitle, badge, cta_text, cta_url, image_url, bg_color, type, order_index) VALUES
(
  'Tecnología al mejor precio',
  'Audífonos, smartwatches y más con hasta 25% de descuento esta semana.',
  'Oferta semana',
  'Ver Electrónica',
  '/products?category=electronica',
  'https://placehold.co/1200x500/3b82f6/ffffff?text=Electrónica+Pro',
  'from-blue-600 to-blue-800',
  'hero', 0
),
(
  'Nueva colección de Ropa',
  'Estilo y comodidad para cada ocasión. Chaquetas, zapatillas y más.',
  'Nueva llegada',
  'Ver Colección',
  '/products?category=ropa',
  'https://placehold.co/1200x500/7c3aed/ffffff?text=Colección+Ropa',
  'from-violet-600 to-purple-800',
  'hero', 1
),
(
  'Equipa tu hogar',
  'Lámparas, cafeteras y organización para tu espacio ideal.',
  'Trending',
  'Ver Hogar',
  '/products?category=hogar',
  'https://placehold.co/1200x500/059669/ffffff?text=Hogar+y+Deco',
  'from-emerald-600 to-green-800',
  'hero', 2
);

-- Promo banners (sección secundaria, 2 cards)
INSERT INTO banners (title, subtitle, badge, cta_text, cta_url, image_url, bg_color, type, order_index) VALUES
(
  'Deporte & Fitness',
  'Mancuernas, colchonetas y todo para entrenar en casa.',
  '-20%',
  'Ver Deportes',
  '/products?category=deportes',
  'https://placehold.co/600x300/f59e0b/ffffff?text=Deporte+%26+Fitness',
  'from-amber-500 to-orange-600',
  'promo', 0
),
(
  'Belleza & Cuidado',
  'Sérums, sets faciales y más para tu rutina diaria.',
  'Top ventas',
  'Ver Belleza',
  '/products?category=belleza',
  'https://placehold.co/600x300/db2777/ffffff?text=Belleza+%26+Cuidado',
  'from-pink-500 to-rose-600',
  'promo', 1
);
