# Changelog — DIMAR Store

Todos los cambios notables del proyecto están documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

### Próximamente
- Panel de administración (proyecto separado)
- Múltiples direcciones de envío por usuario
- Historial de cambios de estado en pedidos

---

## [0.6.0] — 2026-03-26

### Añadido
- **Dirección de envío en perfil** — nueva sección en `/profile` para guardar calle, ciudad, departamento, código postal y país; se persiste en tabla `addresses`
- **Pre-llenado en checkout** — al entrar a `/checkout` se carga automáticamente la dirección guardada del usuario con indicador visual "Dirección guardada ✓"
- **Tabla `addresses`** (`supabase/addresses.sql`) — una dirección por usuario, FK a `profiles`, RLS habilitado, seed ficticio de Lima incluido
- **Paginación en Mis Favoritos** — 8 productos por página (2 filas × 4 columnas), URL-based (`?page=N`), controles prev/next con página activa resaltada; se oculta si hay ≤ 8 favoritos

### Cambiado
- `ProfileForm` separado en dos cards: "Datos personales" y "Dirección de envío"; ambos guardan en paralelo con `Promise.all`

---

## [0.5.0] — 2026-03-25

### Añadido
- **Favoritos** — icono de corazón en cada `ProductCard`, store Zustand con sync a Supabase, actualizaciones optimistas, toast si el usuario no está autenticado
- **Página `/favorites`** — grid de productos guardados con estado vacío ilustrado
- **Tabla `favorites`** (`supabase/favorites.sql`) — PK compuesta `(user_id, product_id)`, FK a `profiles`, RLS
- **Carrusel de sugerencias en carrito** (`CartSuggestions`) — productos relacionados por categoría excluyendo los ya agregados, usa `ProductCarousel`
- **SEO completo**:
  - JSON-LD `Product`, `Organization`, `WebSite` + `SearchAction`
  - `metadataBase`, OpenGraph y Twitter Card en `layout.tsx` y páginas de producto
  - `app/sitemap.ts` dinámico (home, /products, categorías, productos activos)
  - `app/robots.ts` con rutas privadas bloqueadas
- **Spec SEO** guardado en `docs/specs/seo.md`
- **Avatar en navbar** — inicial del email del usuario en lugar del ícono genérico; dropdown reorganizado con "Mis Favoritos", "Mis Pedidos" y "Mi Perfil"
- **Página `/profile`** — formulario de nombre completo y teléfono; upsert a tabla `profiles`
- **Componente `Avatar`** (`components/ui/Avatar.tsx`) — wrapper de Radix UI sin dependencia de `cn`

### Cambiado
- "Pedidos" eliminado de la barra superior, movido al dropdown del avatar
- `middleware.ts` — `/profile` y `/favorites` agregados a rutas protegidas; `/admin` removido

---

## [0.4.0] — 2026-03-24

### Añadido
- **Galería de imágenes estilo MercadoLibre** en detalle de producto:
  - Miniaturas en fila inferior con selección activa
  - Zoom de lente en panel lateral derecho (posicionado `calc(100% + 2.5rem)`)
  - Lightbox con navegación prev/next al hacer click
  - Todos los efectos vía refs directos (sin re-renders en `mousemove`)
- **Sección de reseñas** en `/products/[id]`:
  - `ReviewsSection` (Server Component) — promedio de calificación, conteo, listado con avatar de inicial
  - `ReviewForm` (Client Component) — estrellas con hover, textarea con mínimo 5 caracteres
  - `router.refresh()` al guardar para actualizar sin recargar
- **Tabla `reviews`** (`supabase/reviews.sql`) — FK a `profiles(id)` (no a `auth.users`), UNIQUE por `(product_id, user_id)`, RLS público de lectura y propio de escritura
- **Carrusel de productos similares** (`SimilarProducts`) — misma categoría, excluye el producto actual, límite 10
- **`ProductCarousel`** — 3 productos visibles por slide (`w-[calc(33.333%-0.667rem)]`), botones ocultos si hay ≤ 3 productos, scroll por página completa

### Corregido
- Error React DevTools "children should not have changed" — lens y panel de zoom siempre renderizados con `style.display` controlado por refs, eliminando cambios de estado en `mousemove`
- Reseñas no aparecían tras guardar — FK de `reviews.user_id` apuntaba a `auth.users` en vez de `profiles(id)`, impedía el join PostgREST

---

## [0.3.0] — 2026-03-23

### Añadido
- **Dos banners full-width** en homepage debajo de la sección CTA — apilados verticalmente con margen de página
- **Sección de video** en homepage con embed de YouTube, texto en colores sobre fondo blanco
- **Footer multi-columna** (`components/Footer.tsx`) — columnas: Marca, Tienda, Mi cuenta, Ayuda; íconos de métodos de pago; sub-componente `LinkColumn` para eliminar duplicación

### Cambiado
- Detalle de producto: eliminado botón "Comprar ahora" y label "Cantidad:"; botón "Agregar al carrito" movido al costado del contador y extendido (`flex-1`)

---

## [0.2.0] — 2026-03-22

### Añadido
- **Búsqueda insensible a tildes**:
  - Productos: columna generada `search_name` en Supabase + `.ilike()` con query normalizado via `String.normalize("NFD")`
  - Pedidos: función `norm()` en cliente para filtrado JS
- **Carrito de compras** (`/cart`) — items con control de cantidad, resumen de pedido, botón de eliminar, subtotal por línea
- **Checkout** (`/checkout`) — formulario de envío en dos pasos (dirección → pago), integración con Culqi (tarjeta) y MercadoPago (Yape + otros)
- **Página de pedidos** (`/orders`) y detalle (`/orders/[id]`)

### Eliminado
- **Panel de administración completo** (`app/admin/`) — eliminado; será un proyecto separado
- Botón "Ir al Admin" del estado vacío en homepage
- Estado `isAdmin` y consulta de rol en `Navbar`

---

## [0.1.0] — 2026-03-20

### Añadido
- Configuración inicial Next.js 15 + Supabase + Tailwind CSS
- Autenticación — login, registro, callback OAuth, middleware de sesión
- Catálogo de productos con filtros por categoría y búsqueda
- Detalle de producto con galería básica y botón de agregar al carrito
- Store Zustand para carrito con persistencia en `localStorage`
- Navbar responsivo con menú móvil
- Seed SQL inicial con categorías y 18 productos de ejemplo (`supabase/seed.sql`)
- Tablas Supabase: `profiles`, `products`, `categories`, `orders`, `order_items`
