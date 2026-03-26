import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis Favoritos" };

const PAGE_SIZE = 8;

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/favorites");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("favorites")
    .select("product:products(*, category:categories(id, name, slug))", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const products = (data ?? [])
    .map((f) => f.product)
    .filter(Boolean) as Product[];

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold text-slate-800">Mis Favoritos</h1>
      </div>

      {total > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-6">
            {total} {total === 1 ? "producto guardado" : "productos guardados"}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Link
                href={`/favorites?page=${page - 1}`}
                aria-disabled={page === 1}
                className={`p-2 rounded-lg border transition-colors ${
                  page === 1
                    ? "pointer-events-none border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ChevronLeft size={18} />
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/favorites?page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                    p === page
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </Link>
              ))}

              <Link
                href={`/favorites?page=${page + 1}`}
                aria-disabled={page === totalPages}
                className={`p-2 rounded-lg border transition-colors ${
                  page === totalPages
                    ? "pointer-events-none border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-slate-200 mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">No tienes favoritos aún</p>
          <p className="text-slate-500 mb-8">
            Guarda los productos que te gusten con el ícono ❤️
          </p>
          <Link href="/products" className="btn-primary">Explorar productos</Link>
        </div>
      )}
    </div>
  );
}
