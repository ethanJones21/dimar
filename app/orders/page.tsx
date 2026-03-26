import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, Search, Mic, Camera, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = { title: "Mis Pedidos" };

const statusColors: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending:    "Pendiente",
  processing: "En proceso",
  shipped:    "Enviado",
  delivered:  "Entregado",
  cancelled:  "Cancelado",
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

  // Traer todas las órdenes del usuario con sus items
  const { data: allOrders } = await supabase
    .from("orders")
    .select("*, items:order_items(id, quantity, unit_price, product:products(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Normaliza texto quitando tildes para búsqueda insensible a acentos
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtrar por búsqueda (ID o nombre de producto)
  const filtered = (allOrders ?? []).filter((order) => {
    if (!q.trim()) return true;
    const term = norm(q);
    const matchId = order.id.slice(0, 8).toLowerCase().includes(term);
    const matchProduct = order.items?.some((i: { product?: { name?: string } }) =>
      norm(i.product?.name ?? "").includes(term)
    );
    const matchStatus = norm(statusLabels[order.status] ?? "").includes(term);
    return matchId || matchProduct || matchStatus;
  });

  // Paginación
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Mis Pedidos</h1>

      {/* Buscador */}
      <form method="GET" className="mb-6">
        <div className="flex w-full items-center bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 rounded-full h-11 px-5 gap-3 transition-all">
          <Search size={17} className="text-slate-400 flex-shrink-0" />
          <input
            name="q"
            defaultValue={q}
            placeholder="¿Qué estás buscando?"
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 min-w-0"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {q && (
              <Link href="/orders" className="text-xs text-slate-400 hover:text-slate-600">
                Limpiar
              </Link>
            )}
            <button type="button" title="Buscar por voz" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Mic size={17} />
            </button>
            <button type="button" title="Buscar por imagen" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Camera size={17} />
            </button>
          </div>
        </div>
      </form>

      {orders.length > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {filtered.length} {filtered.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
            {q && <span> para <strong>&quot;{q}&quot;</strong></span>}
          </p>

          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="card p-6 block hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1 font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-1 max-w-sm">
                      {order.items?.map((i: { product?: { name?: string } }) => i.product?.name).filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${statusColors[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                    <p className="font-bold text-blue-600">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Link
                href={buildUrl(safePage - 1)}
                className={`p-2 rounded-lg border transition-colors ${safePage === 1 ? "opacity-30 pointer-events-none border-slate-200" : "border-slate-200 hover:border-blue-400 hover:text-blue-600"}`}
              >
                <ChevronLeft size={18} />
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                    p === safePage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {p}
                </Link>
              ))}

              <Link
                href={buildUrl(safePage + 1)}
                className={`p-2 rounded-lg border transition-colors ${safePage === totalPages ? "opacity-30 pointer-events-none border-slate-200" : "border-slate-200 hover:border-blue-400 hover:text-blue-600"}`}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          {q ? (
            <>
              <p className="text-xl font-semibold text-slate-700 mb-2">Sin resultados</p>
              <p className="text-slate-500 mb-6">No encontramos pedidos para <strong>&quot;{q}&quot;</strong></p>
              <Link href="/orders" className="btn-secondary">Ver todos los pedidos</Link>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-slate-700 mb-2">No tienes pedidos aún</p>
              <p className="text-slate-500 mb-8">Cuando realices una compra, aparecerá aquí</p>
              <Link href="/products" className="btn-primary">Ir a Comprar</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
