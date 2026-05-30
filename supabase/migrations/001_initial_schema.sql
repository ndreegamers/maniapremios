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
