-- ============================================================
-- DIMAR STORE - Seed de datos para pruebas
-- Ejecuta DESPUÉS de schema.sql en el SQL Editor de Supabase
-- ============================================================

-- Limpiar datos previos (en orden por foreign keys)
TRUNCATE order_items, orders, products, categories RESTART IDENTITY CASCADE;

-- ============================================================
-- CATEGORÍAS (6)
-- ============================================================
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('cat-11111111-0000-0000-0000-000000000001', 'Electrónica',  'electronica',  'Dispositivos, gadgets y accesorios tecnológicos',      'https://placehold.co/400x300/3b82f6/ffffff?text=Electrónica'),
  ('cat-11111111-0000-0000-0000-000000000002', 'Ropa',         'ropa',         'Moda, prendas y accesorios de vestir',                  'https://placehold.co/400x300/8b5cf6/ffffff?text=Ropa'),
  ('cat-11111111-0000-0000-0000-000000000003', 'Hogar',        'hogar',        'Artículos para el hogar, cocina y decoración',          'https://placehold.co/400x300/10b981/ffffff?text=Hogar'),
  ('cat-11111111-0000-0000-0000-000000000004', 'Deportes',     'deportes',     'Equipos, ropa y accesorios deportivos',                 'https://placehold.co/400x300/f59e0b/ffffff?text=Deportes'),
  ('cat-11111111-0000-0000-0000-000000000005', 'Libros',       'libros',       'Libros, revistas y material educativo',                 'https://placehold.co/400x300/ef4444/ffffff?text=Libros'),
  ('cat-11111111-0000-0000-0000-000000000006', 'Belleza',      'belleza',      'Cuidado personal, cosméticos y fragancias',             'https://placehold.co/400x300/ec4899/ffffff?text=Belleza');

-- ============================================================
-- PRODUCTOS (18)
-- ============================================================
INSERT INTO products (id, name, slug, description, price, compare_price, images, stock, category_id, featured, active) VALUES

-- ELECTRÓNICA (5)
(
  'prd-22222222-0000-0000-0000-000000000001',
  'Audífonos Bluetooth Pro X',
  'audifonos-bluetooth-pro-x',
  'Audífonos inalámbricos con cancelación activa de ruido, 30 horas de batería y conectividad multidevice. Sonido premium con bajos profundos y drivers de 40mm.',
  249900, 319900,
  ARRAY['https://placehold.co/600x600/3b82f6/ffffff?text=Audífonos+Pro'],
  45, 'cat-11111111-0000-0000-0000-000000000001', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000002',
  'Smartwatch Serie 5',
  'smartwatch-serie-5',
  'Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado, resistente al agua IP68 y pantalla AMOLED de 1.4". Batería de 7 días.',
  459900, 599900,
  ARRAY['https://placehold.co/600x600/1e40af/ffffff?text=Smartwatch'],
  20, 'cat-11111111-0000-0000-0000-000000000001', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000003',
  'Teclado Mecánico RGB',
  'teclado-mecanico-rgb',
  'Teclado mecánico TKL con switches Red, retroiluminación RGB personalizable por tecla, construcción en aluminio y cable desmontable USB-C.',
  189900, NULL,
  ARRAY['https://placehold.co/600x600/4f46e5/ffffff?text=Teclado+RGB'],
  30, 'cat-11111111-0000-0000-0000-000000000001', false, true
),
(
  'prd-22222222-0000-0000-0000-000000000004',
  'Parlante Bluetooth Portátil',
  'parlante-bluetooth-portatil',
  'Parlante resistente al agua IPX7, 360° de sonido envolvente, 24 horas de reproducción y conexión para dos dispositivos simultáneos.',
  159900, 199900,
  ARRAY['https://placehold.co/600x600/0ea5e9/ffffff?text=Parlante'],
  60, 'cat-11111111-0000-0000-0000-000000000001', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000005',
  'Mouse Inalámbrico Ergonómico',
  'mouse-inalambrico-ergonomico',
  'Mouse diseñado para jornadas largas, sensor óptico de 4000 DPI, receptor USB nano, 18 meses de batería y botones silenciosos.',
  89900, 109900,
  ARRAY['https://placehold.co/600x600/6366f1/ffffff?text=Mouse'],
  80, 'cat-11111111-0000-0000-0000-000000000001', false, true
),

