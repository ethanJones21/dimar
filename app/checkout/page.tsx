"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { Address } from "@/types";
import { CreditCard, MapPin, CheckCircle2, Shield, Smartphone } from "lucide-react";

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

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [installments, setInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<{ installments: number; recommended_message: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "yape">("card");
  const [yapePhone, setYapePhone] = useState("");
  const [yapeOtp, setYapeOtp] = useState("");

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

  useEffect(() => {
    if (!sdkReady) return;
    mpRef.current = new window.MercadoPago(
      process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!,
      { locale: "es-PE" }
    );
  }, [sdkReady]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getMpErrorMessage = (err: any): string => {
    const causes: { code?: string }[] = err?.cause ?? [];
    const codeMap: Record<string, string> = {
      "205": "Mes de vencimiento inválido", "208": "Año de vencimiento inválido",
      "209": "Año de vencimiento inválido", "221": "Nombre del titular inválido",
      "224": "Código de seguridad (CVV) inválido", "325": "Mes de vencimiento inválido",
      "326": "Año de vencimiento inválido", "E301": "Número de tarjeta inválido",
      "E302": "Código de seguridad (CVV) inválido", "316": "Nombre del titular inválido",
      "322": "Tipo de documento inválido", "323": "Número de DNI inválido",
      "324": "Número de DNI inválido",
    };
    if (Array.isArray(causes) && causes.length > 0) {
      const msgs = causes.map((c) => codeMap[c.code ?? ""] ?? `Error en los datos de la tarjeta (${c.code})`).filter(Boolean);
      if (msgs.length > 0) return msgs.join(". ");
    }
    return err?.message ?? "Error al procesar la tarjeta";
  };

  const validateCardFields = (): string | null => {
    if (cardNumber.replace(/\D/g, "").length < 13) return "El número de tarjeta es inválido";
    const [mm, yy] = expiry.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt("20" + yy, 10);
    if (!mm || !yy || isNaN(month) || month < 1 || month > 12) return "El mes de vencimiento es inválido (01–12)";
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return "La tarjeta está vencida";
    if (cvv.length < 3) return "El CVV es inválido";
    if (docNumber.length < 8) return "El DNI debe tener 8 dígitos";
    if (!cardholderName.trim()) return "Ingresa el nombre del titular";
    return null;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpRef.current) return;

    if (paymentMethod === "card") {
      const validationError = validateCardFields();
      if (validationError) { toast(validationError, "error"); return; }
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirect=/checkout"); return; }

      let tokenId: string;
      let paymentMethodId: string;
      let issuerId: number | undefined;
      let payerDocNumber: string | undefined;

      if (paymentMethod === "yape") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yapeResult = await (mpRef.current.yape({ otp: yapeOtp, phoneNumber: yapePhone }) as any).create();
        if (yapeResult.error || !yapeResult.id) throw new Error(yapeResult.message ?? "Error al generar token Yape");
        tokenId = yapeResult.id;
        paymentMethodId = "yape";
      } else {
        const bin = cardNumber.replace(/\D/g, "").slice(0, 6);
        const [expMonth, expYearShort] = expiry.split("/");
        const expYear = expYearShort.length === 2 ? "20" + expYearShort : expYearShort;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const methods = await mpRef.current.getPaymentMethods({ bin }) as any;
        paymentMethodId = methods?.results?.[0]?.id ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const issuers = await mpRef.current.getIssuers({ paymentMethodId, bin }) as any[];
        issuerId = issuers?.[0]?.id;
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
        if (tokenData.error || !tokenData.id) throw new Error(getMpErrorMessage(tokenData));
        tokenId = tokenData.id;
        payerDocNumber = docNumber;
      }

      const res = await fetch("/api/mercadopago/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenId,
          installments: paymentMethod === "yape" ? 1 : installments,
          payment_method_id: paymentMethodId,
          issuer_id: issuerId,
          email: user.email,
          docType: "DNI",
          docNumber: payerDocNumber,
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

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) setExpiry(digits);
    else setExpiry(digits.slice(0, 2) + "/" + digits.slice(2));
  };

  if (!mounted) return null;

  /* ── Label helper ── */
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] mb-2">
      {children}
    </label>
  );

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" onReady={() => setSdkReady(true)} />
      <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">

        {/* ── Page header ── */}
        <div className="border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
              PASO {step === "shipping" ? "1" : "2"} DE 2
            </p>
            <h1
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
              style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
            >
              {step === "shipping" ? "DIRECCIÓN" : "PAGO"}
            </h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ── Step indicator ── */}
          <div className="flex items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border-2 border-primary bg-primary text-white font-mono font-bold text-sm">
                {step === "payment" ? <CheckCircle2 size={18} strokeWidth={2.5} /> : "1"}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                ENVÍO
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 transition-colors ${step === "payment" ? "bg-primary" : "bg-[#D4D4D4] dark:bg-[rgba(255,255,255,0.2)]"}`} />
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 font-mono font-bold text-sm transition-colors ${
                  step === "payment"
                    ? "border-primary bg-primary text-white"
                    : "border-[#D4D4D4] dark:border-[rgba(255,255,255,0.3)] text-[#888888]"
                }`}
              >
                2
              </div>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${step === "payment" ? "text-primary" : "text-[#888888]"}`}
              >
                PAGO
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              {/* ── Paso 1: Envío ── */}
              {step === "shipping" && (
                <form onSubmit={handleShippingNext}>
                  <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-6 bg-white dark:bg-[#111111]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
                      <h2 className="font-display font-bold text-xs uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA] flex items-center gap-2">
                        <MapPin size={16} strokeWidth={2} className="text-primary" /> DIRECCIÓN DE ENVÍO
                      </h2>
                      {savedAddress && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-green-600 uppercase tracking-widest">
                          <CheckCircle2 size={12} strokeWidth={2.5} /> GUARDADA
                        </span>
                      )}
                    </div>

                    <div className="space-y-5">
                      <div>
                        <Label>Dirección</Label>
                        <input required className="input" placeholder="Av. Larco 123, Miraflores"
                          value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Ciudad</Label>
                          <input required className="input" placeholder="Lima"
                            value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                        </div>
                        <div>
                          <Label>Departamento</Label>
                          <input required className="input" placeholder="Lima"
                            value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label>Código Postal</Label>
                        <input className="input" placeholder="15001"
                          value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-4 py-4">
                    CONTINUAR AL PAGO
                  </button>
                </form>
              )}

              {/* ── Paso 2: Pago ── */}
              {step === "payment" && (
                <div className="space-y-4">
                  {/* Method selector */}
                  <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-4 bg-white dark:bg-[#111111]">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex items-center justify-center gap-2 py-3 border-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-150 cursor-pointer ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary text-white shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)]"
                            : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.4)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A]"
                        }`}
                      >
                        <CreditCard size={15} strokeWidth={2} /> TARJETA
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("yape")}
                        className={`flex items-center justify-center gap-2 py-3 border-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-150 cursor-pointer ${
                          paymentMethod === "yape"
                            ? "border-secondary bg-secondary text-white shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)]"
                            : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.4)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A]"
                        }`}
                      >
                        <Smartphone size={15} strokeWidth={2} /> YAPE
                      </button>
                    </div>
                  </div>

                  {/* ── Card form ── */}
                  {paymentMethod === "card" && (
                    <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-6 bg-white dark:bg-[#111111]">
                      <h2 className="font-display font-bold text-xs uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA] mb-6 pb-4 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] flex items-center gap-2">
                        <CreditCard size={15} strokeWidth={2} className="text-primary" /> DATOS DE TARJETA
                      </h2>
                      <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                          <Label>Número de tarjeta</Label>
                          <input
                            className="input font-mono tracking-widest"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            maxLength={19} inputMode="numeric" required
                          />
                        </div>
                        <div>
                          <Label>Vencimiento</Label>
                          <input
                            className="input font-mono"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            maxLength={5} inputMode="numeric" required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>CVV</Label>
                            <input
                              className="input font-mono"
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              maxLength={4} inputMode="numeric" required
                            />
                          </div>
                          <div>
                            <Label>DNI titular</Label>
                            <input
                              className="input font-mono"
                              placeholder="12345678"
                              value={docNumber}
                              onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, "").slice(0, 8))}
                              maxLength={8} inputMode="numeric" required
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Nombre en la tarjeta</Label>
                          <input
                            className="input uppercase font-mono"
                            placeholder="NOMBRE APELLIDO"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                            required
                          />
                        </div>
                        {installmentOptions.length > 0 && (
                          <div>
                            <Label>Cuotas</Label>
                            <select
                              className="input cursor-pointer"
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
                          className="w-full py-4 bg-[#009ee3] text-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.4)] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:transform-none"
                        >
                          {loading ? "PROCESANDO..." : `PAGAR ${formatPrice(total())}`}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#888888] uppercase tracking-widest">
                          <Shield size={12} strokeWidth={2} className="text-green-500" />
                          PAGO 100% SEGURO · DATOS CIFRADOS SSL
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ── Yape form ── */}
                  {paymentMethod === "yape" && (
                    <div className="border-2 border-secondary p-6 bg-white dark:bg-[#111111]">
                      <h2 className="font-display font-bold text-xs uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA] mb-6 pb-4 border-b-2 border-secondary flex items-center gap-2">
                        <Smartphone size={15} strokeWidth={2} className="text-secondary" /> PAGO CON YAPE
                      </h2>
                      <form onSubmit={handlePayment} className="space-y-4">
                        <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)] p-4 bg-[#F0F0F0] dark:bg-[#1A1A1A]">
                          <p className="text-[10px] font-mono text-[#888888] leading-relaxed">
                            Ingresa tu número Yape y el código OTP de 6 dígitos que aparece en la app.
                          </p>
                        </div>
                        <div>
                          <Label>Número de teléfono Yape</Label>
                          <input
                            className="input font-mono"
                            placeholder="987654321"
                            value={yapePhone}
                            onChange={(e) => setYapePhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                            inputMode="numeric" maxLength={9} required
                          />
                        </div>
                        <div>
                          <Label>Código OTP (de la app Yape)</Label>
                          <input
                            className="input font-mono tracking-widest"
                            placeholder="123456"
                            value={yapeOtp}
                            onChange={(e) => setYapeOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputMode="numeric" maxLength={6} required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading || !sdkReady || yapePhone.length < 9 || yapeOtp.length < 6}
                          className="w-full py-4 bg-secondary text-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.4)] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:transform-none"
                        >
                          {loading ? "PROCESANDO..." : `PAGAR CON YAPE ${formatPrice(total())}`}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#888888] uppercase tracking-widest">
                          <Shield size={12} strokeWidth={2} className="text-green-500" />
                          PAGO 100% SEGURO · DATOS CIFRADOS SSL
                        </div>
                      </form>
                    </div>
                  )}

                  <button
                    onClick={() => setStep("shipping")}
                    className="btn-secondary w-full py-3 cursor-pointer"
                  >
                    VOLVER A ENVÍO
                  </button>
                </div>
              )}
            </div>

            {/* ── Order summary ── */}
            <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-6 h-fit sticky top-24 bg-white dark:bg-[#111111] shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_rgba(255,255,255,0.3)]">
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] mb-5 pb-3 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
                RESUMEN DEL PEDIDO
              </h2>
              <div className="space-y-2 mb-5">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-xs font-mono">
                    <span className="text-[#888888] truncate max-w-[180px]">{product.name} ×{quantity}</span>
                    <span className="font-bold text-[#0A0A0A] dark:text-[#FAFAFA] flex-shrink-0 ml-2">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-xs font-mono text-[#888888]">
                  <span>SUBTOTAL</span><span>{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#888888]">ENVÍO</span>
                  <span className="font-bold text-green-600">GRATIS</span>
                </div>
              </div>
              <div className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] pt-4 flex justify-between items-baseline">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888]">TOTAL</span>
                <span
                  className="font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                >
                  {formatPrice(total())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
