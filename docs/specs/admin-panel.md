# Spec: Panel de Control Admin

## Estado
Pendiente — el panel de admin será un proyecto separado que comparte la misma base de datos de Supabase.

## Contexto
La tienda (este proyecto) es exclusivamente para clientes. El panel de administración se construirá aparte pero operará sobre los mismos datos (productos, órdenes, categorías, banners, etc.).

## Decisiones de diseño pendientes

### 1. Autenticación de admins

**Problema:** Los admins necesitan iniciar sesión en el panel, pero los clientes también usan `auth.users` en la tienda. ¿Cómo distinguir unos de otros?

**Opciones analizadas:**

**Opción A — Columna `role` en `profiles`**
- Restaurar `role TEXT CHECK (role IN ('customer', 'admin'))` en la tabla `profiles`
- El panel verifica `role = 'admin'` antes de permitir acceso
- Simple, ya estaba implementado antes
- Riesgo: un cliente podría intentar escalar privilegios si las RLS no están bien configuradas

**Opción B — Tabla `admins` separada**
- Crear una tabla `admins (id UUID FK → auth.users, name TEXT, created_at)`
- Solo los UUIDs listados ahí tienen acceso al panel
- Más explícito y fácil de auditar
- El panel chequea `EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())`

**Opción C — Función RPC `is_admin()` en Supabase**
- `CREATE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ SELECT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) $$ LANGUAGE sql SECURITY DEFINER;`
- Las RLS policies usan `public.is_admin()` en lugar de inline queries
- Más limpio y reutilizable en todas las policies

**Recomendación tentativa:** Opción B + C combinadas — tabla `admins` explícita + función `is_admin()` que la consulta. Evita depender de un campo `role` que podría confundirse con roles del negocio (ej: vendedor, soporte, etc.) a futuro.

### 2. RLS Policies para el panel

Las siguientes tablas necesitan políticas que permitan lectura/escritura total a admins:
- `products` — CRUD completo
- `categories` — CRUD completo
- `orders` — lectura total + actualizar estado
- `order_items` — lectura total
- `banners` — CRUD completo
- `profiles` — lectura total (para ver datos de clientes)

Actualmente en `schema.sql` estas policies referencian `role = 'admin'` en `profiles`. Cuando se construya el panel, actualizar para usar `is_admin()`.

### 3. Separación de sesiones

El panel admin y la tienda comparten `auth.users` de Supabase. Esto significa:
- Un admin podría loguearse en la tienda como cliente normal (no ideal)
- Considerar restringir el login de admins solo al dominio del panel
- O simplemente documentar que los admins no deben usar la tienda con su cuenta admin

### 4. Funcionalidades previstas del panel

- **Productos:** crear, editar, eliminar, activar/desactivar, marcar como destacado
- **Categorías:** CRUD
- **Órdenes:** ver todas, cambiar estado (pending → processing → shipped → delivered)
- **Banners:** gestionar hero banners y promo banners (ya tiene tabla)
- **Clientes:** ver lista, ver detalle de pedidos por cliente
- **Dashboard:** métricas — total ventas, pedidos del día, productos activos, ingresos

## Tabla `profiles` en la tienda

Por ahora se mantiene `profiles` sin columna `role`. Todos los registros son clientes.

Cuando se construya el panel, evaluar si agregar `role` de vuelta o usar la tabla `admins` separada.

## Notas
- El panel compartirá las mismas variables de entorno de Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY` o preferiblemente `SUPABASE_SERVICE_ROLE_KEY` para el backend del panel)
- Usar `service_role` key en el servidor del panel evita las restricciones RLS y simplifica operaciones admin, pero requiere que el panel esté bien asegurado
