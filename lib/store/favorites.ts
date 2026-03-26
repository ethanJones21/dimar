import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface FavoritesStore {
  ids: string[];
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (productId: string) => Promise<"login" | "ok">;
  has: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ids: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loaded: true }); return; }
    const { data } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id);
    set({ ids: (data ?? []).map((f) => f.product_id), loaded: true });
  },

  toggle: async (productId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "login";

    const { ids } = get();
    const isFav = ids.includes(productId);

    // Optimistic
    set({ ids: isFav ? ids.filter((id) => id !== productId) : [...ids, productId] });

    if (isFav) {
      await supabase.from("favorites").delete()
        .eq("user_id", user.id).eq("product_id", productId);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
    }
    return "ok";
  },

  has: (productId: string) => get().ids.includes(productId),
}));
