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
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-content-subtle"}
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
        <h2 className="text-xl font-bold text-content-base">
          Opiniones{total > 0 ? ` (${total})` : ""}
        </h2>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-content-base">{avgRating.toFixed(1)}</span>
            <Stars rating={Math.round(avgRating)} />
          </div>
        )}
      </div>

      {/* Formulario o mensaje */}
      {user ? (
        userAlreadyReviewed ? (
          <div className="card p-4 mb-6 bg-primary-light border-primary-light text-sm text-primary-dark">
            Ya dejaste tu opinión sobre este producto.
          </div>
        ) : (
          <ReviewForm productId={productId} userId={user.id} />
        )
      ) : (
        <div className="card p-4 mb-6 text-center text-sm text-content-muted">
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
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
                  <p className="font-semibold text-content-base text-sm">
                    {review.profile?.full_name || "Usuario"}
                  </p>
                  <Stars rating={review.rating} />
                </div>
                <span className="text-xs text-content-subtle flex-shrink-0">
                  {formatDate(review.created_at)}
                </span>
              </div>
              <p className="text-content-muted text-sm leading-relaxed mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-content-subtle text-sm text-center py-10">
          Aún no hay opiniones. ¡Sé el primero en opinar!
        </p>
      )}
    </div>
  );
}
