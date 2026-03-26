-- ============================================================
-- DIMAR STORE - Órdenes de prueba (MercadoPago + Culqi)
-- Ejecuta en el SQL Editor de Supabase DESPUÉS de schema.sql y seed.sql
-- PASO PREVIO: reemplaza el UUID de abajo con el de tu usuario real.
-- Ve a: Authentication > Users > copia el UUID de tu cuenta.
-- ============================================================

-- Agregar columna payment_method si no existe
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT
    CHECK (payment_method IN ('culqi', 'mercadopago', 'cash'));

-- ============================================================
DO $$
DECLARE
  v_user_id UUID := 'REEMPLAZA-CON-TU-USER-UUID';

  -- Tomamos los productos existentes en orden alfabético
  prods UUID[];
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID; p6 UUID;

  o1 UUID := gen_random_uuid();
  o2 UUID := gen_random_uuid();
  o3 UUID := gen_random_uuid();
  o4 UUID := gen_random_uuid();
  o5 UUID := gen_random_uuid();
  o6 UUID := gen_random_uuid();

BEGIN

  -- Leer los primeros 6 productos activos disponibles
  SELECT array_agg(id ORDER BY name) INTO prods
  FROM (SELECT id, name FROM products WHERE active = true LIMIT 6) t;

  IF array_length(prods, 1) < 3 THEN
    RAISE EXCEPTION 'Necesitas al menos 3 productos activos en la base de datos. Ejecuta seed.sql primero.';
  END IF;

  p1 := prods[1]; p2 := prods[2]; p3 := prods[3];
  p4 := COALESCE(prods[4], prods[1]);
  p5 := COALESCE(prods[5], prods[2]);
  p6 := COALESCE(prods[6], prods[3]);

  -- ──────────────────────────────────────────────────────────
  -- MERCADO PAGO
  -- ──────────────────────────────────────────────────────────

  -- Orden 1: Entregada
  INSERT INTO orders (id, user_id, status, total, payment_method, shipping_address, created_at)
  VALUES (o1, v_user_id, 'delivered', 659700, 'mercadopago',
    '{"street":"Av. Larco 345, Miraflores","city":"Lima","state":"Lima","zip":"15074","country":"Perú"}',
    NOW() - INTERVAL '15 days');

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT o1, id, 1, price FROM products WHERE id IN (p1, p2) ORDER BY name;

  -- Orden 2: En proceso
  INSERT INTO orders (id, user_id, status, total, payment_method, shipping_address, created_at)
  VALUES (o2, v_user_id, 'processing', 349900, 'mercadopago',
    '{"street":"Jr. de la Unión 667","city":"Lima","state":"Lima","zip":"15001","country":"Perú"}',
    NOW() - INTERVAL '3 days');

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT o2, id, 1, price FROM products WHERE id = p3;

  -- Orden 3: Enviada
  INSERT INTO orders (id, user_id, status, total, payment_method, shipping_address, created_at)
  VALUES (o3, v_user_id, 'shipped', 279800, 'mercadopago',
    '{"street":"Calle Los Pinos 123","city":"Arequipa","state":"Arequipa","zip":"04001","country":"Perú"}',
    NOW() - INTERVAL '7 days');

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT o3, id, 2, price FROM products WHERE id = p4;

  -- ──────────────────────────────────────────────────────────
  -- CULQI
  -- ──────────────────────────────────────────────────────────

  -- Orden 4: Entregada
  INSERT INTO orders (id, user_id, status, total, payment_method, shipping_address, created_at)
  VALUES (o4, v_user_id, 'delivered', 649800, 'culqi',
    '{"street":"Av. Javier Prado Este 4200","city":"Lima","state":"Lima","zip":"15023","country":"Perú"}',
    NOW() - INTERVAL '30 days');

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT o4, id, 1, price FROM products WHERE id IN (p4, p5) ORDER BY name;

  -- Orden 5: Pendiente
  INSERT INTO orders (id, user_id, status, total, payment_method, shipping_address, created_at)
  VALUES (o5, v_user_id, 'pending', 309800, 'culqi',
    '{"street":"Av. Brasil 2150","city":"Lima","state":"Lima","zip":"15083","country":"Perú"}',
    NOW() - INTERVAL '1 day');

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT o5, id, 1, price FROM products WHERE id IN (p5, p6) ORDER BY name;

  -- Orden 6: Cancelada
  INSERT INTO orders (id, user_id, status, total, payment_method, shipping_address, created_at)
  VALUES (o6, v_user_id, 'cancelled', 249900, 'culqi',
    '{"street":"Pasaje Los Álamos 45","city":"Trujillo","state":"La Libertad","zip":"13001","country":"Perú"}',
    NOW() - INTERVAL '20 days');

  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT o6, id, 1, price FROM products WHERE id = p6;

  RAISE NOTICE '✅ 6 órdenes de prueba creadas correctamente.';

END $$;
