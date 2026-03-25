import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { Suspense } from "react";
import SortSelect from "./SortSelect";

interface SearchParams {
  category?: string;
  q?: string;
  sort?: string;
}

export const metadata = { title: "Productos" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let categoryId: string | null = null;
  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    categoryId = cat?.id ?? null;
  }

  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("active", true);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;
  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Productos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {/* Category tabs */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <a
            href="/products"
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !params.category
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border hover:border-blue-300"
            }`}
          >
            Todos
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                params.category === cat.slug
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border hover:border-blue-300"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {/* Grid */}
      {products && products.length > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {products.length} productos encontrados
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-slate-700 mb-2">
            No hay productos
          </p>
          <p className="text-slate-500">
            Intenta con otros filtros o busca otro término
          </p>
        </div>
      )}
    </div>
  );
}
