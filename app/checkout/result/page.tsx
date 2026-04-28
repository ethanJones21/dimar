import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

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
      icon: CheckCircle,
      iconColor: "text-green-500",
      borderColor: "border-green-500",
      label: "PAGO EXITOSO",
      title: "¡PEDIDO CONFIRMADO!",
      desc: "Tu pedido ha sido confirmado y está siendo procesado. Recibirás una notificación cuando sea enviado.",
      bg: "#0A0A0A",
    },
    failure: {
      icon: XCircle,
      iconColor: "text-red-500",
      borderColor: "border-red-500",
      label: "PAGO RECHAZADO",
      title: "ALGO SALIÓ MAL.",
      desc: "No pudimos procesar tu pago. Verifica tus datos e intenta de nuevo con otro método de pago.",
      bg: "#0A0A0A",
    },
    pending: {
      icon: Clock,
      iconColor: "text-amber-400",
      borderColor: "border-amber-400",
      label: "PAGO PENDIENTE",
      title: "VERIFICANDO PAGO.",
      desc: "Tu pago está siendo verificado. Te notificaremos cuando se confirme.",
      bg: "#0A0A0A",
    },
  };

  const cfg = configs[(status as keyof typeof configs) ?? "pending"] ?? configs.pending;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <div className={`w-20 h-20 border-4 ${cfg.borderColor} flex items-center justify-center mx-auto mb-8`}>
          <Icon size={36} className={cfg.iconColor} strokeWidth={2} />
        </div>

        {/* Label */}
        <div className={`inline-block border-2 ${cfg.borderColor} px-4 py-1 mb-6`}>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${cfg.iconColor}`}>
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display font-bold text-[#FAFAFA] mb-6"
          style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
        >
          {cfg.title}
        </h1>

        {/* Description */}
        <p className="text-xs font-mono text-[#666666] mb-10 leading-relaxed uppercase tracking-wide">
          {cfg.desc}
        </p>

        {/* Order ID */}
        {order_id && (
          <div className="border border-[rgba(255,255,255,0.1)] px-4 py-2 mb-8 inline-block">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">
              PEDIDO #{order_id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          {order_id && (
            <Link
              href={`/orders/${order_id}`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-primary hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] transition-all duration-150 cursor-pointer"
            >
              VER MI PEDIDO <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent text-[#FAFAFA] font-mono font-bold text-xs uppercase tracking-widest border-2 border-[rgba(255,255,255,0.3)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_rgba(255,255,255,0.2)] hover:border-[#FAFAFA] transition-all duration-150 cursor-pointer"
          >
            SEGUIR COMPRANDO
          </Link>
        </div>
      </div>
    </div>
  );
}
