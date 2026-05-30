-- ============================================================
-- Migration 007: Free raffles + referral system
-- ============================================================

-- ── 1. Alter raffles table ────────────────────────────────────

-- Add is_free flag
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;

-- Relax price check to allow 0 (free raffles)
ALTER TABLE raffles DROP CONSTRAINT IF EXISTS raffles_ticket_price_check;
ALTER TABLE raffles ADD CONSTRAINT raffles_ticket_price_check CHECK (ticket_price >= 0);

-- ── 2. Alter purchases table ──────────────────────────────────

-- Relax constraints for free entries and rewards
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_tickets_paid_check;
ALTER TABLE purchases ADD CONSTRAINT purchases_tickets_paid_check CHECK (tickets_paid >= 0);

ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_total_amount_check;
ALTER TABLE purchases ADD CONSTRAINT purchases_total_amount_check CHECK (total_amount >= 0);

-- Add 'free' to payment_method enum
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_payment_method_check;
ALTER TABLE purchases ADD CONSTRAINT purchases_payment_method_check
  CHECK (payment_method IN ('yape', 'plin', 'free'));

-- Make receipt_url nullable (free entries have no receipt)
ALTER TABLE purchases ALTER COLUMN receipt_url DROP NOT NULL;

-- Add source column to track entry origin
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'paid'
  CHECK (source IN ('paid', 'free', 'referral_reward'));

-- Partial unique index: a participant can only have 1 free entry per raffle
CREATE UNIQUE INDEX IF NOT EXISTS uniq_free_entry
  ON purchases(raffle_id, participant_id)
  WHERE source = 'free';

-- ── 3. Referral codes table ───────────────────────────────────

CREATE TABLE IF NOT EXISTS referral_codes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  code           TEXT NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
-- No public policy: only service-role access

-- ── 4. Referral uses table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS referral_uses (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id        UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referred_participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  raffle_id               UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  reward_purchase_id      UUID REFERENCES purchases(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- A referred participant can only use a referral once per raffle
  UNIQUE(raffle_id, referred_participant_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_uses_code ON referral_uses(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_raffle ON referral_uses(raffle_id);

ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
-- No public policy: only service-role access

-- ── 5. register_free_entry function ──────────────────────────

CREATE OR REPLACE FUNCTION register_free_entry(
  p_raffle_id       UUID,
  p_participant_id  UUID,
  p_referral_code   TEXT DEFAULT NULL
)
RETURNS TEXT  -- returns the ticket code for the registering participant
LANGUAGE plpgsql
AS $$
DECLARE
  v_code_prefix       VARCHAR(3);
  v_current_max       INTEGER;
  v_ticket_id         UUID;
  v_participant_purchase_id UUID;
  v_participant_ticket_code TEXT;

  v_referral_code_id  UUID;
  v_referrer_id       UUID;
  v_reward_purchase_id UUID;
  v_reward_ticket_id  UUID;
  v_reward_max        INTEGER;
  v_uses_count        INTEGER;
BEGIN
  -- ── Validate raffle ──────────────────────────────────────────
  SELECT code_prefix INTO v_code_prefix
    FROM raffles
   WHERE id = p_raffle_id
     AND is_free = true
     AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sorteo no encontrado, no es gratuito o no está activo: %', p_raffle_id;
  END IF;

  -- ── Check for existing free entry by this participant ────────
  IF EXISTS (
    SELECT 1 FROM purchases
     WHERE raffle_id = p_raffle_id
       AND participant_id = p_participant_id
       AND source = 'free'
  ) THEN
    RAISE EXCEPTION 'Ya estás inscrito en este sorteo';
  END IF;

  -- ── Lock raffle row for serialized ticket numbering ──────────
  PERFORM id FROM raffles WHERE id = p_raffle_id FOR UPDATE;

  SELECT COALESCE(MAX(ticket_number), 0) INTO v_current_max
    FROM tickets WHERE raffle_id = p_raffle_id;

  -- ── Insert participant's purchase (auto-approved) ────────────
  v_participant_purchase_id := gen_random_uuid();
  INSERT INTO purchases (
    id, raffle_id, participant_id,
    tickets_paid, tickets_bonus, total_tickets,
    total_amount, payment_method, receipt_url,
    payment_status, source, reviewed_at
  ) VALUES (
    v_participant_purchase_id, p_raffle_id, p_participant_id,
    0, 1, 1,
    0, 'free', NULL,
    'approved', 'free', now()
  );

  -- ── Mint participant's ticket ────────────────────────────────
  v_ticket_id := gen_random_uuid();
  v_current_max := v_current_max + 1;

  INSERT INTO tickets (id, purchase_id, raffle_id, participant_id, ticket_number, ticket_code)
  VALUES (
    v_ticket_id,
    v_participant_purchase_id,
    p_raffle_id,
    p_participant_id,
    v_current_max,
    UPPER(v_code_prefix) || '-' ||
      LPAD(v_current_max::TEXT, 4, '0') || '-' ||
      UPPER(SUBSTRING(v_ticket_id::TEXT FROM 1 FOR 3))
  );

  SELECT ticket_code INTO v_participant_ticket_code
    FROM tickets WHERE id = v_ticket_id;

  -- ── Process referral (best-effort: don't fail registration) ──
  IF p_referral_code IS NOT NULL AND p_referral_code <> '' THEN
    BEGIN
      -- Look up referral code
      SELECT rc.id, rc.participant_id
        INTO v_referral_code_id, v_referrer_id
        FROM referral_codes rc
       WHERE rc.code = UPPER(TRIM(p_referral_code));

      IF FOUND
         AND v_referrer_id <> p_participant_id  -- can't refer yourself
         AND NOT EXISTS (
           SELECT 1 FROM referral_uses
            WHERE raffle_id = p_raffle_id
              AND referred_participant_id = p_participant_id
         )
      THEN
        -- Count how many rewards the referrer already earned for this raffle
        SELECT COUNT(*) INTO v_uses_count
          FROM referral_uses
         WHERE referral_code_id = v_referral_code_id
           AND raffle_id = p_raffle_id;

        IF v_uses_count < 5 THEN
          -- Mint reward ticket for referrer
          v_reward_purchase_id := gen_random_uuid();
          INSERT INTO purchases (
            id, raffle_id, participant_id,
            tickets_paid, tickets_bonus, total_tickets,
            total_amount, payment_method, receipt_url,
            payment_status, source, reviewed_at
          ) VALUES (
            v_reward_purchase_id, p_raffle_id, v_referrer_id,
            0, 1, 1,
            0, 'free', NULL,
            'approved', 'referral_reward', now()
          );

          v_reward_ticket_id := gen_random_uuid();
          v_reward_max := v_current_max + 1;
          v_current_max := v_reward_max;

          INSERT INTO tickets (id, purchase_id, raffle_id, participant_id, ticket_number, ticket_code)
          VALUES (
            v_reward_ticket_id,
            v_reward_purchase_id,
            p_raffle_id,
            v_referrer_id,
            v_reward_max,
            UPPER(v_code_prefix) || '-' ||
              LPAD(v_reward_max::TEXT, 4, '0') || '-' ||
              UPPER(SUBSTRING(v_reward_ticket_id::TEXT FROM 1 FOR 3))
          );

          -- Record referral use
          INSERT INTO referral_uses (
            referral_code_id, referred_participant_id, raffle_id, reward_purchase_id
          ) VALUES (
            v_referral_code_id, p_participant_id, p_raffle_id, v_reward_purchase_id
          );
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore referral errors; registration still succeeds
      NULL;
    END;
  END IF;

  RETURN v_participant_ticket_code;
END;
$$;
