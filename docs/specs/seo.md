# Spec: SEO E-commerce

## Estado
Implementado — las 4 técnicas están activas en producción.

## Archivos creados / modificados

| Archivo | Cambio |
|---|---|
| `lib/seo.ts` | Constantes globales: `SITE_URL`, `SITE_NAME`, `SITE_DESC` |
| `app/layout.tsx` | Metadata base: `metadataBase`, OG global, Twitter card, robots |
| `app/products/[id]/page.tsx` | Metadata por producto + JSON-LD `Product` |
| `app/page.tsx` | JSON-LD `Organization` + `WebSite` |
| `app/sitemap.ts` | Sitemap dinámico |
| `app/robots.ts` | robots.txt |

---

## 1. JSON-LD (Schema.org)

### Página de inicio — `app/page.tsx`
Dos schemas en un array:

**Organization**
```json
{
  "@type": "Organization",
  "name": "Dimar Store",
  "url": "https://dimar.pe",
  "description": "...",
  "contactPoint": { "contactType": "customer service", "email": "contacto@dimar.pe" }
}
```

**WebSite** — habilita el Sitelinks Searchbox de Google
```json
{
  "@type": "WebSite",
  "name": "Dimar Store",
  "url": "https://dimar.pe",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://dimar.pe/products?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### Página de producto — `app/products/[id]/page.tsx`
Schema **Product** con precio, stock y rating agregado (si hay reseñas):

```json
{
  "@type": "Product",
  "name": "Nombre del producto",
  "description": "...",
  "image": ["url1", "url2"],
  "sku": "uuid-del-producto",
  "brand": { "@type": "Brand", "name": "Dimar Store" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "COP",
    "price": 99900,
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Dimar Store" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": 12
  }
}
```

> `aggregateRating` solo se incluye si el producto tiene al menos una reseña. Permite que Google muestre estrellas directamente en los resultados de búsqueda.

---

## 2. Metadata completo por página

### Base (`app/layout.tsx`)
```ts
metadataBase: new URL(SITE_URL),
title: { default: "Dimar Store", template: "%s | Dimar Store" },
description: SITE_DESC,
openGraph: { type: "website", siteName: "Dimar Store", locale: "es_PE" },
twitter: { card: "summary_large_image" },
robots: { index: true, follow: true },
```

### Por producto (`generateMetadata`)
- `title`: nombre del producto
- `description`: primeros 155 caracteres de la descripción
- `openGraph.images`: primera imagen del producto
- `twitter.images`: misma imagen

Controla cómo se ve el link al compartir en WhatsApp, redes sociales, etc.

---

## 3. Sitemap dinámico — `app/sitemap.ts`

Generado en build/request con prioridades:

| Ruta | `priority` | `changeFrequency` |
|---|---|---|
| `/` | 1.0 | daily |
| `/products` | 0.9 | daily |
| `/products?category=slug` | 0.7 | weekly |
| `/products/[id]` | 0.8 | weekly |

Accesible en: `https://dimar.pe/sitemap.xml`

---

## 4. robots.txt — `app/robots.ts`

```
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /profile
Disallow: /auth
Sitemap: https://dimar.pe/sitemap.xml
```

---

## Variable de entorno requerida

```env
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

Agregar en Vercel (o servidor de producción) antes de hacer deploy. Sin esta variable el fallback es `https://dimar.pe`.

---

## Pendiente / mejoras futuras

- Agregar schema `BreadcrumbList` en la página de producto (categoría → producto)
- Agregar `og:image` personalizado para la home (imagen del logo o banner)
- Verificar en [Google Rich Results Test](https://search.google.com/test/rich-results) una vez en producción
- Registrar el sitemap en Google Search Console