-- ROPA (4)
(
  'prd-22222222-0000-0000-0000-000000000006',
  'Camiseta Premium Algodón',
  'camiseta-premium-algodon',
  'Camiseta 100% algodón orgánico, corte slim fit, costuras reforzadas y disponible en 8 colores. Suave al tacto y durable al lavado.',
  59900, NULL,
  ARRAY['https://placehold.co/600x600/8b5cf6/ffffff?text=Camiseta'],
  120, 'cat-11111111-0000-0000-0000-000000000002', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000007',
  'Chaqueta Impermeable Outdoor',
  'chaqueta-impermeable-outdoor',
  'Chaqueta técnica con membrana impermeable 10K, costuras selladas, capucha ajustable y 3 bolsillos con cierre YKK. Ideal para senderismo y lluvia.',
  289900, 359900,
  ARRAY['https://placehold.co/600x600/7c3aed/ffffff?text=Chaqueta'],
  25, 'cat-11111111-0000-0000-0000-000000000002', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000008',
  'Jogger Deportivo Dry-Fit',
  'jogger-deportivo-dry-fit',
  'Pantalón deportivo de tela Dry-Fit que absorbe la humedad, elástico en cintura con cordón ajustable, bolsillos laterales y tobillo ajustado.',
  79900, 99900,
  ARRAY['https://placehold.co/600x600/a78bfa/ffffff?text=Jogger'],
  90, 'cat-11111111-0000-0000-0000-000000000002', false, true
),
(
  'prd-22222222-0000-0000-0000-000000000009',
  'Zapatillas Running Ultra',
  'zapatillas-running-ultra',
  'Zapatilla con tecnología de amortiguación reactiva, suela de goma antideslizante, upper de malla transpirable y plantilla removible ergonómica.',
  349900, 419900,
  ARRAY['https://placehold.co/600x600/c4b5fd/ffffff?text=Zapatillas'],
  35, 'cat-11111111-0000-0000-0000-000000000002', true, true
),

-- HOGAR (3)
(
  'prd-22222222-0000-0000-0000-000000000010',
  'Lámpara de Escritorio LED',
  'lampara-escritorio-led',
  'Lámpara con control táctil, 5 niveles de brillo, temperatura de color ajustable de 3000K a 6500K, puerto USB-A de carga y brazo articulado.',
  99900, 129900,
  ARRAY['https://placehold.co/600x600/10b981/ffffff?text=Lámpara+LED'],
  50, 'cat-11111111-0000-0000-0000-000000000003', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000011',
  'Set Organización Cocina 8 Piezas',
  'set-organizacion-cocina-8-piezas',
  'Conjunto de 8 recipientes herméticos apilables en diferentes tamaños, libre de BPA, aptos para microondas y lavavajillas. Incluye etiquetas.',
  69900, NULL,
  ARRAY['https://placehold.co/600x600/059669/ffffff?text=Organización'],
  70, 'cat-11111111-0000-0000-0000-000000000003', false, true
),
(
  'prd-22222222-0000-0000-0000-000000000012',
  'Cafetera de Goteo Programable',
  'cafetera-goteo-programable',
  'Cafetera de 12 tazas con programación de hasta 24 horas, placa calefactora, filtro permanente lavable y jarra de vidrio resistente al calor.',
  179900, 219900,
  ARRAY['https://placehold.co/600x600/047857/ffffff?text=Cafetera'],
  15, 'cat-11111111-0000-0000-0000-000000000003', true, true
),

-- DEPORTES (2)
(
  'prd-22222222-0000-0000-0000-000000000013',
  'Mancuernas Ajustables 20kg',
  'mancuernas-ajustables-20kg',
  'Par de mancuernas ajustables de 2kg a 20kg por unidad, sistema de disco con traba rápida, recubrimiento antideslizante y soporte incluido.',
  399900, 499900,
  ARRAY['https://placehold.co/600x600/f59e0b/ffffff?text=Mancuernas'],
  10, 'cat-11111111-0000-0000-0000-000000000004', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000014',
  'Colchoneta Yoga Antideslizante',
  'colchoneta-yoga-antideslizante',
  'Colchoneta de 6mm de espesor en TPE ecológico, textura antideslizante en ambas caras, correa de transporte incluida y resistente al sudor.',
  59900, 74900,
  ARRAY['https://placehold.co/600x600/d97706/ffffff?text=Colchoneta'],
  55, 'cat-11111111-0000-0000-0000-000000000004', false, true
),

-- LIBROS (2)
(
  'prd-22222222-0000-0000-0000-000000000015',
  'Clean Code - Robert C. Martin',
  'clean-code-robert-martin',
  'El libro de referencia para escribir código limpio, mantenible y profesional. Incluye ejemplos en Java y principios aplicables a cualquier lenguaje.',
  89900, NULL,
  ARRAY['https://placehold.co/600x600/ef4444/ffffff?text=Clean+Code'],
  40, 'cat-11111111-0000-0000-0000-000000000005', false, true
),
(
  'prd-22222222-0000-0000-0000-000000000016',
  'El Poder del Ahora - Eckhart Tolle',
  'el-poder-del-ahora',
  'Guía espiritual para vivir en el presente y liberarse del sufrimiento mental. Uno de los libros de desarrollo personal más vendidos del mundo.',
  49900, 64900,
  ARRAY['https://placehold.co/600x600/dc2626/ffffff?text=Poder+del+Ahora'],
  65, 'cat-11111111-0000-0000-0000-000000000005', false, true
),

