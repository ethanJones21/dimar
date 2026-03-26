import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import AddToCartButton from "./AddToCartButton";
import ProductImages from "./ProductImages";
import ReviewsSection from "./ReviewsSection";
import SimilarProducts from "./SimilarProducts";
import { Product } from "@/types";
import { Package } from "lucide-react";

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
    twitter: {
      card: "summary_large_image",
      title: p.name,
      description: p.description?.slice(0, 155) ?? p.name,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: reviews }] = await Promise.all([
    supabase.from("products").select("*, category:categories(id, name, slug)").eq("id", id).single(),
    supabase.from("reviews").select("rating").eq("product_id", id),
  ]);

  if (!product) notFound();

  const p = product as Product;

  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

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
      priceCurrency: "COP",
      price: p.price,
      availability: p.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    ...(avgRating && reviews?.length && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid md:grid-cols-2 gap-10">
        <ProductImages images={p.images} name={p.name} />

        <div>
          <p className="text-sm text-blue-600 font-medium mb-2">{p.category?.name}</p>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">{p.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-blue-600">{formatPrice(p.price)}</span>
            {p.compare_price && p.compare_price > p.price && (
              <span className="text-xl text-slate-400 line-through">{formatPrice(p.compare_price)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Package size={18} className="text-slate-400" />
            <span className={`text-sm font-medium ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {p.stock > 0 ? `${p.stock} unidades disponibles` : "Agotado"}
            </span>
          </div>

          <div className="prose prose-slate mb-8">
            <p className="text-slate-600 leading-relaxed">{p.description}</p>
          </div>

          <AddToCartButton product={p} />
        </div>
      </div>

      {p.category_id && (
        <SimilarProducts categoryId={p.category_id} excludeId={p.id} />
      )}

      <hr className="my-10 border-slate-200" />
      <ReviewsSection productId={p.id} />
    </div>
  );
}
