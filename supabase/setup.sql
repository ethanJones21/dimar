-- ============================================================
-- DIMAR STORE — Setup completo de Supabase
-- Ejecuta este archivo en el SQL Editor de tu proyecto Supabase
-- Orden: schema → tablas adicionales → seed de datos
-- ============================================================


-- ============================================================
-- 1. SCHEMA BASE
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  compare_price DECIMAL(12, 2) CHECK (compare_price >= 0),
  images TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  sale_format TEXT NOT NULL DEFAULT 'unit' CHECK (sale_format IN ('unit', 'pack')),
  pack_size INTEGER,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand) WHERE brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sale_format ON products (sale_format);

-- Perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address JSONB,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT CHECK (payment_method IN ('mercadopago', 'cash')),
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0)
);


-- ============================================================
-- 2. TABLAS ADICIONALES
-- ============================================================

-- Favoritos
CREATE TABLE IF NOT EXISTS favorites (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites (user_id);

-- Reseñas
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT        NOT NULL CHECK (char_length(trim(comment)) >= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews (product_id);

-- Direcciones de envío
CREATE TABLE IF NOT EXISTS addresses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  street     TEXT        NOT NULL,
  city       TEXT        NOT NULL,
  state      TEXT        NOT NULL,
  zip        TEXT,
  country    TEXT        NOT NULL DEFAULT 'Perú',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT    NOT NULL,
  subtitle    TEXT,
  badge       TEXT,
  cta_text    TEXT,
  cta_url     TEXT    DEFAULT '/products',
  image_url   TEXT    NOT NULL,
  bg_color    TEXT    DEFAULT 'from-blue-600 to-blue-800',
  type        TEXT    NOT NULL DEFAULT 'hero'
                CHECK (type IN ('hero', 'promo')),
  order_index INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS banners_active_type_order ON banners (active, type, order_index);


-- ============================================================
-- 3. FUNCIONES Y TRIGGERS
-- ============================================================

-- Auto-crear perfil al registrarse (siempre como 'customer')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Helper: verificar si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all"   ON categories FOR ALL
  USING (public.is_admin());

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT
  USING (active = true OR public.is_admin());
CREATE POLICY "products_admin_all"   ON products FOR ALL
  USING (public.is_admin());

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own"        ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"  ON profiles FOR ALL
  USING (public.is_admin());

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own_select"   ON orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "orders_own_insert"   ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING (public.is_admin());

-- Order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_own" ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
  ));
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

-- Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read"  ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_user_insert"  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_user_update"  ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_user_delete"  ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (active = true);
CREATE POLICY "banners_admin_all"   ON banners FOR ALL USING (public.is_admin());


-- ============================================================
-- 5. SEED — Categorías
-- ============================================================

INSERT INTO categories (name, slug, description) VALUES
  ('Electrónica', 'electronica', 'Dispositivos y accesorios electrónicos'),
  ('Ropa',        'ropa',        'Moda y accesorios de vestir'),
  ('Hogar',       'hogar',       'Artículos para el hogar y decoración'),
  ('Deportes',    'deportes',    'Equipos y accesorios deportivos'),
  ('Libros',      'libros',      'Libros, revistas y material educativo')
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 6. SEED — Productos (18)
-- ============================================================

