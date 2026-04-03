"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";

export default function ReviewForm({ productId, userId }: { productId: string; userId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast("Selecciona una calificación", "error"); return; }
    if (comment.trim().length < 5) { toast("El comentario es muy corto", "error"); return; }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment.trim(),
    });

    if (error) {
      toast("No se pudo guardar tu opinión", "error");
    } else {
      toast("¡Gracias por tu opinión!", "success");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6">
      <p className="font-semibold text-content-base mb-3">Deja tu opinión</p>

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={i <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-content-subtle"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="¿Qué te pareció el producto?"
        rows={3}
        className="w-full border border-line rounded-xl px-4 py-3 text-sm text-content-base bg-surface-base placeholder:text-content-subtle outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
      />

      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "Enviando..." : "Publicar opinión"}
      </button>
    </form>
  );
}