-- BELLEZA (2)
(
  'prd-22222222-0000-0000-0000-000000000017',
  'Sérum Vitamina C 30ml',
  'serum-vitamina-c-30ml',
  'Sérum antioxidante con 20% de vitamina C estabilizada, ácido hialurónico y vitamina E. Aclara manchas, unifica el tono y protege de los radicales libres.',
  119900, 149900,
  ARRAY['https://placehold.co/600x600/ec4899/ffffff?text=Sérum+Vit+C'],
  45, 'cat-11111111-0000-0000-0000-000000000006', true, true
),
(
  'prd-22222222-0000-0000-0000-000000000018',
  'Set Cuidado Facial 5 Pasos',
  'set-cuidado-facial-5-pasos',
  'Kit completo con limpiador, tónico, sérum, crema hidratante y protector solar SPF50. Formulado para todo tipo de piel, sin parabenos ni sulfatos.',
  189900, 239900,
  ARRAY['https://placehold.co/600x600/db2777/ffffff?text=Set+Facial'],
  30, 'cat-11111111-0000-0000-0000-000000000006', true, true
);

-- ============================================================
-- USUARIO DE PRUEBA (perfil admin)
-- IMPORTANTE: Primero crea el usuario en Authentication > Users
-- con email: admin@dimar.dev y password: Admin1234!
-- Luego reemplaza el UUID abajo con el que Supabase te asigne,
-- o ejecuta este bloque DESPUÉS de registrarte en la app.
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@dimar.dev';
-- (Supabase no permite WHERE email en profiles, usa el UUID directo)

-- ============================================================
-- ÓRDENES DE PRUEBA (3)
-- Reemplaza 'USER-UUID-AQUI' con un UUID real de auth.users
-- antes de ejecutar este bloque.
-- ============================================================

-- Para ejecutar las órdenes de prueba, descomenta el bloque
-- de abajo y reemplaza el UUID del usuario:

/*
DO $$
DECLARE
  v_user_id UUID := 'REEMPLAZA-CON-TU-USER-UUID';
BEGIN

  -- Orden 1: Entregada
  INSERT INTO orders (id, user_id, status, total, shipping_address) VALUES (
    'ord-33333333-0000-0000-0000-000000000001',
    v_user_id,
    'delivered',
    409800,
    '{"street":"Carrera 7 #32-16","city":"Bogotá","state":"Cundinamarca","zip":"110311","country":"Colombia"}'
  );
  INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    ('ord-33333333-0000-0000-0000-000000000001', 'prd-22222222-0000-0000-0000-000000000001', 1, 249900),
    ('ord-33333333-0000-0000-0000-000000000001', 'prd-22222222-0000-0000-0000-000000000006', 2, 59900);

  -- Orden 2: En proceso
  INSERT INTO orders (id, user_id, status, total, shipping_address) VALUES (
    'ord-33333333-0000-0000-0000-000000000002',
    v_user_id,
    'processing',
    649800,
    '{"street":"Calle 93 #11-27","city":"Medellín","state":"Antioquia","zip":"050021","country":"Colombia"}'
  );
  INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    ('ord-33333333-0000-0000-0000-000000000002', 'prd-22222222-0000-0000-0000-000000000002', 1, 459900),
    ('ord-33333333-0000-0000-0000-000000000002', 'prd-22222222-0000-0000-0000-000000000010', 1, 99900),
    ('ord-33333333-0000-0000-0000-000000000002', 'prd-22222222-0000-0000-0000-000000000014', 1, 59900);

  -- Orden 3: Pendiente
  INSERT INTO orders (id, user_id, status, total, shipping_address) VALUES (
    'ord-33333333-0000-0000-0000-000000000003',
    v_user_id,
    'pending',
    189900,
    '{"street":"Avenida El Dorado #68C-61","city":"Bogotá","state":"Cundinamarca","zip":"111071","country":"Colombia"}'
  );
  INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    ('ord-33333333-0000-0000-0000-000000000003', 'prd-22222222-0000-0000-0000-000000000017', 1, 119900),
    ('ord-33333333-0000-0000-0000-000000000003', 'prd-22222222-0000-0000-0000-000000000016', 1, 49900),
    ('ord-33333333-0000-0000-0000-000000000003', 'prd-22222222-0000-0000-0000-000000000015', 1, 89900);

END $$;
*/
