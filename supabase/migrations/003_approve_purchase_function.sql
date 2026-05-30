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
