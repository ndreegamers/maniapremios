-- ================================================================
-- MANIAPREMIOS — Migration 008: Coupons (single-use free tickets)
-- Tabla de cupones + función RPC para canje atómico
-- ================================================================

-- ── 1. Tabla coupons ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  redeemed_at  TIMESTAMPTZ,
  redeemed_by  UUID REFERENCES participants(id) ON DELETE SET NULL,
  raffle_id    UUID REFERENCES raffles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- No public policy: only service-role access

-- ── 2. RPC redeem_coupon ──────────────────────────────────────

CREATE OR REPLACE FUNCTION redeem_coupon(
  p_code           TEXT,
  p_raffle_id      UUID,
  p_participant_id UUID
)
RETURNS TEXT  -- returns the ticket code granted
LANGUAGE plpgsql
AS $$
DECLARE
  v_coupon_id      UUID;
  v_code_prefix    VARCHAR(3);
  v_current_max    INTEGER;
  v_purchase_id    UUID;
  v_ticket_id      UUID;
  v_ticket_code    TEXT;
BEGIN
  -- ── 1. Lock and validate the coupon ─────────────────────────
  SELECT id INTO v_coupon_id
    FROM coupons
   WHERE code = UPPER(TRIM(p_code))
     AND redeemed_at IS NULL
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cupón inválido o ya usado: %', p_code;
  END IF;

  -- ── 2. Validate raffle is active (any raffle, not just free) ─
  SELECT code_prefix INTO v_code_prefix
    FROM raffles
   WHERE id = p_raffle_id
     AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sorteo no encontrado o no está activo: %', p_raffle_id;
  END IF;

  -- ── 3. Lock raffle row for serialized ticket numbering ───────
  PERFORM id FROM raffles WHERE id = p_raffle_id FOR UPDATE;

  SELECT COALESCE(MAX(ticket_number), 0) INTO v_current_max
    FROM tickets WHERE raffle_id = p_raffle_id;

  -- ── 4. Insert auto-approved purchase (mirrors register_free_entry) ──
  v_purchase_id := gen_random_uuid();
  INSERT INTO purchases (
    id, raffle_id, participant_id,
    tickets_paid, tickets_bonus, total_tickets,
    total_amount, payment_method, receipt_url,
    payment_status, source, reviewed_at
  ) VALUES (
    v_purchase_id, p_raffle_id, p_participant_id,
    0, 1, 1,
    0, 'free', NULL,
    'approved', 'free', now()
  );

  -- ── 5. Mint one ticket ───────────────────────────────────────
  v_ticket_id := gen_random_uuid();
  v_current_max := v_current_max + 1;

  v_ticket_code :=
    UPPER(v_code_prefix) || '-' ||
    LPAD(v_current_max::TEXT, 4, '0') || '-' ||
    UPPER(SUBSTRING(v_ticket_id::TEXT FROM 1 FOR 3));

  INSERT INTO tickets (id, purchase_id, raffle_id, participant_id, ticket_number, ticket_code)
  VALUES (
    v_ticket_id,
    v_purchase_id,
    p_raffle_id,
    p_participant_id,
    v_current_max,
    v_ticket_code
  );

  -- ── 6. Mark coupon as redeemed ───────────────────────────────
  UPDATE coupons
     SET redeemed_at  = now(),
         redeemed_by  = p_participant_id,
         raffle_id    = p_raffle_id
   WHERE id = v_coupon_id;

  RETURN v_ticket_code;
END;
$$;
