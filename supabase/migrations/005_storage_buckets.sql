-- ================================================================
-- MANIAPREMIOS — Migration 005: Storage Buckets
--
-- IMPORTANTE: Los buckets de Storage NO se crean con SQL estándar
-- en el dashboard de Supabase. Debes crearlos manualmente:
--
-- Opción A — Dashboard de Supabase:
--   1. Ir a Storage > Buckets > New bucket
--   2. Crear "raffle-images" con Public bucket = ON
--   3. Crear "receipts" con Public bucket = OFF
--
-- Opción B — SQL (puede requerir permisos de superusuario):
-- ================================================================

-- Descomenta solo si tienes acceso a la tabla storage.buckets:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('raffle-images', 'raffle-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', false)
-- ON CONFLICT (id) DO NOTHING;

-- ── Políticas de acceso a Storage ─────────────────────────────
-- Estas políticas permiten que el service-role escriba en los
-- buckets y que los usuarios anon lean raffle-images.
--
-- Si usas el dashboard, las políticas equivalentes son:
--   raffle-images → Allow public read
--   receipts → Allow only service role (no public access)

-- (Sin SQL ejecutable — configurar manualmente en el dashboard)
SELECT 'Storage buckets must be created via Supabase Dashboard' AS instruction;
