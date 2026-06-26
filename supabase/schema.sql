-- =============================================================================
-- Goldstar Official Store — schema
-- Run this in the Supabase dashboard → SQL Editor (once), then run seed.sql.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sort_order  int  not null default 0,
  image_path  text,            -- bucket path or absolute URL for the category icon
  created_at  timestamptz not null default now()
);

-- Backfill for databases created before image_path existed.
alter table public.categories add column if not exists image_path text;

create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  logo_image  text,            -- bucket path or absolute URL for the brand logo
  created_at  timestamptz not null default now()
);

-- Backfill for databases created before logo_image existed.
alter table public.brands add column if not exists logo_image text;

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  category_id  uuid references public.categories(id) on delete set null,
  brand_id     uuid references public.brands(id) on delete set null,
  price        int  not null check (price >= 0),
  old_price    int  check (old_price >= 0),
  stock        int  not null default 0 check (stock >= 0),
  rating       numeric(2,1),
  sold         int  not null default 0,
  description  text,
  highlights   text[] not null default '{}',
  image_path   text,            -- path within the product-images bucket
  image_tag    text,            -- short label for the placeholder fallback
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);

-- A scheduled discount campaign. Active products show the discounted price
-- (computed in the products_with_promo view) with the base price struck through.
create table if not exists public.promotions (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text unique,                -- optional, for future deep-links
  discount_pct    int  check (discount_pct between 1 and 100),
  discount_amount int  check (discount_amount >= 0),
  starts_at       timestamptz,                -- null = no lower bound
  ends_at         timestamptz,                -- null = no upper bound
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (discount_pct is not null or discount_amount is not null)
);

-- Which products belong to a campaign (many-to-many).
create table if not exists public.product_promotions (
  product_id  uuid not null references public.products(id)   on delete cascade,
  promo_id    uuid not null references public.promotions(id) on delete cascade,
  primary key (product_id, promo_id)
);

create index if not exists product_promotions_product_idx on public.product_promotions(product_id);

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_no       text not null unique,
  customer_name  text not null,
  whatsapp       text not null,
  address        text not null,
  note           text,
  subtotal       int  not null,
  discount       int  not null default 0,
  total          int  not null,
  status         text not null default 'pending'
                 check (status in ('pending','paid','confirmed','done','cancelled')),
  proof_path     text,           -- path within the payment-proofs bucket
  created_at     timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  unit_price    int  not null,
  qty           int  not null check (qty > 0),
  line_total    int  not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger for products
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists promotions_set_updated_at on public.promotions;
create trigger promotions_set_updated_at
  before update on public.promotions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products_with_promo — canonical product read source for the storefront.
-- Flattens category/brand and resolves the effective sale price from the best
-- (largest) currently-active promotion. For a product in an active promo:
--   price     = discounted price,  old_price = base price (strikethrough).
-- Otherwise it returns the manual price/old_price unchanged. security_invoker
-- makes the view honour the caller's RLS on the underlying tables.
-- ---------------------------------------------------------------------------
create or replace view public.products_with_promo
with (security_invoker = true) as
select
  p.id, p.slug, p.name, p.category_id, p.brand_id, p.stock,
  p.rating, p.sold, p.description, p.highlights, p.image_path, p.image_tag,
  p.created_at,
  c.slug as category_slug, c.name as category_name, b.name as brand_name,
  ap.promo_id, ap.promo_title, ap.discount_pct, ap.discount_amount,
  case when ap.promo_id is not null
       then greatest(0,
              case when ap.discount_pct is not null
                   then round(p.price * (1 - ap.discount_pct / 100.0))::int
                   else p.price - ap.discount_amount end)
       else p.price end                                              as price,
  case when ap.promo_id is not null then p.price else p.old_price end as old_price
from public.products p
left join public.categories c on c.id = p.category_id
left join public.brands     b on b.id = p.brand_id
left join lateral (
  select pp.promo_id, pr.title as promo_title, pr.discount_pct, pr.discount_amount
  from public.product_promotions pp
  join public.promotions pr on pr.id = pp.promo_id
  where pp.product_id = p.id and pr.active
    and (pr.starts_at is null or pr.starts_at <= now())
    and (pr.ends_at   is null or pr.ends_at   >= now())
  order by coalesce(pr.discount_pct, 0) desc, coalesce(pr.discount_amount, 0) desc
  limit 1
) ap on true;

-- The storefront reads the view with the anon/authenticated API roles.
grant select on public.products_with_promo to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever an auth user is created
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- is_admin() helper — used by every admin-write policy
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories         enable row level security;
alter table public.brands             enable row level security;
alter table public.products           enable row level security;
alter table public.promotions         enable row level security;
alter table public.product_promotions enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.profiles           enable row level security;

-- Catalog: everyone reads, only admins write.
drop policy if exists "categories read"  on public.categories;
drop policy if exists "categories admin" on public.categories;
create policy "categories read"  on public.categories for select using (true);
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands read"  on public.brands;
drop policy if exists "brands admin" on public.brands;
create policy "brands read"  on public.brands for select using (true);
create policy "brands admin" on public.brands for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products read"  on public.products;
drop policy if exists "products admin" on public.products;
create policy "products read"  on public.products for select using (true);
create policy "products admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "promotions read"  on public.promotions;
drop policy if exists "promotions admin" on public.promotions;
create policy "promotions read"  on public.promotions for select using (true);
create policy "promotions admin" on public.promotions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_promotions read"  on public.product_promotions;
drop policy if exists "product_promotions admin" on public.product_promotions;
create policy "product_promotions read"  on public.product_promotions for select using (true);
create policy "product_promotions admin" on public.product_promotions for all using (public.is_admin()) with check (public.is_admin());

-- Orders: anyone may create (guest checkout); only admins may read/update/delete.
drop policy if exists "orders insert" on public.orders;
drop policy if exists "orders admin"  on public.orders;
create policy "orders insert" on public.orders for insert with check (true);
create policy "orders admin"  on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items insert" on public.order_items;
drop policy if exists "order_items admin"  on public.order_items;
create policy "order_items insert" on public.order_items for insert with check (true);
create policy "order_items admin"  on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: a user reads their own row; admins read all.
drop policy if exists "profiles self"  on public.profiles;
drop policy if exists "profiles admin" on public.profiles;
create policy "profiles self"  on public.profiles for select using (auth.uid() = id);
create policy "profiles admin" on public.profiles for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Product images: public read, admin write.
drop policy if exists "product-images read"  on storage.objects;
drop policy if exists "product-images write" on storage.objects;
create policy "product-images read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product-images write" on storage.objects
  for all using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Payment proofs: admin read only. Uploads happen server-side via the
-- service-role key (which bypasses RLS), so no anon insert policy is needed.
drop policy if exists "payment-proofs admin" on storage.objects;
create policy "payment-proofs admin" on storage.objects
  for select using (bucket_id = 'payment-proofs' and public.is_admin());
