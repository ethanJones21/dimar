import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package } from "lucide-react";

export const metadata = { title: "Mis Pedidos" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(id, quantity, unit_price, product:products(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Mis Pedidos</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="card p-6 block hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {order.items?.map((i: any) => i.product?.name).filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${statusColors[order.status] || "bg-slate-100 text-slate-600"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  <p className="font-bold text-blue-600">{formatPrice(order.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">No tienes pedidos aún</p>
          <p className="text-slate-500 mb-8">Cuando realices una compra, aparecerá aquí</p>
          <Link href="/products" className="btn-primary">Ir a Comprar</Link>
        </div>
      )}
    </div>
  );
}
