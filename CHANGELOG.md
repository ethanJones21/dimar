# Changelog — DIMAR Store

Todos los cambios notables del proyecto están documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

### Próximamente
- Múltiples direcciones de envío por usuario
- Historial de cambios de estado en pedidos
- Notificaciones push al cambiar estado de pedido

---

## [0.10.0] — 2026-04-14

### Añadido
- **Drawer del carrito** (`CartDrawer`) — panel deslizable desde la derecha que muestra los productos agregados, controles de cantidad, subtotal por ítem, total reactivo y dos acciones: "Proceder al Pago" y "Ver todos" (navega a `/cart`); se cierra con el botón X, el backdrop o la tecla Escape
- **Apertura automática del drawer** al agregar productos — tanto desde `AddToCartButton` (detalle de producto) como desde `ProductCard` (catálogo y carrusel), el drawer se abre inmediatamente sin redirigir al usuario
- **Estado `cartDrawerOpen`** en el store Zustand (`useCartStore`) con acciones `openCartDrawer` / `closeCartDrawer`; se excluye de la persistencia en `localStorage` via `partialize`

### Cambiado
- **Ícono del carrito en Navbar** — cambiado de `<Link href="/cart">` a `<button>` que abre el drawer; aplica tanto en desktop como en mobile
- **Checkout — formulario de pago con tarjeta completo** — reemplaza el flujo de redirección externa a MercadoPago por inputs nativos de React (Core Methods): número de tarjeta con formato automático, vencimiento `MM/YY` con inserción de barra, CVV, DNI del titular y nombre; selector de cuotas poblado dinámicamente desde el SDK según el BIN de la tarjeta ingresada
- **Guard de hidratación en checkout** — antes de redirigir al carrito vacío, se espera a que Zustand termine de hidratar (`onFinishHydration`) para evitar falsos redirects en la carga inicial
- **SDK de MercadoPago** cargado vía `<Script>` de Next.js con `onLoad` que inicializa la instancia MP y activa el formulario

### Eliminado
- Botón "Ir a pagar con MercadoPago" que redirigía a una preferencia externa — reemplazado por el formulario de tarjeta inline con tokenización directa

---

## [0.9.0] — 2026-04-14

### Añadido
- **Búsqueda por voz** — icono de micrófono en la barra de búsqueda del Navbar; usa el hook `useVoiceSearch` sobre la Web Speech API; muestra estados visuales (idle / escuchando / transcribiendo) y toast de error si el navegador no tiene soporte o el usuario deniega el permiso
- **API de transcripción** (`/api/transcribe`) — endpoint interno que recibe audio y devuelve texto; permite integración con modelos externos de speech-to-text como respaldo al reconocimiento nativo del navegador
- **Animaciones con GSAP** — nuevos componentes `AnimatedSection` (fade-in + slide al entrar al viewport) y `AnimatedStagger` (animación escalonada de hijos); aplicados en homepage (features strip, categorías, productos destacados) y en el carrito (entrada de items y estado vacío)
- **Panel de administración** — restaurado dentro del proyecto; incluye gestión de productos (crear, editar, eliminar con `ProductForm` y `DeleteProductButton`) y gestión de pedidos con cambio de estado en línea (`OrderStatusSelect`)

### Cambiado
- **Checkout — pago con tarjeta**: reemplazado Culqi por **MercadoPago Core Methods** como único procesador; tokenización directa de tarjeta sin iframes, con detección automática de cuotas según el BIN
- **Campo de vencimiento unificado** en checkout — los campos separados "Mes" / "Año" se fusionaron en un único input `MM/YY` con inserción automática de la barra al escribir
- **Validación en cliente antes del pago** — se verifica número de tarjeta, mes/año de vencimiento (detecta tarjetas vencidas), CVV, DNI y nombre del titular; cualquier error muestra un toast con mensaje claro antes de llamar al SDK
- **Errores del SDK de MercadoPago** — los códigos internos del SDK (ej. `326` = año inválido, `E301` = número de tarjeta, `224` = CVV) se traducen a mensajes legibles en español y se muestran como toast
- **Esquema Supabase consolidado** — los archivos de migración separados se unificaron en `supabase/setup.sql`; facilita el setup desde cero en nuevos entornos

### Eliminado
- Integración con **Culqi** — removidos `app/api/culqi/charge/route.ts` y `docs/culqi-setup.md`; MercadoPago cubre todos los métodos de pago

---

---

## [0.7.0] — 2026-04-02

### Añadido
- **Panel de filtros avanzado** (`FiltersPanel`) en catálogo de productos — filtros por rango de precio, marca, porcentaje de descuento (10 %–70 %) y formato de venta; versión móvil con overlay deslizable
- **Grid animado de productos** (`ProductsGrid`) — usa Framer Motion (`layout` + `AnimatePresence`) para transiciones suaves al aplicar o quitar filtros
- **Modo oscuro / claro** (`ThemeToggle`) — botón sol/luna en navbar, persiste la preferencia en `localStorage` y aplica la clase `dark` en `<html>`
- **Columna `brand`** en tabla `products` — migración `add_brand_to_products.sql`; índice parcial para filtrado eficiente
- **Columna `sale_format`** en tabla `products` — valores `unit` | `pack` + campo `pack_size`; migración `add_sale_format_to_products.sql`

### Cambiado
- Catálogo `/products` refactorizado: `SortSelect` eliminado e integrado en `FiltersPanel`; grilla extraída a `ProductsGrid`

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
