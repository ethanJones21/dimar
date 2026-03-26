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
      className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow transition-colors hover:bg-white ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <Heart
        size={16}
        className={isFav ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-400"}
      />
    </button>
  );
}
