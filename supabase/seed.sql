-- ============================================================
-- PRODUCTOS (18)
-- ============================================================
INSERT INTO products (id, name, slug, description, price, compare_price, images, stock, category_id, featured, active) VALUES

-- ELECTRÓNICA (5)
(
  gen_random_uuid(),
  'Audífonos Bluetooth Pro X',
  'audifonos-bluetooth-pro-x',
  'Audífonos inalámbricos con cancelación activa de ruido, 30 horas de batería y conectividad multidevice. Sonido premium con bajos profundos y drivers de 40mm.',
  249900, 319900,
  ARRAY['https://placehold.co/600x600/3b82f6/ffffff?text=Audífonos+Pro'],
  45, '5a10f273-2375-4c6f-9409-349a6f5773d4', true, true
),
(
  gen_random_uuid(),
  'Smartwatch Serie 5',
  'smartwatch-serie-5',
  'Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado, resistente al agua IP68 y pantalla AMOLED de 1.4". Batería de 7 días.',
  459900, 599900,
  ARRAY['https://placehold.co/600x600/1e40af/ffffff?text=Smartwatch'],
  20, '5a10f273-2375-4c6f-9409-349a6f5773d4', true, true
),
(
  gen_random_uuid(),
  'Teclado Mecánico RGB',
  'teclado-mecanico-rgb',
  'Teclado mecánico TKL con switches Red, retroiluminación RGB personalizable por tecla, construcción en aluminio y cable desmontable USB-C.',
  189900, NULL,
  ARRAY['https://placehold.co/600x600/4f46e5/ffffff?text=Teclado+RGB'],
  30, '5a10f273-2375-4c6f-9409-349a6f5773d4', false, true
),
(
  gen_random_uuid(),
  'Parlante Bluetooth Portátil',
  'parlante-bluetooth-portatil',
  'Parlante resistente al agua IPX7, 360° de sonido envolvente, 24 horas de reproducción y conexión para dos dispositivos simultáneos.',
  159900, 199900,
  ARRAY['https://placehold.co/600x600/0ea5e9/ffffff?text=Parlante'],
  60, '5a10f273-2375-4c6f-9409-349a6f5773d4', true, true
),
(
  gen_random_uuid(),
  'Mouse Inalámbrico Ergonómico',
  'mouse-inalambrico-ergonomico',
  'Mouse diseñado para jornadas largas, sensor óptico de 4000 DPI, receptor USB nano, 18 meses de batería y botones silenciosos.',
  89900, 109900,
  ARRAY['https://placehold.co/600x600/6366f1/ffffff?text=Mouse'],
  80, '5a10f273-2375-4c6f-9409-349a6f5773d4', false, true
),

-- ROPA (4)
(
  gen_random_uuid(),
  'Camiseta Roja Premium Algodón',
  'camiseta-roja-premium-algodon',
  'Camiseta 100% algodón orgánico, corte slim fit, costuras reforzadas y disponible en 8 colores. Suave al tacto y durable al lavado.',
  59900, NULL,
  ARRAY['https://placehold.co/600x600/8b5cf6/ffffff?text=Camiseta'],
  120, '320406e8-ff3a-47a8-9f3c-ca4c140468bf', true, true
),
(
  gen_random_uuid(),
  'Chaqueta Impermeable Outdoor',
  'chaqueta-impermeable-outdoor',
  'Chaqueta técnica con membrana impermeable 10K, costuras selladas, capucha ajustable y 3 bolsillos con cierre YKK. Ideal para senderismo y lluvia.',
  289900, 359900,
  ARRAY['https://placehold.co/600x600/7c3aed/ffffff?text=Chaqueta'],
  25, '320406e8-ff3a-47a8-9f3c-ca4c140468bf', true, true
),
(
  gen_random_uuid(),
  'Jogger Deportivo Dry-Fit',
  'jogger-deportivo-dry-fit',
  'Pantalón deportivo de tela Dry-Fit que absorbe la humedad, elástico en cintura con cordón ajustable, bolsillos laterales y tobillo ajustado.',
  79900, 99900,
  ARRAY['https://placehold.co/600x600/a78bfa/ffffff?text=Jogger'],
  90, '320406e8-ff3a-47a8-9f3c-ca4c140468bf', false, true
),
(
  gen_random_uuid(),
  'Zapatillas Running Ultra',
  'zapatillas-running-ultra',
  'Zapatilla con tecnología de amortiguación reactiva, suela de goma antideslizante, upper de malla transpirable y plantilla removible ergonómica.',
  349900, 419900,
  ARRAY['https://placehold.co/600x600/c4b5fd/ffffff?text=Zapatillas'],
  35, '320406e8-ff3a-47a8-9f3c-ca4c140468bf', true, true
),

