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
