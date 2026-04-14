"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { Address } from "@/types";
import { CreditCard, MapPin, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: new (publicKey: string, options?: object) => any;
  }
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [sdkReady, setSdkReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mpRef = useRef<any>(null);

  const [address, setAddress] = useState<Address>({
    street: "", city: "", state: "", zip: "", country: "Perú",
  });
  const [savedAddress, setSavedAddress] = useState(false);

  // Campos de tarjeta (Core Methods — inputs React normales, sin iframes)
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [cvv, setCvv] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [installments, setInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<{ installments: number; recommended_message: string }[]>([]);

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

  // Esperar hydración de Zustand antes de redirigir
  useEffect(() => {
    const check = () => {
      setMounted(true);
      if (useCartStore.getState().items.length === 0) router.push("/cart");
    };
    if (useCartStore.persist.hasHydrated()) {
      check();
    } else {
      const unsub = useCartStore.persist.onFinishHydration(check);
      return unsub;
    }
  }, [router]);

  // Inicializar instancia de MP cuando el SDK carga
  useEffect(() => {
    if (!sdkReady) return;
    mpRef.current = new window.MercadoPago(
      process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!,
      { locale: "es-PE" }
    );
  }, [sdkReady]);

  // Obtener cuotas cuando se tienen los primeros 6 dígitos
  useEffect(() => {
    const bin = cardNumber.replace(/\D/g, "").slice(0, 6);
    if (bin.length < 6 || !mpRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mpRef.current.getInstallments({ amount: String(total()), bin }).then((result: any[]) => {
      const costs = result?.[0]?.payer_costs ?? [];
      setInstallmentOptions(costs);
      if (costs.length > 0) setInstallments(costs[0].installments);
    }).catch(() => {});
  }, [cardNumber, total]);

  const handleShippingNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  // Mapear códigos de error del SDK de MercadoPago a mensajes amigables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getMpErrorMessage = (err: any): string => {
    const causes: { code?: string }[] = err?.cause ?? [];
    const codeMap: Record<string, string> = {
      "205": "Mes de vencimiento inválido",
      "208": "Año de vencimiento inválido",
      "209": "Año de vencimiento inválido",
      "221": "Nombre del titular inválido",
      "224": "Código de seguridad (CVV) inválido",
      "325": "Mes de vencimiento inválido",
      "326": "Año de vencimiento inválido",
      "E301": "Número de tarjeta inválido",
      "E302": "Código de seguridad (CVV) inválido",
      "316": "Nombre del titular inválido",
      "322": "Tipo de documento inválido",
      "323": "Número de DNI inválido",
      "324": "Número de DNI inválido",
    };
    if (Array.isArray(causes) && causes.length > 0) {
      const msgs = causes
        .map((c) => codeMap[c.code ?? ""] ?? `Error en los datos de la tarjeta (${c.code})`)
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join(". ");
    }
    return err?.message ?? "Error al procesar la tarjeta";
  };

  // Validación en cliente antes de llamar al SDK
  const validateCardFields = (): string | null => {
    if (cardNumber.replace(/\D/g, "").length < 13)
      return "El número de tarjeta es inválido";
    const [mm, yy] = expiry.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt("20" + yy, 10);
    if (!mm || !yy || isNaN(month) || month < 1 || month > 12)
      return "El mes de vencimiento es inválido (01–12)";
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
      return "La tarjeta está vencida";
    if (cvv.length < 3) return "El CVV es inválido";
    if (docNumber.length < 8) return "El DNI debe tener 8 dígitos";
    if (!cardholderName.trim()) return "Ingresa el nombre del titular";
    return null;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpRef.current) return;

    const validationError = validateCardFields();
    if (validationError) {
      toast(validationError, "error");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirect=/checkout"); return; }

      const bin = cardNumber.replace(/\D/g, "").slice(0, 6);
      const [expMonth, expYear] = expiry.split("/");

      // Obtener payment_method_id e issuer_id desde el BIN
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = await mpRef.current.getPaymentMethods({ bin }) as any;
      const paymentMethodId: string = methods?.results?.[0]?.id ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issuers = await mpRef.current.getIssuers({ paymentMethodId, bin }) as any[];
      const issuerId: number | undefined = issuers?.[0]?.id;

      // Tokenizar la tarjeta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenData = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\D/g, ""),
        cardholderName,
        cardExpirationMonth: expMonth,
        cardExpirationYear: expYear,
        securityCode: cvv,
        identificationType: "DNI",
        identificationNumber: docNumber,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any;

      if (tokenData.error || !tokenData.id) {
        throw new Error(getMpErrorMessage(tokenData));
      }

      const res = await fetch("/api/mercadopago/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenData.id,
          installments,
          payment_method_id: paymentMethodId,
          issuer_id: issuerId,
          email: user.email,
          docType: "DNI",
          docNumber,
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
      router.push(`/checkout/result?status=${data.status}&order_id=${data.orderId}`);
    } catch (err: unknown) {
      toast(getMpErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Formato visual del número de tarjeta (grupos de 4)
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  // Formato MM/YY — inserta "/" automáticamente al escribir
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      setExpiry(digits);
    } else {
      setExpiry(digits.slice(0, 2) + "/" + digits.slice(2));
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" onReady={() => setSdkReady(true)} />
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

            {/* ── Paso 2: Checkout API (Core Methods) ── */}
            {step === "payment" && (
              <div className="space-y-4">
                <div className="card p-6">
                  <h2 className="font-bold text-lg text-content-base mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" /> Datos de tarjeta
                  </h2>

                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-content-base mb-1">Número de tarjeta</label>
                      <input
                        className="input font-mono tracking-widest"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        maxLength={19}
                        inputMode="numeric"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-content-base mb-1">Vencimiento</label>
                      <input
                        className="input font-mono"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        maxLength={5}
                        inputMode="numeric"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-content-base mb-1">CVV</label>
                        <input
                          className="input"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                          inputMode="numeric"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-content-base mb-1">DNI titular</label>
                        <input
                          className="input"
                          placeholder="12345678"
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, "").slice(0, 8))}
                          maxLength={8}
                          inputMode="numeric"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-content-base mb-1">Nombre en la tarjeta</label>
                      <input
                        className="input uppercase"
                        placeholder="NOMBRE APELLIDO"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    {installmentOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-content-base mb-1">Cuotas</label>
                        <select
                          className="input"
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                        >
                          {installmentOptions.map((opt) => (
                            <option key={opt.installments} value={opt.installments}>
                              {opt.recommended_message}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !sdkReady}
                      className="w-full py-3 bg-[#009ee3] hover:bg-[#0088cc] text-white font-bold rounded-xl transition-colors disabled:opacity-60"
                    >
                      {loading ? "Procesando..." : `Pagar ${formatPrice(total())}`}
                    </button>
                  </form>
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
    </>
  );
}
