"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { Address } from "@/types";
import { CreditCard, MapPin, Lock, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

type PaymentMethod = null | "culqi" | "mercadopago";

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

async function tokenizeCard(card: CardData, email: string): Promise<string> {
  const [month, year] = card.expiry.split("/");
  const res = await fetch("https://secure.culqi.com/v2/tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      card_number: card.number.replace(/\s/g, ""),
      cvv: card.cvv,
      expiration_month: month,
      expiration_year: `20${year}`,
      email,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.object === "error")
    throw new Error(data.user_message ?? "Error al tokenizar tarjeta");
  return data.id;
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

  const [address, setAddress] = useState<Address>({
    street: "", city: "", state: "", zip: "", country: "Perú",
  });
  const [savedAddress, setSavedAddress] = useState(false);
  const [card, setCard] = useState<CardData>({ number: "", name: "", expiry: "", cvv: "" });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("addresses")
        .select("street, city, state, zip, country")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          setAddress({ street: data.street, city: data.city, state: data.state, zip: data.zip ?? "", country: data.country });
          setSavedAddress(true);
        });
    });
  }, []);

  const handleShippingNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  // ── Culqi ──────────────────────────────────────────────
  const handleCulqiPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirect=/checkout"); return; }

      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({ user_id: user.id, status: "pending", total: total(), shipping_address: address })
        .select().single();
      if (oErr) throw oErr;

      await supabase.from("order_items").insert(
        items.map(({ product, quantity }) => ({
          order_id: order.id, product_id: product.id,
          quantity, unit_price: product.price,
        }))
      );

      const token = await tokenizeCard(card, user.email!);

      const chargeRes = await fetch("/api/culqi/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, orderId: order.id, email: user.email, amount: Math.round(total() * 100) }),
      });
      const chargeData = await chargeRes.json();
      if (!chargeRes.ok) throw new Error(chargeData.error);

      clearCart();
      toast("¡Pago exitoso! Tu pedido está en camino.", "success");
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Error al procesar el pago.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── MercadoPago ────────────────────────────────────────
  const handleMercadoPago = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirect=/checkout"); return; }

      const res = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: null,
          email: user.email,
          address,
          items: items.map(({ product, quantity }) => ({
            title: product.name,
            quantity,
            unit_price: product.price,
            product_id: product.id,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearCart();
      // Redirigir al checkout de MercadoPago
      const isSandbox = process.env.NODE_ENV !== "production";
      window.location.href = isSandbox ? data.sandboxInitPoint : data.initPoint;
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Error al conectar con MercadoPago.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) { router.push("/cart"); return null; }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-content-base mb-2">Finalizar Compra</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={`flex items-center gap-1.5 font-medium ${step === "shipping" ? "text-primary" : "text-content-subtle"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "shipping" ? "bg-primary text-white" : "bg-surface-subtle text-content-muted"}`}>1</span>
          Envío
        </span>
        <div className="flex-1 h-px bg-surface-subtle" />
        <span className={`flex items-center gap-1.5 font-medium ${step === "payment" ? "text-primary" : "text-content-subtle"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "bg-primary text-white" : "bg-surface-subtle text-content-muted"}`}>2</span>
          Pago
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          {/* ── Paso 1: Envío ── */}
          {step === "shipping" && (
            <form onSubmit={handleShippingNext}>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-content-base flex items-center gap-2">
                    <MapPin size={20} className="text-primary" /> Dirección de Envío
                  </h2>
                  {savedAddress && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 size={13} /> Dirección guardada
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-content-base mb-1">Dirección</label>
                    <input required className="input" placeholder="Av. Larco 123, Miraflores"
                      value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-content-base mb-1">Ciudad</label>
                      <input required className="input" placeholder="Lima"
                        value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-content-base mb-1">Departamento</label>
                      <input required className="input" placeholder="Lima"
                        value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content-base mb-1">Código Postal</label>
                    <input className="input" placeholder="15001"
                      value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">
                Continuar al pago
              </button>
            </form>
          )}

          {/* ── Paso 2: Método de pago ── */}
          {step === "payment" && (
            <div className="space-y-4">

              {/* Selección */}
              {!paymentMethod && (
                <div className="card p-6">
                  <h2 className="font-bold text-lg text-content-base mb-5 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" /> Elige cómo pagar
                  </h2>

                  {/* MercadoPago (incluye Yape) */}
                  <button
                    onClick={() => setPaymentMethod("mercadopago")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-line rounded-xl hover:border-primary hover:bg-primary-light transition-all mb-3 text-left"
                  >
                    <div className="w-12 h-12 bg-[#009ee3] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-extrabold text-sm">MP</span>
                    </div>
                    <div>
                      <p className="font-semibold text-content-base">MercadoPago</p>
                      <p className="text-xs text-content-muted">Tarjeta, Yape, transferencia y más</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Smartphone size={10} /> Yape
                      </span>
                    </div>
                  </button>

                  {/* Culqi */}
                  <button
                    onClick={() => setPaymentMethod("culqi")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-line rounded-xl hover:border-primary hover:bg-primary-light transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-content-base">Tarjeta de crédito / débito</p>
                      <p className="text-xs text-content-muted">Visa, Mastercard, Amex — vía Culqi</p>
                    </div>
                  </button>
                </div>
              )}

              {/* ── MercadoPago: confirmar y redirigir ── */}
              {paymentMethod === "mercadopago" && (
                <div className="card p-6">
                  <h2 className="font-bold text-lg text-content-base mb-1 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#009ee3] rounded-lg flex items-center justify-center text-white font-extrabold text-xs">MP</span>
                    Pagar con MercadoPago
                  </h2>
                  <p className="text-sm text-content-muted mb-6">
                    Serás redirigido a MercadoPago donde podrás pagar con <strong>Yape</strong>, tarjeta o transferencia bancaria.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Yape", "Visa", "Mastercard", "Amex", "BCP", "Interbank"].map((m) => (
                      <span key={m} className={`text-xs font-medium px-2.5 py-1 rounded-full ${m === "Yape" ? "bg-purple-100 text-purple-700" : "bg-surface-subtle text-content-muted"}`}>
                        {m === "Yape" && <Smartphone size={10} className="inline mr-1" />}{m}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={handleMercadoPago}
                    disabled={loading}
                    className="w-full py-3 bg-[#009ee3] hover:bg-[#0088cc] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? "Conectando..." : `Ir a pagar ${formatPrice(total())}`}
                  </button>

                  <button onClick={() => setPaymentMethod(null)} className="w-full mt-3 btn-secondary">
                    Cambiar método
                  </button>
                </div>
              )}

              {/* ── Culqi: formulario tarjeta ── */}
              {paymentMethod === "culqi" && (
                <form onSubmit={handleCulqiPay}>
                  <div className="card p-6">
                    <h2 className="font-bold text-lg text-content-base mb-1 flex items-center gap-2">
                      <CreditCard size={20} className="text-primary" /> Datos de la Tarjeta
                    </h2>
                    <p className="text-xs text-content-subtle mb-5 flex items-center gap-1">
                      <Lock size={12} /> Conexión segura — datos cifrados por Culqi
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-content-base mb-1">Número de tarjeta</label>
                        <input required className="input font-mono tracking-wider" placeholder="0000 0000 0000 0000"
                          value={card.number} maxLength={19}
                          onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-content-base mb-1">Nombre en la tarjeta</label>
                        <input required className="input uppercase" placeholder="JUAN PEREZ"
                          value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-content-base mb-1">Vencimiento</label>
                          <input required className="input font-mono" placeholder="MM/AA"
                            value={card.expiry} maxLength={5}
                            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-content-base mb-1">CVV</label>
                          <input required type="password" className="input font-mono" placeholder="•••"
                            value={card.cvv} maxLength={4}
                            onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-line-subtle">
                      <ShieldCheck size={16} className="text-green-500" />
                      <span className="text-xs text-content-subtle">Visa · Mastercard · Amex · Diners</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setPaymentMethod(null)} className="btn-secondary flex-1">
                      Cambiar método
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <Lock size={16} />
                      {loading ? "Procesando..." : `Pagar ${formatPrice(total())}`}
                    </button>
                  </div>
                </form>
              )}

              {!paymentMethod && (
                <button onClick={() => setStep("shipping")} className="btn-secondary w-full">
                  Volver a envío
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg text-content-base mb-4">Resumen del Pedido</h2>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-content-muted truncate max-w-[200px]">{product.name} ×{quantity}</span>
                <span className="font-medium">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between text-sm text-content-muted mb-2">
            <span>Subtotal</span><span>{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-sm text-content-muted mb-4">
            <span>Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
