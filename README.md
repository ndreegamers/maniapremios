# ManiaPremios

Plataforma de sorteos premium para el mercado peruano. Mecánica totalmente transparente: compra tickets, sube tu comprobante de pago Yape, y participa.

## Stack

- **Next.js 16.2.6** — App Router (proxy.ts, async params)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v4** — config inline en `globals.css @theme`
- **Supabase** — Postgres + Storage + SSR (proyecto propio, NO el de elmonin)
- **Framer Motion** 12 + **Sonner** 2 + **Lucide React**
- **shadcn/ui** style "new-york" con Radix UI

## Setup

### 1. Variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con las credenciales de tu proyecto Supabase
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Aplicar migraciones SQL

Ver `supabase/README.md` para el orden de ejecución.

Ejecutar los 6 archivos en el SQL Editor de Supabase:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_raffle_stats_view.sql
supabase/migrations/003_approve_purchase_function.sql
supabase/migrations/004_winners_table.sql
supabase/migrations/005_storage_buckets.sql  ← instrucciones manuales
supabase/migrations/006_rls_policies.sql
```

Crear buckets de Storage manualmente:
- `raffle-images` → público
- `receipts` → privado

### 4. Dev server

```bash
# Sin Supabase (modo preview con datos mock)
NEXT_PUBLIC_PREVIEW_MODE=true npm run dev

# Con Supabase real
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### 5. Primer sorteo

En preview mode los sorteos se muestran desde `src/app/page.tsx` (MOCK_RAFFLES).

Con Supabase real: acceder a `/admin` → crear un sorteo desde el panel.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing editorial con sorteos activos |
| `/participar?raffle=<id>` | Wizard de compra (3 pasos) |
| `/verificar?dni=<dni>` | Consultar tickets por DNI |
| `/ganadores` | Ganadores públicos de sorteos completados |
| `/admin` | Dashboard admin |
| `/admin/pagos` | Cola de pagos pendientes |
| `/admin/sorteos` | CRUD de sorteos |
| `/admin/ganadores` | Registrar ganador manual |

## Variables de entorno

Ver `.env.example` para documentación completa.

## QR de pago

Reemplazar `/public/qr-yape-placeholder.svg` con el QR real de la cuenta Yape de ManiaPremios.

## Favicon

Generar `public/favicon.ico` desde `public/ornament.svg` (letra D dorada sobre fondo oscuro) usando cualquier convertidor SVG→ICO.
