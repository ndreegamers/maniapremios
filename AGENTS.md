# ManiaPremios — Guía para Agentes

## ⚠️ IMPORTANTE: Next.js 16 (no es el Next.js que conoces)

Este proyecto usa **Next.js 16.2.6** con convenciones diferentes a versiones anteriores:

- **Middleware** → se llama `proxy.ts` (no `middleware.ts`)
- **`params` es una Promise** → `const { id } = await params;` (no `params.id`)
- **No existe `next/headers` sincrónicamente** → siempre `await cookies()`

## Stack

- Next.js 16.2.6 + React 19.2.4 + TypeScript 5
- Tailwind CSS v4 (config inline en `src/app/globals.css` con `@theme inline`, sin `tailwind.config.ts`)
- shadcn/ui style "new-york" con @radix-ui (no @base-ui)
- Supabase JS + SSR (nueva instancia, distinta de elmonin-web)
- Framer Motion 12, Sonner 2, Lucide React

## Arquitectura

- `src/proxy.ts` → guard de rutas `/admin/*`
- `src/app/api/` → 13 rutas API (10 heredadas + 3 de ganadores)
- `src/lib/supabase/` → tres clientes: admin (service-role), client (browser), server (RSC)
- `src/components/ui/` → shadcn primitives (Radix bajo el capó)
- `src/components/nav/` → topbar, footer, ornamental-divider
- `src/components/home/` → editorial-hero, raffle-showcase, featured-raffle
- `src/components/admin/` → sidebar, payment-queue, raffle-form, winner-form

## Diseño premium (dorado + oscuro)

- Paleta: fondo `#0B0B0D`, dorado `#C9A961`, champagne `#F5F5F0`
- Fuentes: Playfair Display (display/serif) + Inter (body) + JetBrains Mono (códigos)
- **SIN**: neon cyan/violet/magenta, pixel borders, flip-clock, scan-line, font Outfit
- Utilidades premium: `.hairline-gold`, `.gold-overlay`, `.noise-bg`, `.ornament-divider`

## Código de tickets

- Formato: `DTM-NNNN-HHH` (prefix DTM en lugar de ELM)
- La función `approve_purchase` SQL genera tickets con bloqueo FOR UPDATE
- `code_prefix` no se puede cambiar después de crear un sorteo

## Feature ganadores (nueva vs elmonin)

- Tabla `winners` en Supabase (ver `supabase/migrations/004_winners_table.sql`)
- Admin ingresa ticket ganador desde `/admin/ganadores`
- API: `POST /api/winners` (admin) y `GET /api/winners` (público)
- Página pública `/ganadores` muestra nombre enmascarado + código + premio
