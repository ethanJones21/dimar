import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductCarousel from "@/components/ProductCarousel";

export default async function SimilarProducts({
  categoryId,
  excludeId,
}: {
  categoryId: string;
  excludeId: string;
}) {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("category_id", categoryId)
    .eq("active", true)
    .neq("id", excludeId)
    .limit(10);

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-12">
      <ProductCarousel products={products as Product[]} title="Productos similares" />
    </div>
  );
}
