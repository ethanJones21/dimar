"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { Address } from "@/types";
import { CreditCard, MapPin, Smartphone, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");

  const [address, setAddress] = useState<Address>({
    street: "", city: "", state: "", zip: "", country: "Perú",
  });
  const [savedAddress, setSavedAddress] = useState(false);

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

          {/* ── Paso 2: Pago con MercadoPago ── */}
          {step === "payment" && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="font-bold text-lg text-content-base mb-1 flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" /> Método de pago
                </h2>

                <div className="mt-4 p-4 border-2 border-[#009ee3] rounded-xl bg-[#009ee3]/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#009ee3] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-extrabold text-xs">MP</span>
                    </div>
                    <div>
                      <p className="font-semibold text-content-base">MercadoPago</p>
                      <p className="text-xs text-content-muted">Tarjeta, Yape, transferencia y más</p>
                    </div>
                  </div>

                  <p className="text-sm text-content-muted mb-4">
                    Serás redirigido a MercadoPago donde podrás pagar con <strong>Yape</strong>, tarjeta o transferencia bancaria.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
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
                </div>
              </div>

              <button onClick={() => setStep("shipping")} className="btn-secondary w-full">
                Volver a envío
              </button>
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
