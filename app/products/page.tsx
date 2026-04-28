import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import FiltersPanel from "./FiltersPanel";
import ProductsGrid from "./ProductsGrid";
import AnimatedSection from "@/components/AnimatedSection";

const PAGE_SIZE = 15;

interface SearchParams {
  category?: string;
  q?: string;
  min_price?: string;
  max_price?: string;
  brand?: string;
  discount?: string;
  sale_format?: string;
  page?: string;
}

export const metadata = { title: "Productos" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  // ── Category lookup ──
  let categoryId: string | null = null;
  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    categoryId = cat?.id ?? null;
  }

  // ── Fetch brands scoped to category ──
  let brandsQuery = supabase
    .from("products")
    .select("brand")
    .eq("active", true)
    .not("brand", "is", null);
  if (categoryId) brandsQuery = brandsQuery.eq("category_id", categoryId);
  const { data: brandsRaw, error: brandsError } = await brandsQuery;

  const brands = brandsError
    ? []
    : ([
        ...new Set(
          (brandsRaw ?? [])
            .map((r: { brand?: string | null }) => r.brand)
            .filter((b): b is string => Boolean(b)),
        ),
      ].sort() as string[]);

  // ── Build query ──
  const buildQuery = () => {
    let q = supabase
      .from("products")
      .select("*, category:categories(id, name, slug)", { count: "exact" })
      .eq("active", true);

    if (categoryId) q = q.eq("category_id", categoryId);

    if (params.q) {
      const normalized = params.q
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
      q = q.ilike("name", `%${normalized}%`);
    }

    const minPrice = params.min_price ? Number(params.min_price) : null;
    const maxPrice = params.max_price ? Number(params.max_price) : null;
    if (minPrice !== null && !isNaN(minPrice)) q = q.gte("price", minPrice);
    if (maxPrice !== null && !isNaN(maxPrice)) q = q.lte("price", maxPrice);
    if (params.brand && brands.includes(params.brand)) q = q.eq("brand", params.brand);
    if (params.sale_format === "unit" || params.sale_format === "pack")
      q = q.eq("sale_format", params.sale_format);

    return q.order("price", { ascending: true });
  };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: rawProducts, count, error: productsError } = await buildQuery().range(from, to);
  if (productsError) console.error("[products] query error:", productsError.message);

  let products = (rawProducts ?? []) as Product[];
  if (params.discount) {
    const minRatio = parseInt(params.discount, 10) / 100;
    products = products.filter(
      (p) =>
        p.compare_price &&
        p.compare_price > p.price &&
        (p.compare_price - p.price) / p.compare_price >= minRatio,
    );
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { data: categories } = await supabase.from("categories").select("*");

  const activeCategory = params.category
    ? (categories ?? []).find(
        (c: { slug: string; name: string }) => c.slug === params.category,
      )
    : null;

  const buildClearCategoryUrl = () => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.min_price) sp.set("min_price", params.min_price);
    if (params.max_price) sp.set("max_price", params.max_price);
    if (params.brand) sp.set("brand", params.brand);
    if (params.discount) sp.set("discount", params.discount);
    if (params.sale_format) sp.set("sale_format", params.sale_format);
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (params.category) sp.set("category", params.category);
    if (params.q) sp.set("q", params.q);
    if (params.min_price) sp.set("min_price", params.min_price);
    if (params.max_price) sp.set("max_price", params.max_price);
    if (params.brand) sp.set("brand", params.brand);
    if (params.discount) sp.set("discount", params.discount);
    if (params.sale_format) sp.set("sale_format", params.sale_format);
    sp.set("page", String(p));
    return `/products?${sp.toString()}`;
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <AnimatedSection>
            {activeCategory ? (
              <div>
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
                  CATEGORÍA
                </p>
                <h1
                  className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                  style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
                >
                  {activeCategory.name.toUpperCase()}
                </h1>
              </div>
            ) : params.q ? (
              <div>
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
                  RESULTADOS PARA
                </p>
                <h1
                  className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                  style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
                >
                  "{params.q.toUpperCase()}"
                </h1>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
                  CATÁLOGO COMPLETO
                </p>
                <h1
                  className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                  style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
                >
                  TODOS LOS PRODUCTOS
                </h1>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* ── Filters sidebar ── */}
          <FiltersPanel
            brands={brands}
            categories={(categories ?? []) as { id: string; name: string; slug: string }[]}
            currentCategory={params.category ?? ""}
          />

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Active category chip */}
            {activeCategory && (
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">
                  CATEGORÍA:
                </span>
                <Link
                  href={buildClearCategoryUrl()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-primary text-primary text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  {activeCategory.name.toUpperCase()}
                  <X size={11} strokeWidth={2.5} />
                </Link>
              </div>
            )}

            {/* Count */}
            {total > 0 && (
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-5">
                {total} PRODUCTO{total !== 1 ? "S" : ""}
                {page > 1 && ` — PÁGINA ${page} DE ${totalPages}`}
              </p>
            )}

            {/* Grid */}
            {products.length > 0 ? (
              <>
                <ProductsGrid products={products} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Link
                      href={buildPageUrl(page - 1)}
                      aria-disabled={page === 1}
                      className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 ${
                        page === 1
                          ? "pointer-events-none border-[#D4D4D4] text-[#D4D4D4] opacity-40"
                          : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] cursor-pointer"
                      }`}
                    >
                      <ChevronLeft size={16} strokeWidth={2.5} />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={buildPageUrl(p)}
                        className={`w-10 h-10 flex items-center justify-center border-2 text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                          p === page
                            ? "bg-primary border-primary text-white shadow-[3px_3px_0px_#0A0A0A]"
                            : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)]"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}

                    <Link
                      href={buildPageUrl(page + 1)}
                      aria-disabled={page === totalPages}
                      className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 ${
                        page === totalPages
                          ? "pointer-events-none border-[#D4D4D4] text-[#D4D4D4] opacity-40"
                          : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] cursor-pointer"
                      }`}
                    >
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="py-24 text-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
                <div className="w-16 h-16 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] flex items-center justify-center mx-auto mb-6">
                  <Search size={28} className="text-[#888888]" strokeWidth={1.5} />
                </div>
                <p
                  className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-3"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
                >
                  SIN RESULTADOS
                </p>
                <p className="text-xs font-mono text-[#888888] mb-8">
                  Intenta con otros filtros o busca otro término
                </p>
                <Link href="/products" className="btn-secondary text-[10px] py-2 px-6">
                  VER TODO
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
