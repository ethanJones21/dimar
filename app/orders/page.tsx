import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, Search, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = { title: "Mis Pedidos" };

const STATUS_COLORS: Record<string, string> = {
  pending:    "border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  processing: "border-primary text-primary bg-blue-50 dark:bg-blue-900/20",
  shipped:    "border-secondary text-secondary bg-purple-50 dark:bg-purple-900/20",
  delivered:  "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20",
  cancelled:  "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "PENDIENTE", processing: "EN PROCESO", shipped: "ENVIADO",
  delivered: "ENTREGADO", cancelled: "CANCELADO",
};

const PAGE_SIZE = 5;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/orders");

  const { data: allOrders } = await supabase
    .from("orders")
    .select("*, items:order_items(id, quantity, unit_price, product:products(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filtered = (allOrders ?? []).filter((order) => {
    if (!q.trim()) return true;
    const term = norm(q);
    const matchId = order.id.slice(0, 8).toLowerCase().includes(term);
    const matchProduct = order.items?.some((i: { product?: { name?: string } }) =>
      norm(i.product?.name ?? "").includes(term)
    );
    const matchStatus = norm(STATUS_LABELS[order.status] ?? "").includes(term);
    return matchId || matchProduct || matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const orders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/orders?${params}`;
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">MI CUENTA</p>
          <h1
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            MIS PEDIDOS
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <form method="GET" className="mb-8">
          <div className="flex items-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] h-12 px-4 gap-3 bg-white dark:bg-[#111111] focus-within:border-primary transition-colors">
            <Search size={16} className="text-[#888888] flex-shrink-0" strokeWidth={2} />
            <input
              name="q"
              defaultValue={q}
              placeholder="BUSCAR PEDIDOS..."
              className="flex-1 bg-transparent outline-none text-xs font-mono font-medium tracking-wider uppercase text-[#0A0A0A] dark:text-[#FAFAFA] placeholder:text-[#888888] min-w-0"
            />
            {q && (
              <Link href="/orders" className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                LIMPIAR
              </Link>
            )}
          </div>
        </form>

        {orders.length > 0 ? (
          <>
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-5">
              {filtered.length} {filtered.length === 1 ? "PEDIDO ENCONTRADO" : "PEDIDOS ENCONTRADOS"}
              {q && <span> PARA "{q.toUpperCase()}"</span>}
            </p>

            {/* Orders table */}
            <div className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] mb-8">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-start justify-between gap-4 p-5 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.4)] bg-white dark:bg-[#111111] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] transition-all duration-150 cursor-pointer mb-3 last:mb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-xs font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "border-[#888888] text-[#888888]"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#888888] mb-1">{formatDate(order.created_at)}</p>
                    <p className="text-xs font-mono text-[#888888] line-clamp-1 max-w-sm">
                      {order.items?.map((i: { product?: { name?: string } }) => i.product?.name).filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-lg text-primary">
                    {formatPrice(order.total)}
                  </p>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={buildUrl(safePage - 1)}
                  className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 ${safePage === 1 ? "opacity-30 pointer-events-none border-[#D4D4D4]" : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] cursor-pointer"}`}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildUrl(p)}
                    className={`w-10 h-10 flex items-center justify-center border-2 text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${p === safePage ? "bg-primary border-primary text-white shadow-[3px_3px_0px_#0A0A0A]" : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)]"}`}
                  >
                    {p}
                  </Link>
                ))}
                <Link
                  href={buildUrl(safePage + 1)}
                  className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 ${safePage === totalPages ? "opacity-30 pointer-events-none border-[#D4D4D4]" : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] cursor-pointer"}`}
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] py-24 text-center">
            <div className="w-16 h-16 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] flex items-center justify-center mx-auto mb-6">
              <Package size={28} className="text-[#888888]" strokeWidth={1.5} />
            </div>
            {q ? (
              <>
                <p
                  className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-3"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
                >
                  SIN RESULTADOS
                </p>
                <p className="text-xs font-mono text-[#888888] mb-8">
                  No encontramos pedidos para "{q.toUpperCase()}"
                </p>
                <Link href="/orders" className="btn-secondary text-[10px] py-2 px-6">VER TODOS</Link>
              </>
            ) : (
              <>
                <p
                  className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-3"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
                >
                  AÚN SIN PEDIDOS
                </p>
                <p className="text-xs font-mono text-[#888888] mb-8">
                  Cuando realices una compra, aparecerá aquí
                </p>
                <Link href="/products" className="btn-primary text-[10px] py-3 px-8">IR A COMPRAR</Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
