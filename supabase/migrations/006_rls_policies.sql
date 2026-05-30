-- ================================================================
-- MANIAPREMIOS — Migration 006: Row Level Security Policies
-- Habilita RLS en todas las tablas y define políticas de lectura
-- pública. Las escrituras van por service-role (bypasea RLS).
-- ================================================================

ALTER TABLE raffles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets      ENABLE ROW LEVEL SECURITY;

-- raffles: lectura pública solo para sorteos activos
CREATE POLICY "raffles_public_read"
  ON raffles FOR SELECT
  USING (status = 'active');

-- participants, purchases, tickets: sin acceso público directo
-- (el service-role hace todos los reads/writes desde las API routes)

-- Nota: el service_role key de Supabase bypasea RLS por defecto.
-- Las API routes en /api/** usan createAdminClient() con service_role,
-- por lo que tienen acceso completo a todas las tablas.
