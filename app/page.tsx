import Link from "next/link";
import {
  type LucideIcon,
  ArrowRight,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
  Laptop,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Sparkles,
  Zap,
  RotateCcw,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import BannerSlider from "@/components/BannerSlider";
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
  { icon: Truck, title: "ENVÍO GRATIS", desc: "En pedidos +S/150" },
  { icon: Shield, title: "COMPRA SEGURA", desc: "Datos siempre protegidos" },
  { icon: RefreshCw, title: "30 DÍAS", desc: "Para cambios y devoluciones" },
  { icon: Headphones, title: "SOPORTE 24/7", desc: "Estamos para ayudarte" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: heroBanners },
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
      contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "contacto@dimar.pe" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Slider ── */}
      <BannerSlider banners={(heroBanners as Banner[]) ?? []} />

      {/* ── Features strip ── */}
      <section className="bg-[#0A0A0A] border-b-2 border-[#0A0A0A]">
        <AnimatedStagger className="max-w-7xl mx-auto px-4 py-0 grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-[rgba(255,255,255,0.12)]">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-6 py-5">
              <Icon className="text-primary flex-shrink-0" size={20} strokeWidth={2} />
              <div>
                <p className="font-mono font-bold text-[10px] text-[#FAFAFA] uppercase tracking-widest">
                  {title}
                </p>
                <p className="text-[10px] font-mono text-[#666666] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </AnimatedStagger>
      </section>

      {/* ── Categories ── */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <AnimatedSection className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
                NAVEGAR POR
              </p>
              <h2 className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                CATEGORÍAS
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-primary hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              VER TODO <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </AnimatedSection>

          <AnimatedStagger className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.slug] ?? Tag;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center gap-3 p-4 bg-white dark:bg-[#111111] border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.4)] transition-all duration-150 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-[#0A0A0A] dark:border-transparent group-hover:bg-[#0A0A0A] transition-colors">
                    <CatIcon size={18} className="text-white" strokeWidth={2} />
                  </div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wide text-[#0A0A0A] dark:text-[#FAFAFA] leading-tight">
                    {cat.name}
                  </p>
                </Link>
              );
            })}
          </AnimatedStagger>
        </section>
      )}

      {/* ── Manifesto strip ── */}
      <AnimatedSection as="section" className="bg-primary border-y-4 border-[#0A0A0A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex-1">
            <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest mb-4">
              NUESTRA MISIÓN
            </p>
            <h2
              className="font-display font-bold text-white"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)", lineHeight: 1.0, letterSpacing: "-0.02em" }}
            >
              CALIDAD SIN<br />COMPROMISO.
            </h2>
          </div>
          <div className="md:max-w-sm">
            <p className="text-sm font-mono text-white/75 leading-relaxed mb-6">
              En Dimar creemos que acceder a buenos productos no debería ser complicado.
              Por eso, cubrimos desde la selección hasta la entrega en tu puerta.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-widest border-2 border-[#0A0A0A] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] transition-all duration-150 cursor-pointer"
            >
              VER CATÁLOGO <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Featured Products ── */}
      {featuredProducts && featuredProducts.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <AnimatedSection className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
                SELECCIÓN ESPECIAL
              </p>
              <h2
                className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                DESTACADOS
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-primary hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              VER TODOS <ArrowRight size={14} strokeWidth={2.5} />
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
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-16 text-center">
            <ShoppingBag size={48} className="mx-auto text-[#888888] mb-6" strokeWidth={1.5} />
            <h2
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-3"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
            >
              PRÓXIMAMENTE
            </h2>
            <p className="text-xs font-mono text-[#888888] mb-8">
              Estamos preparando los productos. ¡Vuelve pronto!
            </p>
          </div>
        </section>
      )}

      {/* ── Promo blocks ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16 grid md:grid-cols-2 gap-4">
        <AnimatedSection className="bg-[#0A0A0A] border-2 border-[#0A0A0A] p-10 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 border-2 border-[rgba(255,255,255,0.06)] pointer-events-none" />
          <div>
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
              ENVÍO EXPRESS
            </p>
            <div className="flex items-start gap-3">
              <Zap size={28} className="text-primary flex-shrink-0 mt-1" strokeWidth={2} />
              <h3
                className="font-display font-bold text-white"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
              >
                RECÍBELO EN 24 HORAS
              </h3>
            </div>
            <p className="text-xs font-mono text-[#666666] mt-4 leading-relaxed">
              Pedidos antes de las 3 p.m. salen el mismo día. Cobertura en Lima Metropolitana.
            </p>
          </div>
          <Link
            href="/products"
            className="self-start inline-flex items-center gap-2 px-5 py-3 bg-primary text-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-primary hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] transition-all duration-150 cursor-pointer"
          >
            COMPRAR AHORA <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="bg-secondary border-2 border-[#0A0A0A] p-10 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 border-2 border-[rgba(255,255,255,0.06)] pointer-events-none" />
          <div>
            <p className="text-[10px] font-mono text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-3">
              GARANTÍA TOTAL
            </p>
            <div className="flex items-start gap-3">
              <RotateCcw size={28} className="text-white flex-shrink-0 mt-1" strokeWidth={2} />
              <h3
                className="font-display font-bold text-white"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
              >
                30 DÍAS PARA CAMBIOS
              </h3>
            </div>
            <p className="text-xs font-mono text-[rgba(255,255,255,0.55)] mt-4 leading-relaxed">
              Si no estás satisfecho, te devolvemos tu dinero sin preguntas. Tu confianza es lo primero.
            </p>
          </div>
          <Link
            href="/products"
            className="self-start inline-flex items-center gap-2 px-5 py-3 bg-white text-secondary font-mono font-bold text-xs uppercase tracking-widest border-2 border-[#0A0A0A] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] transition-all duration-150 cursor-pointer"
          >
            VER PRODUCTOS <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </AnimatedSection>
      </section>

      {/* ── Video showcase ── */}
      <AnimatedSection as="section" className="bg-[#0A0A0A] border-t-4 border-b-4 border-[#0A0A0A] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
              EXPERIENCIA DIMAR
            </p>
            <h2
              className="font-display font-bold text-[#FAFAFA]"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
            >
              COMPRA INTELIGENTE,<br />VIVE MEJOR.
            </h2>
          </div>
          <div className="relative w-full aspect-video border-2 border-[rgba(255,255,255,0.2)] overflow-hidden">
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

      {/* ── Newsletter CTA ── */}
      <AnimatedSection as="section" className="max-w-7xl mx-auto px-4 py-16">
        <div className="border-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] p-10 md:p-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-3">
              NO TE PIERDAS NADA
            </p>
            <h2
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
            >
              ¿LISTO PARA COMPRAR?
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0A0A0A] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-widest border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#2563EB] transition-all duration-150 cursor-pointer flex-shrink-0"
          >
            EXPLORAR TODO <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
