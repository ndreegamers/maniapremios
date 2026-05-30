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
