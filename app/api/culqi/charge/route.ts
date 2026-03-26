import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const secretKey = process.env.CULQI_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Pasarela de pago no configurada" }, { status: 500 });
  }

  const { token, orderId, email, amount } = await req.json();

  if (!token || !orderId || !email || !amount) {
    return NextResponse.json({ error: "Datos de pago incompletos" }, { status: 400 });
  }

  // Crear el cargo en Culqi (amount ya viene en centavos)
  const culqiRes = await fetch("https://api.culqi.com/v2/charges", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,                  // en centavos: S/10.00 = 1000
      currency_code: "PEN",
      email,
      source_id: token,
      description: `Orden Dimar Store #${orderId.slice(-8).toUpperCase()}`,
      antifraud_details: { send_device_fingerprint: false },
    }),
  });

  const charge = await culqiRes.json();

  if (!culqiRes.ok || charge.object === "error") {
    const msg = translateCulqiError(charge.user_message ?? charge.merchant_message ?? "");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Actualizar estado de la orden a 'processing'
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: "processing" })
    .eq("id", orderId);

  return NextResponse.json({ success: true, chargeId: charge.id });
}

function translateCulqiError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("card_number") || m.includes("número de tarjeta"))
    return "El número de tarjeta no es válido.";
  if (m.includes("cvv") || m.includes("cvc"))
    return "El código de seguridad (CVV) no es válido.";
  if (m.includes("expir"))
    return "La fecha de vencimiento no es válida.";
  if (m.includes("insufficient") || m.includes("saldo"))
    return "Fondos insuficientes en la tarjeta.";
  if (m.includes("declined") || m.includes("rechazada") || m.includes("deny"))
    return "Tarjeta rechazada por el banco. Intenta con otra tarjeta.";
  if (m.includes("lost") || m.includes("stolen"))
    return "Tarjeta reportada. Contacta a tu banco.";
  if (m.includes("limit"))
    return "Has superado el límite de intentos. Espera unos minutos.";
  return msg || "No se pudo procesar el pago. Verifica los datos e intenta de nuevo.";
}
