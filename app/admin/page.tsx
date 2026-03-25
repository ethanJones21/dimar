import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";
export const metadata = { title: "Panel de Administración" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // Stats
  const [
    { count: productCount },
    { count: orderCount },
    { count: userCount },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("status", "delivered"),
  ]);

  const revenue = revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

  const stats = [
    { label: "Productos", value: productCount || 0, icon: Package, color: "blue", href: "/admin/products" },
    { label: "Pedidos", value: orderCount || 0, icon: ShoppingBag, color: "purple", href: "/admin/orders" },
    { label: "Usuarios", value: userCount || 0, icon: Users, color: "green", href: "/admin/users" },
    { label: "Ingresos", value: formatPrice(revenue), icon: DollarSign, color: "yellow", href: "/admin/orders" },
  ];

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Panel de Administración</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Icon size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link href="/admin/products/new" className="card p-6 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors text-center group">
          <Package size={32} className="mx-auto text-blue-400 group-hover:text-blue-600 mb-3 transition-colors" />
          <p className="font-semibold text-slate-700">Agregar Producto</p>
        </Link>
        <Link href="/admin/products" className="card p-6 hover:shadow-md transition-shadow text-center">
          <Package size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="font-semibold text-slate-700">Gestionar Productos</p>
        </Link>
        <Link href="/admin/orders" className="card p-6 hover:shadow-md transition-shadow text-center">
          <ShoppingBag size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="font-semibold text-slate-700">Ver Pedidos</p>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Pedidos Recientes</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order: any) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{order.profiles?.full_name || "Cliente"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{formatPrice(order.total)}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="px-6 py-8 text-center text-slate-500">No hay pedidos aún</p>
          )}
        </div>
      </div>
    </div>
  );
}
