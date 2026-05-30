# ManiaPremios — Supabase Migrations

Aplica las migraciones en orden desde el **SQL Editor** de tu proyecto Supabase.

## Orden de ejecución

```
001_initial_schema.sql        → Tablas: raffles, participants, purchases, tickets
002_raffle_stats_view.sql     → Vista: raffle_stats
003_approve_purchase_function.sql → Función: approve_purchase()
004_winners_table.sql         → Tabla: winners (+ RLS)
005_storage_buckets.sql       → Instrucciones para crear buckets manualmente
006_rls_policies.sql          → RLS en todas las tablas
```

## Pasos

1. Ir a **SQL Editor** en el dashboard de Supabase
2. Ejecutar cada archivo en el orden indicado
3. Para el paso 005, crear los buckets manualmente:
   - **Storage → New bucket → `raffle-images`** (marcar como público)
   - **Storage → New bucket → `receipts`** (privado)

## Primer sorteo de prueba

Después de aplicar las migraciones, puedes insertar un sorteo de prueba:

```sql
INSERT INTO raffles (title, description, image_url, ticket_price, total_tickets, draw_date, code_prefix)
VALUES (
  'iPhone 16 Pro Max 256GB',
  'El smartphone más potente de Apple. Natural Titanium, 256GB.',
  'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90',
  5.00,
  500,
  NOW() + INTERVAL '30 days',
  'DTM'
);
```