-- ELECTRÓNICA
INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Audífonos Bluetooth Pro X', 'audifonos-bluetooth-pro-x',
  'Audífonos inalámbricos con cancelación activa de ruido, 30 horas de batería y conectividad multidevice. Sonido premium con bajos profundos y drivers de 40mm.',
  249900, 319900, ARRAY['https://placehold.co/600x600/3b82f6/ffffff?text=Audífonos+Pro'],
  45, id, true, true FROM categories WHERE slug = 'electronica'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Smartwatch Serie 5', 'smartwatch-serie-5',
  'Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado, resistente al agua IP68 y pantalla AMOLED de 1.4". Batería de 7 días.',
  459900, 599900, ARRAY['https://placehold.co/600x600/1e40af/ffffff?text=Smartwatch'],
  20, id, true, true FROM categories WHERE slug = 'electronica'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Teclado Mecánico RGB', 'teclado-mecanico-rgb',
  'Teclado mecánico TKL con switches Red, retroiluminación RGB personalizable por tecla, construcción en aluminio y cable desmontable USB-C.',
  189900, NULL, ARRAY['https://placehold.co/600x600/4f46e5/ffffff?text=Teclado+RGB'],
  30, id, false, true FROM categories WHERE slug = 'electronica'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Parlante Bluetooth Portátil', 'parlante-bluetooth-portatil',
  'Parlante resistente al agua IPX7, 360° de sonido envolvente, 24 horas de reproducción y conexión para dos dispositivos simultáneos.',
  159900, 199900, ARRAY['https://placehold.co/600x600/0ea5e9/ffffff?text=Parlante'],
  60, id, true, true FROM categories WHERE slug = 'electronica'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Mouse Inalámbrico Ergonómico', 'mouse-inalambrico-ergonomico',
  'Mouse diseñado para jornadas largas, sensor óptico de 4000 DPI, receptor USB nano, 18 meses de batería y botones silenciosos.',
  89900, 109900, ARRAY['https://placehold.co/600x600/6366f1/ffffff?text=Mouse'],
  80, id, false, true FROM categories WHERE slug = 'electronica'
ON CONFLICT (slug) DO NOTHING;

-- ROPA
INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Camiseta Roja Premium Algodón', 'camiseta-roja-premium-algodon',
  'Camiseta 100% algodón orgánico, corte slim fit, costuras reforzadas y disponible en 8 colores. Suave al tacto y durable al lavado.',
  59900, NULL, ARRAY['https://placehold.co/600x600/8b5cf6/ffffff?text=Camiseta'],
  120, id, true, true FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Chaqueta Impermeable Outdoor', 'chaqueta-impermeable-outdoor',
  'Chaqueta técnica con membrana impermeable 10K, costuras selladas, capucha ajustable y 3 bolsillos con cierre YKK. Ideal para senderismo y lluvia.',
  289900, 359900, ARRAY['https://placehold.co/600x600/7c3aed/ffffff?text=Chaqueta'],
  25, id, true, true FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Jogger Deportivo Dry-Fit', 'jogger-deportivo-dry-fit',
  'Pantalón deportivo de tela Dry-Fit que absorbe la humedad, elástico en cintura con cordón ajustable, bolsillos laterales y tobillo ajustado.',
  79900, 99900, ARRAY['https://placehold.co/600x600/a78bfa/ffffff?text=Jogger'],
  90, id, false, true FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Zapatillas Running Ultra', 'zapatillas-running-ultra',
  'Zapatilla con tecnología de amortiguación reactiva, suela de goma antideslizante, upper de malla transpirable y plantilla removible ergonómica.',
  349900, 419900, ARRAY['https://placehold.co/600x600/c4b5fd/ffffff?text=Zapatillas'],
  35, id, true, true FROM categories WHERE slug = 'ropa'
ON CONFLICT (slug) DO NOTHING;

-- HOGAR
INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Lámpara Azul de Escritorio LED', 'lampara-azul-escritorio-led',
  'Lámpara con control táctil, 5 niveles de brillo, temperatura de color ajustable de 3000K a 6500K, puerto USB-A de carga y brazo articulado.',
  99900, 129900, ARRAY['https://placehold.co/600x600/10b981/ffffff?text=Lámpara+LED'],
  50, id, true, true FROM categories WHERE slug = 'hogar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Set Organización Cocina 8 Piezas', 'set-organizacion-cocina-8-piezas',
  'Conjunto de 8 recipientes herméticos apilables en diferentes tamaños, libre de BPA, aptos para microondas y lavavajillas. Incluye etiquetas.',
  69900, NULL, ARRAY['https://placehold.co/600x600/059669/ffffff?text=Organización'],
  70, id, false, true FROM categories WHERE slug = 'hogar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Cafetera de Goteo Programable', 'cafetera-goteo-programable',
  'Cafetera de 12 tazas con programación de hasta 24 horas, placa calefactora, filtro permanente lavable y jarra de vidrio resistente al calor.',
  179900, 219900, ARRAY['https://placehold.co/600x600/047857/ffffff?text=Cafetera'],
  15, id, true, true FROM categories WHERE slug = 'hogar'
