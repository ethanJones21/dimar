import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, Package, Truck, Home } from "lucide-react";

export const metadata = { title: "Detalle del Pedido" };

const steps = [
  { key: "pending", label: "Recibido", icon: CheckCircle },
  { key: "processing", label: "Procesando", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregado", icon: Home },
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(name, images, price))")
    .eq("id", id)
    .single();

  if (!order || order.user_id !== user.id) notFound();

  const currentStep = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders" className="text-blue-600 hover:text-blue-700 text-sm">← Mis Pedidos</Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">
          Pedido #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-slate-500 text-sm">{formatDate(order.created_at)}</p>
      </div>

      {/* Progress */}
      {order.status !== "cancelled" && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const active = i <= currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    <Icon size={20} />
                  </div>
                  <p className={`text-xs text-center ${active ? "text-blue-600 font-medium" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                  {i < steps.length - 1 && (
                    <div className={`absolute h-0.5 w-full top-5 left-1/2 -z-10 ${i < currentStep ? "bg-blue-600" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">Productos</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{item.product?.name}</p>
                <p className="text-sm text-slate-500">x{item.quantity} · {formatPrice(item.unit_price)} c/u</p>
              </div>
              <p className="font-bold text-slate-700">{formatPrice(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-800 mb-4">Dirección de Envío</h2>
        {order.shipping_address && (
          <p className="text-slate-600">
            {order.shipping_address.street}, {order.shipping_address.city},{" "}
            {order.shipping_address.state} · {order.shipping_address.country}
          </p>
        )}
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-xl">
          <span>Total Pagado</span>
          <span className="text-blue-600">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
