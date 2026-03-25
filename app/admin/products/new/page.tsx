import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductForm from "../ProductForm";

export const metadata = { title: "Nuevo Producto" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: categories } = await supabase.from("categories").select("*");

  return <ProductForm categories={categories || []} />;
}
