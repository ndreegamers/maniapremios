-- ================================================================
-- MANIAPREMIOS — Migration 001: Initial Schema
-- Tablas principales: raffles, participants, purchases, tickets
-- ================================================================

-- Tabla: raffles
CREATE TABLE IF NOT EXISTS raffles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT NOT NULL,
  ticket_price  NUMERIC(10,2) NOT NULL CHECK (ticket_price > 0),
  total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
  draw_date     TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'cancelled')),
  code_prefix   VARCHAR(3) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: participants
CREATE TABLE IF NOT EXISTS participants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni        VARCHAR(8) NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  phone      VARCHAR(15),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_dni ON participants(dni);

-- Tabla: purchases
CREATE TABLE IF NOT EXISTS purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id      UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  tickets_paid   INTEGER NOT NULL CHECK (tickets_paid > 0),
  tickets_bonus  INTEGER NOT NULL DEFAULT 0 CHECK (tickets_bonus >= 0),
  total_tickets  INTEGER NOT NULL CHECK (total_tickets > 0),
  total_amount   NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('yape', 'plin')),
  receipt_url    TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_purchases_participant ON purchases(participant_id);
CREATE INDEX IF NOT EXISTS idx_purchases_raffle      ON purchases(raffle_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status      ON purchases(payment_status);

-- Tabla: tickets
CREATE TABLE IF NOT EXISTS tickets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id    UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  raffle_id      UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  ticket_number  INTEGER NOT NULL,
  ticket_code    VARCHAR(16) NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(raffle_id, ticket_number)
);

CREATE INDEX IF NOT EXISTS idx_tickets_participant ON tickets(participant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_raffle      ON tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code        ON tickets(ticket_code);
-- ================================================================
-- MANIAPREMIOS — Migration 002: raffle_stats view
-- Vista que agrega tickets vendidos por sorteo
-- ================================================================

CREATE OR REPLACE VIEW raffle_stats AS
SELECT
  r.id,
  r.title,
  r.total_tickets,
  COALESCE(
    SUM(p.total_tickets) FILTER (WHERE p.payment_status = 'approved'),
    0
  )::INTEGER AS tickets_sold,
  ROUND(
    COALESCE(
      SUM(p.total_tickets) FILTER (WHERE p.payment_status = 'approved'),
      0
    )::NUMERIC / NULLIF(r.total_tickets, 0) * 100,
    1
  ) AS sold_percentage
FROM raffles r
LEFT JOIN purchases p ON p.raffle_id = r.id
GROUP BY r.id, r.title, r.total_tickets;
-- ================================================================
-- MANIAPREMIOS — Migration 003: approve_purchase function
-- Asigna tickets secuenciales con bloqueo FOR UPDATE para
-- evitar duplicados bajo concurrencia. Formato: PREFIX-NNNN-HHH
-- ================================================================

CREATE OR REPLACE FUNCTION approve_purchase(purchase_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_raffle_id      UUID;
  v_total_tickets  INTEGER;
  v_participant_id UUID;
  v_code_prefix    VARCHAR(3);
  v_current_max    INTEGER;
  v_ticket_id      UUID;
  i                INTEGER;
BEGIN
  -- Obtener datos de la compra
  SELECT p.raffle_id, p.total_tickets, p.participant_id, r.code_prefix
    INTO v_raffle_id, v_total_tickets, v_participant_id, v_code_prefix
    FROM purchases p
    JOIN raffles r ON r.id = p.raffle_id
   WHERE p.id = purchase_uuid
     AND p.payment_status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compra no encontrada o ya procesada: %', purchase_uuid;
  END IF;

  -- Bloquear la fila del sorteo para serializar asignación de números
  PERFORM id FROM raffles WHERE id = v_raffle_id FOR UPDATE;

  -- Obtener el máximo número de ticket actual
  SELECT COALESCE(MAX(ticket_number), 0)
    INTO v_current_max
    FROM tickets
   WHERE raffle_id = v_raffle_id;

  -- Insertar tickets con números secuenciales
  FOR i IN 1..v_total_tickets LOOP
    v_ticket_id := gen_random_uuid();
    INSERT INTO tickets (id, purchase_id, raffle_id, participant_id, ticket_number, ticket_code)
    VALUES (
      v_ticket_id,
      purchase_uuid,
      v_raffle_id,
      v_participant_id,
      v_current_max + i,
      -- Formato: PREFIX-NNNN-HHH (ej: DTM-0042-A3F)
      UPPER(v_code_prefix) || '-' ||
      LPAD((v_current_max + i)::TEXT, 4, '0') || '-' ||
      UPPER(SUBSTRING(v_ticket_id::TEXT FROM 1 FOR 3))
    );
  END LOOP;

  -- Marcar la compra como aprobada
  UPDATE purchases
     SET payment_status = 'approved',
         reviewed_at    = now()
   WHERE id = purchase_uuid;
END;
$$;
-- ================================================================
-- MANIAPREMIOS — Migration 004: winners table
-- NUEVO: Tabla para registrar ganadores de sorteos completados.
-- El admin ingresa manualmente el ticket_code ganador.
-- ================================================================

CREATE TABLE IF NOT EXISTS winners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id         UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_id         UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  position          INTEGER NOT NULL DEFAULT 1,
  prize_description TEXT,
  drawn_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes             TEXT,
  UNIQUE(raffle_id, position)
);

CREATE INDEX IF NOT EXISTS idx_winners_raffle ON winners(raffle_id);
CREATE INDEX IF NOT EXISTS idx_winners_ticket ON winners(ticket_id);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Solo se muestran públicamente los ganadores de sorteos completados
CREATE POLICY "public_read_winners_of_completed_raffles" ON winners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM raffles
      WHERE raffles.id = winners.raffle_id
        AND raffles.status = 'completed'
    )
  );
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
