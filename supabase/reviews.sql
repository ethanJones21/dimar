-- ============================================================
-- DIMAR STORE - Reseñas de productos
-- Ejecuta en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT        NOT NULL CHECK (char_length(trim(comment)) >= 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un usuario solo puede dejar una reseña por producto
  UNIQUE (product_id, user_id)
);

-- ── Si la tabla ya existía con FK a auth.users, corrígela con esto:
-- ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
-- ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews (product_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT USING (true);

-- Solo el propio usuario puede insertar (y solo con su user_id)
CREATE POLICY "reviews_user_insert"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo el propio usuario puede actualizar su reseña
CREATE POLICY "reviews_user_update"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Solo el propio usuario puede borrar su reseña
CREATE POLICY "reviews_user_delete"
  ON reviews FOR DELETE USING (auth.uid() = user_id);
