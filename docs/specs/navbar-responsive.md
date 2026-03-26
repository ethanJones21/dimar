# Spec: Navbar Responsive

## Estado
Pendiente — el navbar actual no está optimizado para móvil.

## Problemas actuales
- El buscador se comprime demasiado en pantallas pequeñas
- El botón CATEGORÍAS desaparece en móvil (`hidden md:block`) sin alternativa
- Los botones "Ingresar" y "Registrarse" pueden no caber en pantallas pequeñas
- No hay menú hamburguesa para móvil
- Los links de navegación (Pedidos, Admin) están `hidden lg:flex` sin fallback móvil

## Diseño propuesto

### Mobile (< 768px)
```
[Logo]  [🔍]  [🛒]  [☰]
```
- Logo a la izquierda
- Ícono de búsqueda que expande una barra debajo del navbar
- Ícono del carrito con badge
- Hamburguesa que abre un drawer/menú lateral o dropdown con:
  - Categorías (lista completa)
  - Mis Pedidos
  - Admin (si aplica)
  - Ingresar / Registrarse o datos del usuario

### Tablet (768px - 1024px)
```
[Logo]  [Buscador pill]  [🛒]  [☰ o usuario]
```
- Buscador visible pero sin el bloque CATEGORÍAS
- CATEGORÍAS dentro del menú hamburguesa

### Desktop (> 1024px)
```
[Logo]  [CATEGORÍAS]  [Buscador pill]  [Pedidos][Admin]  [🛒][Usuario]
```
- Layout actual — sin cambios

## Componentes a crear/modificar
- `components/Navbar.tsx` — agregar lógica responsive
- `components/MobileMenu.tsx` — drawer lateral o dropdown para móvil (nuevo)
- `components/MobileSearch.tsx` — barra de búsqueda expandible en móvil (nuevo)

## Comportamiento del menú móvil
- Abre con animación `translate-x` o `opacity` + `scale`
- Se cierra al hacer clic fuera o en un ítem
- Muestra categorías cargadas desde Supabase (ya disponibles en el estado del Navbar)
- Fondo overlay semitransparente detrás del drawer

## Notas
- Mantener el `sticky top-0 z-50` del navbar
- El badge del carrito debe verse en todos los breakpoints
- La búsqueda expandible en móvil debe tener los mismos íconos (🎤 📷) aunque sin funcionalidad por ahora
