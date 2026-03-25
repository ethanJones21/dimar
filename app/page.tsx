import Link from "next/link";
import { ArrowRight, Shield, Truck, RefreshCw, Headphones } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import BannerSlider from "@/components/BannerSlider";
import PromoBanners from "@/components/PromoBanners";
import { Product, Banner } from "@/types";

const CATEGORY_EMOJIS: Record<string, string> = {
  electronica: "💻",
  ropa: "👕",
  hogar: "🏠",
  deportes: "⚽",
  libros: "📚",
  belleza: "✨",
};

const FEATURES = [
  { icon: Truck,       title: "Envío gratis",    desc: "En pedidos +$150.000" },
  { icon: Shield,      title: "Compra segura",   desc: "Datos siempre protegidos" },
  { icon: RefreshCw,   title: "30 días",         desc: "Para cambios y devoluciones" },
  { icon: Headphones,  title: "Soporte 24/7",    desc: "Estamos para ayudarte" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: heroBanners }, { data: promoBanners }, { data: featuredProducts }, { data: categories }] =
    await Promise.all([
      supabase.from("banners").select("*").eq("active", true).eq("type", "hero").order("order_index"),
      supabase.from("banners").select("*").eq("active", true).eq("type", "promo").order("order_index"),
      supabase.from("products").select("*, category:categories(id,name,slug)").eq("featured", true).eq("active", true).limit(8),
      supabase.from("categories").select("*").limit(6),
    ]);

  return (
    <div className="bg-slate-50">

      {/* ── Hero Slider ── */}
      <BannerSlider banners={(heroBanners as Banner[]) ?? []} />

      {/* ── Features strip ── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">
                <Icon className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categorías ── */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Explora por categoría</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              Ver todo <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="card p-4 flex flex-col items-center text-center gap-2 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {CATEGORY_EMOJIS[cat.slug] ?? "🏷️"}
                </span>
                <p className="text-xs font-medium text-slate-700 leading-tight">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Promo banners ── */}
      <PromoBanners banners={(promoBanners as Banner[]) ?? []} />

      {/* ── Productos destacados ── */}
      {featuredProducts && featuredProducts.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Productos Destacados</h2>
              <p className="text-slate-500 text-sm mt-1">Los favoritos de nuestros clientes</p>
            </div>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(featuredProducts as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-6xl mb-4">🛍️</p>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">La tienda está casi lista</h2>
            <p className="text-slate-500 mb-6">Agrega productos desde el panel de administración.</p>
            <Link href="/admin" className="btn-primary">Ir al Admin</Link>
          </div>
        </section>
      )}

      {/* ── CTA final ── */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">¿Listo para comprar?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Explora todo nuestro catálogo y encuentra exactamente lo que buscas.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Ver catálogo completo <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
