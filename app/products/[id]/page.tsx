import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import AddToCartButton from "./AddToCartButton";
import ProductImages from "./ProductImages";
import ReviewsSection from "./ReviewsSection";
import SimilarProducts from "./SimilarProducts";
import { Product } from "@/types";
import { Package, Tag } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("products")
    .select("name, description, images, price")
    .eq("id", id)
    .single();

  if (!p) return { title: "Producto" };

  const image = p.images?.[0];
  return {
    title: p.name,
    description: p.description?.slice(0, 155) ?? p.name,
    openGraph: {
      title: p.name,
      description: p.description?.slice(0, 155) ?? p.name,
      type: "website",
      images: image ? [{ url: image, alt: p.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: reviews }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("id", id)
      .single(),
    supabase.from("reviews").select("rating").eq("product_id", id),
  ]);

  if (!product) notFound();

  const p = product as Product;

  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  const hasDiscount = p.compare_price && p.compare_price > p.price;
  const discountPct = hasDiscount
    ? Math.round(((p.compare_price! - p.price) / p.compare_price!) * 100)
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? p.name,
    image: p.images ?? [],
    sku: p.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${p.id}`,
      priceCurrency: "PEN",
      price: p.price,
      availability:
        p.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    ...(avgRating &&
      reviews?.length && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount: reviews.length,
        },
      }),
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Main product section ── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

          {/* Images */}
          <AnimatedSection y={20} className="relative z-10">
            <ProductImages images={p.images} name={p.name} />
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection y={20} delay={0.1}>
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {p.category?.name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[10px] font-mono font-bold uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA]">
                  <Tag size={10} strokeWidth={2.5} />
                  {p.category.name}
                </span>
              )}
              {hasDiscount && (
                <span className="px-3 py-1 bg-primary text-white border-2 border-[#0A0A0A] text-[10px] font-mono font-bold uppercase tracking-widest">
                  -{discountPct}% OFF
                </span>
              )}
              {p.sale_format === "pack" && (
                <span className="px-3 py-1 bg-secondary text-white border-2 border-[#0A0A0A] text-[10px] font-mono font-bold uppercase tracking-widest">
                  {p.pack_size ? `PACK ×${p.pack_size}` : "PACK"}
                </span>
              )}
            </div>

            {/* Product name — oversized */}
            <h1
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              {p.name}
            </h1>

            {/* Price — statement */}
            <div className="mb-6 pb-6 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)]">
              <div className="flex items-baseline gap-4">
                <span
                  className="font-mono font-bold text-primary"
                  style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em" }}
                >
                  {formatPrice(p.price)}
                </span>
                {hasDiscount && (
                  <span className="font-mono text-lg text-[#888888] line-through">
                    {formatPrice(p.compare_price!)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-2 h-2 flex-shrink-0 ${p.stock > 0 ? "bg-green-500" : "bg-red-500"}`}
              />
              <div className="flex items-center gap-2">
                <Package size={15} strokeWidth={2} className="text-[#888888]" />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-widest ${p.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
                >
                  {p.stock > 0 ? `${p.stock} UNIDADES DISPONIBLES` : "AGOTADO"}
                </span>
              </div>
            </div>

            {/* Description */}
            {p.description && (
              <div className="mb-8">
                <p className="text-sm font-mono text-[#444444] dark:text-[#AAAAAA] leading-relaxed">
                  {p.description}
                </p>
              </div>
            )}

            {/* Specs table (brand, sku, format) */}
            {(p.brand || p.sale_format) && (
              <div className="mb-8 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
                {p.brand && (
                  <div className="flex border-b border-[#0A0A0A]/20 dark:border-[rgba(255,255,255,0.1)]">
                    <span className="w-28 shrink-0 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] border-r-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)]">
                      MARCA
                    </span>
                    <span className="px-4 py-3 text-xs font-mono text-[#0A0A0A] dark:text-[#FAFAFA]">
                      {p.brand}
                    </span>
                  </div>
                )}
                {p.sale_format && (
                  <div className="flex">
                    <span className="w-28 shrink-0 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] border-r-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)]">
                      FORMATO
                    </span>
                    <span className="px-4 py-3 text-xs font-mono text-[#0A0A0A] dark:text-[#FAFAFA]">
                      {p.sale_format === "pack"
                        ? `PACK ${p.pack_size ? `×${p.pack_size}` : ""}`
                        : "UNIDAD"}
                    </span>
                  </div>
                )}
              </div>
            )}

            <AddToCartButton product={p} />
          </AnimatedSection>
        </div>

        {/* ── Similar products ── */}
        {p.category_id && (
          <AnimatedSection className="mt-16 pt-12 border-t-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
            <SimilarProducts categoryId={p.category_id} excludeId={p.id} />
          </AnimatedSection>
        )}

        {/* ── Reviews ── */}
        <div className="mt-12 pt-12 border-t-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
          <AnimatedSection>
            <ReviewsSection productId={p.id} />
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
