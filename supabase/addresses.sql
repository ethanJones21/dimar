-- ============================================================
-- DIMAR STORE - Direcciones de envío
-- Ejecuta en el SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS addresses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  street     TEXT        NOT NULL,
  city       TEXT        NOT NULL,
  state      TEXT        NOT NULL,
  zip        TEXT,
  country    TEXT        NOT NULL DEFAULT 'Perú',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Una dirección por usuario (por ahora)
  UNIQUE (user_id)
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_own"
  ON addresses FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Dirección de prueba — reemplaza el UUID con el tuyo
-- Ve a: Authentication > Users > copia tu UUID
-- ============================================================
INSERT INTO addresses (user_id, street, city, state, zip, country)
VALUES (
  'REEMPLAZA-CON-TU-USER-UUID',
  'Av. Larco 345, Miraflores',
  'Lima',
  'Lima',
  '15074',
  'Perú'
) ON CONFLICT (user_id) DO NOTHING;
