-- ============================================
-- Condominio Los Eucaliptus - Auditoría de cambios
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id TEXT,
  datos JSONB,
  usuario TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Lectura: solo admin
CREATE POLICY IF NOT EXISTS "audit_log_select" ON audit_log
  FOR SELECT TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Escritura: cualquier autenticado (insert desde JS vía logAudit)
CREATE POLICY IF NOT EXISTS "audit_log_insert" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);