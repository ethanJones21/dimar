"use client";

import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      toast("Error al eliminar el producto", "error");
    } else {
      toast("Producto eliminado", "success");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
    >
      <Trash2 size={16} />
    </button>
  );
}