ON CONFLICT (slug) DO NOTHING;

-- DEPORTES
INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Mancuernas Ajustables 20kg', 'mancuernas-ajustables-20kg',
  'Par de mancuernas ajustables de 2kg a 20kg por unidad, sistema de disco con traba rápida, recubrimiento antideslizante y soporte incluido.',
  399900, 499900, ARRAY['https://placehold.co/600x600/f59e0b/ffffff?text=Mancuernas'],
  10, id, true, true FROM categories WHERE slug = 'deportes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Colchoneta Yoga Antideslizante', 'colchoneta-yoga-antideslizante',
  'Colchoneta de 6mm de espesor en TPE ecológico, textura antideslizante en ambas caras, correa de transporte incluida y resistente al sudor.',
  59900, 74900, ARRAY['https://placehold.co/600x600/d97706/ffffff?text=Colchoneta'],
  55, id, false, true FROM categories WHERE slug = 'deportes'
ON CONFLICT (slug) DO NOTHING;

-- LIBROS
INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'Clean Code - Robert C. Martin', 'clean-code-robert-martin',
  'El libro de referencia para escribir código limpio, mantenible y profesional. Incluye ejemplos en Java y principios aplicables a cualquier lenguaje.',
  89900, NULL, ARRAY['https://placehold.co/600x600/ef4444/ffffff?text=Clean+Code'],
  40, id, false, true FROM categories WHERE slug = 'libros'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_price, images, stock, category_id, featured, active)
SELECT 'El Poder del Ahora - Eckhart Tolle', 'el-poder-del-ahora',
  'Guía espiritual para vivir en el presente y liberarse del sufrimiento mental. Uno de los libros de desarrollo personal más vendidos del mundo.',
  49900, 64900, ARRAY['https://placehold.co/600x600/dc2626/ffffff?text=Poder+del+Ahora'],
  65, id, false, true FROM categories WHERE slug = 'libros'
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 7. SEED — Banners
-- ============================================================

INSERT INTO banners (title, subtitle, badge, cta_text, cta_url, image_url, bg_color, type, order_index) VALUES
(
  'Tecnología al mejor precio',
  'Audífonos, smartwatches y más con hasta 25% de descuento esta semana.',
  'Oferta semana', 'Ver Electrónica', '/products?category=electronica',
  'https://placehold.co/1200x500/3b82f6/ffffff?text=Electrónica+Pro',
  'from-blue-600 to-blue-800', 'hero', 0
),
(
  'Nueva colección de Ropa',
  'Estilo y comodidad para cada ocasión. Chaquetas, zapatillas y más.',
  'Nueva llegada', 'Ver Colección', '/products?category=ropa',
  'https://placehold.co/1200x500/7c3aed/ffffff?text=Colección+Ropa',
  'from-violet-600 to-purple-800', 'hero', 1
),
(
  'Equipa tu hogar',
  'Lámparas, cafeteras y organización para tu espacio ideal.',
  'Trending', 'Ver Hogar', '/products?category=hogar',
  'https://placehold.co/1200x500/059669/ffffff?text=Hogar+y+Deco',
  'from-emerald-600 to-green-800', 'hero', 2
),
(
  'Deporte & Fitness',
  'Mancuernas, colchonetas y todo para entrenar en casa.',
  '-20%', 'Ver Deportes', '/products?category=deportes',
  'https://placehold.co/600x300/f59e0b/ffffff?text=Deporte+%26+Fitness',
  'from-amber-500 to-orange-600', 'promo', 0
),
(
  'Belleza & Cuidado',
  'Sérums, sets faciales y más para tu rutina diaria.',
  'Top ventas', 'Ver Belleza', '/products?category=belleza',
  'https://placehold.co/600x300/db2777/ffffff?text=Belleza+%26+Cuidado',
  'from-pink-500 to-rose-600', 'promo', 1
);


-- ============================================================
-- NOTA: Para crear un usuario ADMIN desde tu dashboard:
-- UPDATE profiles SET role = 'admin' WHERE id = 'uuid-del-usuario';
-- ============================================================
