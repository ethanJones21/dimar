"use server";

// Next.js 16: revalidateTag requiere tag + perfil de cacheLife
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function revalidateProducts() {
  revalidateTag("products", "hours");
}

export async function updateProduct(productId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(data).eq("id", productId);
  if (!error) {
    revalidateTag(`product-${productId}`, "hours");
    revalidateTag("products", "hours");
  }
  return { error };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (!error) {
    revalidateTag(`order-${orderId}`, "minutes");
    revalidateTag("orders", "minutes");
  }
  return { error };
}
