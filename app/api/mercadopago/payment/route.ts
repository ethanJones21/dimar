import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "MercadoPago no configurado" }, { status: 500 });
  }

  const { token, installments, payment_method_id, issuer_id, email, docType, docNumber, items, address } =
    await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const total: number = items.reduce(
    (sum: number, i: { unit_price: number; quantity: number }) => sum + i.unit_price * i.quantity,
    0
  );

  // Crear orden
  const paymentLabel =
    payment_method_id === "yape" ? "YAPE" :
    payment_method_id === "visa" ? "VISA" :
    payment_method_id === "master" ? "MASTERCARD" :
    "TARJETA";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, status: "pending", total, shipping_address: address, payment_method: paymentLabel })
    .select()
    .single();
  if (orderError) return NextResponse.json({ error: "Error al crear orden" }, { status: 500 });

  await supabase.from("order_items").insert(
    items.map((i: { product_id: string; quantity: number; unit_price: number }) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }))
  );

  const description = items.map((i: { title: string }) => i.title).join(", ");

  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: total,
      token,
      description,
      payment_method_id,
      installments: payment_method_id === "yape" ? 1 : Number(installments),
      ...(payment_method_id !== "yape" ? { issuer_id } : {}),
      payer: {
        email,
        ...(docNumber ? { identification: { type: docType, number: docNumber } } : {}),
      },
      external_reference: order.id,
    }),
  });

  const data = await res.json();

  // Log siempre para debug — muestra status_detail aunque MP devuelva 200
  console.log("[MP payment]", {
    status: data.status,
    status_detail: data.status_detail,
    error: data.error,
    message: data.message,
    id: data.id,
  });

  if (!res.ok) {
    console.error("MercadoPago payment error:", data);
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: data.message ?? "Error al procesar el pago" }, { status: 500 });
  }

  const statusMap: Record<string, string> = {
    approved: "processing",
    rejected: "cancelled",
    in_process: "pending",
    pending: "pending",
  };
  await supabase.from("orders").update({ status: statusMap[data.status] ?? "pending" }).eq("id", order.id);

  const resultStatus = data.status === "approved" ? "success" : data.status === "rejected" ? "failure" : "pending";

  return NextResponse.json({ status: resultStatus, orderId: order.id, paymentId: data.id });
}
