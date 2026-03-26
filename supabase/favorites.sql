-- ============================================================
-- DIMAR STORE - Favoritos
-- Ejecuta en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites (user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_own"
  ON favorites FOR ALL USING (auth.uid() = user_id);
