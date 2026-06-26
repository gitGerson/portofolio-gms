# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

There is no test runner configured yet.

## Version-specific docs

Per `AGENTS.md`, this is Next.js **16** (with React **19** and Tailwind CSS **4**) — APIs and conventions differ from older versions. Before writing framework code, read the relevant guide bundled in `node_modules/next/dist/docs/` (App Router guides live under `01-app/`). Do not rely on memory of older Next.js APIs.

## Architecture

This is a **Goldstar Official Store** e-commerce app (Indonesian copy): a customer storefront plus a login-gated admin panel, backed by **Supabase** (Postgres + Auth + Storage). See [README.md](README.md) for the full setup (env vars, `supabase/schema.sql` + `supabase/seed.sql`, creating the admin account).

- **App Router** (`app/`). `app/layout.tsx` loads Plus Jakarta Sans + Space Mono via `next/font/google` and wraps everything in `CartProvider`. Components are RSC by default; add `"use client"` only for interactivity. Catalog pages are `export const dynamic = "force-dynamic"` because the data is admin-editable.
- **Supabase clients** (`lib/supabase/`): `server.ts` (RLS-bound, async `cookies()`), `client.ts` (browser), `admin.ts` (service-role, `server-only` — used for order creation, payment-proof upload, signed URLs). **Never import `admin.ts` into a Client Component.**
- **Auth/authorization**: `proxy.ts` (Next 16's renamed Middleware) refreshes the session and optimistically redirects `/admin/*` to `/admin/login`. Authoritative gate is `getAdminUser()` in `lib/auth.ts` (checks `profiles.role === 'admin'`), enforced in `app/admin/(dashboard)/layout.tsx`. DB access is also protected by RLS + the `is_admin()` SQL helper.
- **Data layer** (`lib/data/*`): server-only query modules mapping snake_case rows → camelCase domain types (`lib/data/types.ts`). Don't query Supabase directly from pages — go through these. Product reads go through the `products_with_promo` view (not the `products` table): it flattens category/brand and resolves the **effective** sale price from the active scheduled promotion, so the rest of the app keeps using plain `price`/`oldPrice`. Promotions (campaigns with start/end windows + a discount %/amount) are managed under `app/admin/(dashboard)/promotions/`; per-product `old_price` still works for one-off manual discounts.
- **Cart** (`lib/cart-context.tsx`): client-only, `localStorage` via `useSyncExternalStore`. Stores a **product snapshot per line** (not just an id), so it never needs the DB. Checkout recomputes authoritative totals server-side in `app/actions/orders.ts`.
- **Admin** lives under `app/admin/(dashboard)/`; the `(dashboard)` route group keeps `/admin/login` outside the guarded layout. Mutations are server actions colocated as `actions.ts` per area, which `revalidatePath` affected storefront routes.
- **Styling: Tailwind CSS v4**, configured in CSS only (no `tailwind.config.js`). Brand tokens (forest/gold/ink/paper, status colors) live in `app/globals.css` under `@theme inline { ... }` — add/change tokens there. PostCSS uses `@tailwindcss/postcss`.
- **TypeScript** strict; import from root with the `@/*` alias. **ESLint** flat config — note the strict Next 16 `react-hooks/set-state-in-effect` rule: read external stores with `useSyncExternalStore` and only `setState` inside async callbacks, never synchronously in an effect body.

### Gotchas
- `params`/`searchParams` are Promises — `await` them.
- The QRIS code is decorative; product search/sort/price filters are UI-only (not wired).
