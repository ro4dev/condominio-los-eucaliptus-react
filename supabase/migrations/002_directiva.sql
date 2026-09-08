-- ============================================
-- Condominio Los Eucaliptus - Directiva
-- ============================================

CREATE TABLE IF NOT EXISTS directiva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  extra TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE directiva ENABLE ROW LEVEL SECURITY;

-- Lectura: todos los autenticados
CREATE POLICY IF NOT EXISTS "directiva_select" ON directiva
  FOR SELECT TO authenticated
  USING (true);

-- Escritura: solo rol admin (app_metadata, no editable por el usuario)
CREATE POLICY IF NOT EXISTS "directiva_insert" ON directiva
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "directiva_update" ON directiva
  FOR UPDATE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "directiva_delete" ON directiva
  FOR DELETE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');