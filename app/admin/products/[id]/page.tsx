import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ProductForm from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  if (id === "new") {
    const { data: categories } = await supabase.from("categories").select("*");
    return <ProductForm categories={categories || []} />;
  }

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*"),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories || []} />;
}
