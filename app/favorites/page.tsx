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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = ((data ?? []) as any[]).map((f) => f.product).filter(Boolean) as Product[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">MI CUENTA</p>
          <h1
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] flex items-center gap-4"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            MIS FAVORITOS
            <Heart size={32} className="text-red-500 fill-red-500 flex-shrink-0" strokeWidth={2} />
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {total > 0 ? (
          <>
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-6">
              {total} {total === 1 ? "PRODUCTO GUARDADO" : "PRODUCTOS GUARDADOS"}
              {totalPages > 1 && ` — PÁGINA ${page} DE ${totalPages}`}
            </p>

            <div className="grid grid-cols-1 min-[453px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-sm min-[453px]:max-w-none mx-auto min-[453px]:mx-0">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Link
                  href={`/favorites?page=${page - 1}`}
                  aria-disabled={page === 1}
                  className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 ${page === 1 ? "pointer-events-none border-[#D4D4D4] opacity-40" : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] cursor-pointer"}`}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </Link>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/favorites?page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center border-2 text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${p === page ? "bg-primary border-primary text-white shadow-[3px_3px_0px_#0A0A0A]" : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)]"}`}
                  >
                    {p}
                  </Link>
                ))}

                <Link
                  href={`/favorites?page=${page + 1}`}
                  aria-disabled={page === totalPages}
                  className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 ${page === totalPages ? "pointer-events-none border-[#D4D4D4] opacity-40" : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] cursor-pointer"}`}
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] py-24 text-center">
            <div className="w-16 h-16 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-[#888888]" strokeWidth={1.5} />
            </div>
            <p
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-3"
              style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
            >
              AÚN SIN FAVORITOS
            </p>
            <p className="text-xs font-mono text-[#888888] mb-8 uppercase tracking-widest">
              Guarda los productos que te gusten con el ícono de corazón
            </p>
            <Link href="/products" className="btn-primary text-[10px] py-3 px-8">
              EXPLORAR PRODUCTOS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
