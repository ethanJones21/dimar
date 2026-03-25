import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import ProductImages from "./ProductImages";
import { Product } from "@/types";
import { Package, Star } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name").eq("id", id).single();
  return { title: data?.name || "Producto" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const p = product as Product;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
    </div>
  );
}
