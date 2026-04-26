import Link from "next/link";
import { type LucideIcon, ArrowRight, Shield, Truck, RefreshCw, Headphones, Laptop, Shirt, Home, Dumbbell, BookOpen, Sparkles, Zap, RotateCcw, ShoppingBag, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import BannerSlider from "@/components/BannerSlider";
import PromoBanners from "@/components/PromoBanners";
import AnimatedSection from "@/components/AnimatedSection";
import AnimatedStagger from "@/components/AnimatedStagger";
import { Product, Banner } from "@/types";
import { SITE_URL, SITE_NAME, SITE_DESC } from "@/lib/seo";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electronica: Laptop,
  ropa: Shirt,
  hogar: Home,
  deportes: Dumbbell,
  libros: BookOpen,
  belleza: Sparkles,
};

const FEATURES = [
  { icon: Truck, title: "Envío gratis", desc: "En pedidos +$150.000" },
  { icon: Shield, title: "Compra segura", desc: "Datos siempre protegidos" },
  { icon: RefreshCw, title: "30 días", desc: "Para cambios y devoluciones" },
  { icon: Headphones, title: "Soporte 24/7", desc: "Estamos para ayudarte" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: heroBanners },
    { data: promoBanners },
    { data: featuredProducts },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .eq("type", "hero")
      .order("order_index"),
    supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .eq("type", "promo")
      .order("order_index"),
    supabase
      .from("products")
      .select("*, category:categories(id,name,slug)")
      .eq("featured", true)
      .eq("active", true)
      .limit(8),
    supabase.from("categories").select("*").limit(6),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESC,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "contacto@dimar.pe",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div className="bg-surface-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Slider ── */}
      <BannerSlider banners={(heroBanners as Banner[]) ?? []} />

      {/* ── Features strip ── */}
      <section className="bg-surface-base border-b border-line">
        <AnimatedStagger className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-light rounded-xl flex-shrink-0">
                <Icon className="text-primary" size={22} />
              </div>
              <div>
                <p className="font-semibold text-content-base text-sm">
                  {title}
                </p>
                <p className="text-xs text-content-muted">{desc}</p>
              </div>
            </div>
          ))}
        </AnimatedStagger>
      </section>

      {/* ── Categorías ── */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <AnimatedSection className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-content-base">
              Explora por categoría
            </h2>
            <Link
              href="/products"
              className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-medium"
            >
              Ver todo <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
          <AnimatedStagger className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.slug] ?? Tag;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="card p-4 flex flex-col items-center text-center gap-2 hover:border-primary-light hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-primary-light rounded-xl group-hover:scale-110 transition-transform">
                    <CatIcon size={22} className="text-primary" />
                  </div>
                  <p className="text-xs font-medium text-content-base leading-tight">
                    {cat.name}
                  </p>
                </Link>
              );
            })}
          </AnimatedStagger>
        </section>
      )}

      {/* ── Promo banners ── */}
      <AnimatedSection>
        <PromoBanners banners={(promoBanners as Banner[]) ?? []} />
      </AnimatedSection>

      {/* ── Productos destacados ── */}
      {featuredProducts && featuredProducts.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <AnimatedSection className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-content-base">
                Productos Destacados
              </h2>
              <p className="text-content-muted text-sm mt-1">
                Los favoritos de nuestros clientes
              </p>
            </div>
            <Link
              href="/products"
              className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-medium"
            >
              Ver todos <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
          <AnimatedStagger
            stagger={0.06}
            className="grid grid-cols-1 min-[453px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-sm min-[453px]:max-w-none mx-auto min-[453px]:mx-0"
          >
            {(featuredProducts as Product[]).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </AnimatedStagger>
        </section>
      ) : (
        <section className="py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag size={64} className="mx-auto text-content-subtle mb-4" />
            <h2 className="text-2xl font-bold text-content-base mb-2">
              Próximamente
            </h2>
            <p className="text-content-muted mb-6">
              Estamos preparando los productos. ¡Vuelve pronto!
            </p>
          </div>
        </section>
      )}

      {/* ── CTA final ── */}
      <AnimatedSection
        as="section"
        className="py-16 px-4 dark:bg-surface-base bg-secondary-light"
        y={16}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-secondary dark:text-white">
            ¿Listo para comprar?
          </h2>
          <p className="text-content-muted mb-8 text-lg dark:text-white/70">
            Explora todo nuestro catálogo y encuentra exactamente lo que buscas.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-secondary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
          >
            Ver catálogo completo <ArrowRight size={18} />
          </Link>
        </div>
      </AnimatedSection>

      {/* ── Banners full-width ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-6">
        <AnimatedSection className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl px-10 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 min-h-[200px]">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute right-16 -bottom-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">
              Envío express
            </p>
            <h3 className="text-white text-2xl md:text-3xl font-extrabold leading-tight mb-2 flex items-center gap-2">
              <Zap size={24} className="flex-shrink-0" />
              Recíbelo en 24 horas
            </h3>
            <p className="text-white/90 text-sm max-w-md">
              Pedidos antes de las 3 p.m. salen el mismo día. Cobertura en Lima
              Metropolitana.
            </p>
          </div>
          <Link
            href="/products"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors text-sm shadow"
          >
            Comprar ahora <ArrowRight size={16} />
          </Link>
        </AnimatedSection>

        <AnimatedSection
          className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl px-10 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 min-h-[200px]"
          delay={0.1}
        >
          <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute right-8 -top-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">
              Garantía total
            </p>
            <h3 className="text-white text-2xl md:text-3xl font-extrabold leading-tight mb-2 flex items-center gap-2">
              <RotateCcw size={24} className="flex-shrink-0" />
              30 días para cambios
            </h3>
            <p className="text-white/90 text-sm max-w-md">
              Si no estás satisfecho, te devolvemos tu dinero sin preguntas. Tu
              confianza es lo primero.
            </p>
          </div>
          <Link
            href="/products"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-violet-600 font-semibold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors text-sm shadow"
          >
            Ver productos <ArrowRight size={16} />
          </Link>
        </AnimatedSection>
      </section>

      {/* ── Video showcase ── */}
      <AnimatedSection as="section" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
            Experiencia Dimar
          </p>
          <h2 className="text-content-base text-3xl md:text-4xl font-extrabold mb-4">
            Compra inteligente,
            <br className="hidden md:block" /> vive mejor
          </h2>
          <p className="text-content-muted text-base md:text-lg mb-10 max-w-2xl mx-auto">
            Descubre cómo miles de peruanos encuentran los mejores productos al
            mejor precio, con envío rápido y atención personalizada.
          </p>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-line">
            <iframe
              src="https://www.youtube.com/embed/YE7VzlLtp-4?rel=0&modestbranding=1"
              title="Dimar Store — experiencia de compra"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
