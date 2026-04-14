import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FiltersPanel from "./FiltersPanel";
import ProductsGrid from "./ProductsGrid";
import AnimatedSection from "@/components/AnimatedSection";
import { X } from "lucide-react";

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

  // ── Fetch brands (scoped to category when one is active) ──
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

  // ── Build base query (for count) ──
  const buildQuery = () => {
    let q = supabase
      .from("products")
      .select("*, category:categories(id, name, slug)", { count: "exact" })
      .eq("active", true);

    if (categoryId) q = q.eq("category_id", categoryId);

    if (params.q) {
      const normalized = params.q
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      q = q.ilike("search_name", `%${normalized}%`);
    }

    const minPrice = params.min_price ? Number(params.min_price) : null;
    const maxPrice = params.max_price ? Number(params.max_price) : null;
    if (minPrice !== null && !isNaN(minPrice)) q = q.gte("price", minPrice);
    if (maxPrice !== null && !isNaN(maxPrice)) q = q.lte("price", maxPrice);
    if (params.brand && brands.includes(params.brand))
      q = q.eq("brand", params.brand);
    if (params.sale_format === "unit" || params.sale_format === "pack")
      q = q.eq("sale_format", params.sale_format);

    return q.order("price", { ascending: true });
  };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: rawProducts,
    count,
    error: productsError,
  } = await buildQuery().range(from, to);
  if (productsError)
    console.error("[products] query error:", productsError.message);

  // ── Client-side discount filter ──
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

  // Build URL preserving all params except page
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-content-base mb-6">Productos</h1>
      </AnimatedSection>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* ── Filters sidebar ── */}
        <FiltersPanel
          brands={brands}
          categories={
            (categories ?? []) as { id: string; name: string; slug: string }[]
          }
          currentCategory={params.category ?? ""}
        />

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* ── Active category chip ── */}
          {activeCategory && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-white dark:bg-transparent ">
              <span className="text-sm text-content-muted">Categoria:</span>
              <Link
                href={buildClearCategoryUrl()}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-sm font-medium px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                {activeCategory.name}
                <X size={13} />
              </Link>
            </div>
          )}

          {/* Grid */}
          {products.length > 0 ? (
            <>
              <ProductsGrid products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Link
                    href={buildPageUrl(page - 1)}
                    aria-disabled={page === 1}
                    className={`p-2 rounded-lg border transition-colors ${
                      page === 1
                        ? "pointer-events-none border-line text-content-subtle opacity-40"
                        : "border-line text-content-muted hover:border-primary hover:text-primary"
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </Link>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Link
                        key={p}
                        href={buildPageUrl(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                          p === page
                            ? "bg-primary border-primary text-white"
                            : "border-line text-content-muted hover:border-primary hover:text-primary"
                        }`}
                      >
                        {p}
                      </Link>
                    ),
                  )}

                  <Link
                    href={buildPageUrl(page + 1)}
                    aria-disabled={page === totalPages}
                    className={`p-2 rounded-lg border transition-colors ${
                      page === totalPages
                        ? "pointer-events-none border-line text-content-subtle opacity-40"
                        : "border-line text-content-muted hover:border-primary hover:text-primary"
                    }`}
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-semibold text-content-base mb-2">
                No hay productos
              </p>
              <p className="text-content-muted">
                Intenta con otros filtros o busca otro término
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
