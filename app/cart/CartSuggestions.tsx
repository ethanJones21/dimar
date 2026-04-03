"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import ProductCarousel from "@/components/ProductCarousel";
import { Product } from "@/types";

export default function CartSuggestions() {
  const items = useCartStore((s) => s.items);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (items.length === 0) { setProducts([]); return; }

    const categoryIds = [...new Set(
      items.map((i) => i.product.category_id).filter(Boolean)
    )];
    const excludeIds = items.map((i) => i.product.id);

    if (categoryIds.length === 0) return;

    const supabase = createClient();
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .in("category_id", categoryIds)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .eq("active", true)
      .limit(10)
      .then(({ data }) => setProducts((data as Product[]) ?? []));
  }, [items]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <ProductCarousel products={products} title="También te puede interesar" />
    </div>
  );
}
