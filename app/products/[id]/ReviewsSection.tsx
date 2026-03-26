import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";
import Link from "next/link";
import ReviewForm from "./ReviewForm";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

export default async function ReviewsSection({ productId }: { productId: string }) {
  const supabase = await createClient();

  const [{ data: { user } }, { data: reviews }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("reviews")
      .select("*, profile:profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
  ]);

  const total = reviews?.length ?? 0;
  const avgRating = total
    ? reviews!.reduce((s, r) => s + r.rating, 0) / total
    : 0;
  const userAlreadyReviewed = reviews?.some((r) => r.user_id === user?.id);

  return (
    <div className="max-w-3xl mt-14">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Opiniones{total > 0 ? ` (${total})` : ""}
        </h2>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-800">{avgRating.toFixed(1)}</span>
            <Stars rating={Math.round(avgRating)} />
          </div>
        )}
      </div>

      {/* Formulario o mensaje */}
      {user ? (
        userAlreadyReviewed ? (
          <div className="card p-4 mb-6 bg-blue-50 border-blue-100 text-sm text-blue-700">
            Ya dejaste tu opinión sobre este producto.
          </div>
        ) : (
          <ReviewForm productId={productId} userId={user.id} />
        )
      ) : (
        <div className="card p-4 mb-6 text-center text-sm text-slate-500">
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
            Inicia sesión
          </Link>{" "}
          para dejar tu opinión.
        </div>
      )}

      {/* Lista de reseñas */}
      {total > 0 ? (
        <div className="space-y-4">
          {reviews!.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-slate-800 text-sm">
                    {review.profile?.full_name || "Usuario"}
                  </p>
                  <Stars rating={review.rating} />
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {formatDate(review.created_at)}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-10">
          Aún no hay opiniones. ¡Sé el primero en opinar!
        </p>
      )}
    </div>
  );
}
