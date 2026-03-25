import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderStatusSelect from "./OrderStatusSelect";
export const metadata = { title: "Pedidos - Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, id), items:order_items(id)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">Pedidos</h1>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600"># Pedido</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Cliente</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Fecha</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Total</th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Items</th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <Link href={`/orders/${order.id}`} className="font-mono text-sm text-blue-600 hover:underline">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{order.profiles?.full_name || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(order.created_at)}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-700">{formatPrice(order.total)}</td>
                <td className="px-6 py-4 text-center text-sm text-slate-500">{order.items?.length || 0}</td>
                <td className="px-6 py-4">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="text-center py-12 text-slate-500">No hay pedidos todavía</p>
        )}
      </div>
    </div>
  );
}
