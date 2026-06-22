# Goldstar Official Store

E-commerce storefront (Next.js 16 + React 19 + Tailwind v4) backed by **Supabase**,
with a login-gated **admin panel**. Customer flow: browse → cart → checkout →
QRIS payment → upload proof → WhatsApp confirmation. Orders are persisted to
Supabase; admins manage products, categories, brands, and orders.

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env.local` and fill in your Supabase values
(Dashboard → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only, keep secret
NEXT_PUBLIC_STORE_WHATSAPP=6281234567890         # international format, no +
```

## 3. Database

In the Supabase dashboard → **SQL Editor**, run these in order:

1. [`supabase/schema.sql`](supabase/schema.sql) — tables, RLS policies, the
   `is_admin()` helper, the `profiles` auto-create trigger, and the
   `product-images` (public) + `payment-proofs` (private) storage buckets.
2. [`supabase/seed.sql`](supabase/seed.sql) — the demo categories, brands, and
   products. Re-runnable (upserts on slug).

> Arbitrary SQL can't be applied with the service-role key over the REST API,
> so these must be run from the dashboard (or via the Supabase CLI).

## 4. Create the admin account

1. Dashboard → **Authentication → Users → Add user** (email + password,
   "Auto Confirm" on). The `profiles` trigger creates a row with role
   `customer`.
2. Promote it to admin in the SQL Editor:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

## 5. Run

```bash
npm run dev      # http://localhost:3000  (storefront)
                 # http://localhost:3000/admin  (admin panel)
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Architecture

- **Storefront** (`app/`) — server components fetching from Supabase via the
  RLS-bound client (`lib/supabase/server.ts`). Catalog is admin-editable, so
  pages are `dynamic`. The cart is client-side (`lib/cart-context.tsx`,
  `localStorage`, `useSyncExternalStore`) and stores a product snapshot per line.
- **Checkout/payment** — `app/actions/orders.ts` server actions persist orders
  (totals recomputed server-side from the DB) and upload payment proofs to the
  private bucket via the service-role client (`lib/supabase/admin.ts`).
- **Admin** (`app/admin/`) — `app/admin/login` (Supabase Auth) is public;
  everything under `app/admin/(dashboard)/` is gated by `getAdminUser()`
  (`lib/auth.ts`) checking the `admin` role. `proxy.ts` (Next 16's renamed
  Middleware) refreshes the session and does an optimistic redirect to login.
- **Data layer** — `lib/data/*` maps Supabase rows to camelCase domain types
  (`lib/data/types.ts`).

## Notes

- Product photos: upload real images in the admin product form (stored in the
  `product-images` bucket). Products without an image show a striped placeholder.
- The QRIS code on the payment page is decorative — wire it to a real QRIS
  payload/payment provider for production.
- Search, sort, and price-range filters in the UI are not yet functional.
