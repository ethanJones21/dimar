import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "MercadoPago no configurado" }, { status: 500 });
  }

  const { items, orderId, email, address } = await req.json();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Crear orden en Supabase primero si no existe
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let finalOrderId = orderId;

  if (!orderId) {
    const total = items.reduce((sum: number, i: { unit_price: number; quantity: number }) => sum + i.unit_price * i.quantity, 0);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, status: "pending", total, shipping_address: address })
      .select()
      .single();
    if (error) return NextResponse.json({ error: "Error al crear orden" }, { status: 500 });
    finalOrderId = order.id;

    // Insertar items
    await supabase.from("order_items").insert(
      items.map((i: { product_id: string; quantity: number; unit_price: number }) => ({
        order_id: finalOrderId,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      }))
    );
  }

  // Crear preferencia en MercadoPago
  const preference = {
    items: items.map((i: { title: string; quantity: number; unit_price: number }) => ({
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,       // en soles
      currency_id: "PEN",
    })),
    payer: { email },
    back_urls: {
      success: `${baseUrl}/checkout/result?status=success&order_id=${finalOrderId}`,
      failure: `${baseUrl}/checkout/result?status=failure&order_id=${finalOrderId}`,
      pending: `${baseUrl}/checkout/result?status=pending&order_id=${finalOrderId}`,
    },
    auto_return: "approved",
    external_reference: finalOrderId,
    payment_methods: {
      // Yape aparece automáticamente para cuentas peruanas
      excluded_payment_types: [],
    },
    statement_descriptor: "DIMAR STORE",
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("MercadoPago error:", data);
    return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
  }

  return NextResponse.json({
    preferenceId: data.id,
    initPoint: data.init_point,           // producción
    sandboxInitPoint: data.sandbox_init_point, // sandbox
    orderId: finalOrderId,
  });
}
