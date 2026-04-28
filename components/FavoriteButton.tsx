"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites";
import { toast } from "@/components/ui/Toaster";

export default function FavoriteButton({ productId }: { productId: string }) {
  const { load, toggle, has, loaded } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  if (!mounted) return null;

  const isFav = has(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(productId);
    if (result === "login") {
      toast("Inicia sesión para guardar favoritos", "error");
    }
  };

  return (
    <button
      onClick={handleClick}
      title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white dark:bg-[#0A0A0A] border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer ${loaded ? "opacity-100" : "opacity-0"}`}
    >
      <Heart
        size={13}
        strokeWidth={2.5}
        className={isFav ? "fill-red-500 text-red-500" : ""}
      />
    </button>
  );
}