-- HOGAR (3)
(
  gen_random_uuid(),
  'Lámpara Azul de Escritorio LED',
  'lampara-azul-escritorio-led',
  'Lámpara con control táctil, 5 niveles de brillo, temperatura de color ajustable de 3000K a 6500K, puerto USB-A de carga y brazo articulado.',
  99900, 129900,
  ARRAY['https://placehold.co/600x600/10b981/ffffff?text=Lámpara+LED'],
  50, '50afb28d-2209-4d74-ac76-5e1395fe5103', true, true
),
(
  gen_random_uuid(),
  'Set Organización Cocina 8 Piezas',
  'set-organizacion-cocina-8-piezas',
  'Conjunto de 8 recipientes herméticos apilables en diferentes tamaños, libre de BPA, aptos para microondas y lavavajillas. Incluye etiquetas.',
  69900, NULL,
  ARRAY['https://placehold.co/600x600/059669/ffffff?text=Organización'],
  70, '50afb28d-2209-4d74-ac76-5e1395fe5103', false, true
),
(
  gen_random_uuid(),
  'Cafetera de Goteo Programable',
  'cafetera-goteo-programable',
  'Cafetera de 12 tazas con programación de hasta 24 horas, placa calefactora, filtro permanente lavable y jarra de vidrio resistente al calor.',
  179900, 219900,
  ARRAY['https://placehold.co/600x600/047857/ffffff?text=Cafetera'],
  15, '50afb28d-2209-4d74-ac76-5e1395fe5103', true, true
),

-- DEPORTES (2)
(
  gen_random_uuid(),
  'Mancuernas Ajustables 20kg',
  'mancuernas-ajustables-20kg',
  'Par de mancuernas ajustables de 2kg a 20kg por unidad, sistema de disco con traba rápida, recubrimiento antideslizante y soporte incluido.',
  399900, 499900,
  ARRAY['https://placehold.co/600x600/f59e0b/ffffff?text=Mancuernas'],
  10, 'bcd8a505-18ec-4052-ada5-b9908e978de1', true, true
),
(
  gen_random_uuid(),
  'Colchoneta Yoga Antideslizante',
  'colchoneta-yoga-antideslizante',
  'Colchoneta de 6mm de espesor en TPE ecológico, textura antideslizante en ambas caras, correa de transporte incluida y resistente al sudor.',
  59900, 74900,
  ARRAY['https://placehold.co/600x600/d97706/ffffff?text=Colchoneta'],
  55, 'bcd8a505-18ec-4052-ada5-b9908e978de1', false, true
),

-- LIBROS (2)
(
  gen_random_uuid(),
  'Clean Code - Robert C. Martin',
  'clean-code-robert-martin',
  'El libro de referencia para escribir código limpio, mantenible y profesional. Incluye ejemplos en Java y principios aplicables a cualquier lenguaje.',
  89900, NULL,
  ARRAY['https://placehold.co/600x600/ef4444/ffffff?text=Clean+Code'],
  40, 'a3951a23-4ce8-4130-a0a5-ddfea779b995', false, true
),
(
  gen_random_uuid(),
  'El Poder del Ahora - Eckhart Tolle',
  'el-poder-del-ahora',
  'Guía espiritual para vivir en el presente y liberarse del sufrimiento mental. Uno de los libros de desarrollo personal más vendidos del mundo.',
  49900, 64900,
  ARRAY['https://placehold.co/600x600/dc2626/ffffff?text=Poder+del+Ahora'],
  65, 'a3951a23-4ce8-4130-a0a5-ddfea779b995', false, true
);