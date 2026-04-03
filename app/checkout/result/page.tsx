import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order_id?: string }>;
}) {
  const { status, order_id } = await searchParams;
  const supabase = await createClient();

  if (order_id) {
    if (status === "success") {
      await supabase.from("orders").update({ status: "processing" }).eq("id", order_id);
    } else if (status === "failure") {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);
    }
  }

  const configs = {
    success: {
      icon: <CheckCircle size={64} className="text-green-500 mx-auto" />,
      title: "¡Pago exitoso!",
      desc: "Tu pedido ha sido confirmado y está siendo procesado.",
      color: "text-green-600",
    },
    failure: {
      icon: <XCircle size={64} className="text-red-500 mx-auto" />,
      title: "Pago rechazado",
      desc: "No pudimos procesar tu pago. Intenta con otro método.",
      color: "text-red-600",
    },
    pending: {
      icon: <Clock size={64} className="text-amber-500 mx-auto" />,
      title: "Pago pendiente",
      desc: "Tu pago está siendo verificado. Te notificaremos cuando se confirme.",
      color: "text-amber-600",
    },
  };

  const config = configs[(status as keyof typeof configs) ?? "pending"] ?? configs.pending;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="mb-4">{config.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${config.color}`}>{config.title}</h1>
        <p className="text-content-muted mb-8">{config.desc}</p>
        <div className="flex flex-col gap-3">
          {order_id && (
            <Link href={`/orders/${order_id}`} className="btn-primary">
              Ver mi pedido
            </Link>
          )}
          <Link href="/products" className="btn-secondary">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
