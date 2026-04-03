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
        <Link href="/orders" className="text-primary hover:text-primary-dark text-sm">← Mis Pedidos</Link>
        <h1 className="text-2xl font-bold text-content-base mt-2">
          Pedido #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-content-muted text-sm">{formatDate(order.created_at)}</p>
      </div>

      {/* Progress */}
      {order.status !== "cancelled" && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const active = i <= currentStep;
              return (
                <div key={step.key} className="relative flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${active ? "bg-primary text-white" : "bg-surface-subtle text-content-subtle"}`}>
                    <Icon size={20} />
                  </div>
                  <p className={`text-xs text-center ${active ? "text-primary font-medium" : "text-content-subtle"}`}>
                    {step.label}
                  </p>
                  {i < steps.length - 1 && (
                    <div className={`absolute h-0.5 w-full top-5 left-1/2 -z-10 ${i < currentStep ? "bg-primary" : "bg-line"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-content-base mb-4">Productos</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-surface-subtle flex-shrink-0 overflow-hidden">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-content-base">{item.product?.name}</p>
                <p className="text-sm text-content-muted">x{item.quantity} · {formatPrice(item.unit_price)} c/u</p>
              </div>
              <p className="font-bold text-content-base">{formatPrice(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6">
        <h2 className="font-bold text-content-base mb-4">Dirección de Envío</h2>
        {order.shipping_address && (
          <p className="text-content-muted">
            {order.shipping_address.street}, {order.shipping_address.city},{" "}
            {order.shipping_address.state} · {order.shipping_address.country}
          </p>
        )}
        <hr className="my-4 border-line" />
        <div className="flex justify-between font-bold text-xl">
          <span>Total Pagado</span>
          <span className="text-primary">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
