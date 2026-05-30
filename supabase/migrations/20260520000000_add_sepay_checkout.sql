create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('DMX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  user_id uuid references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  shipping_address text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipping', 'completed', 'cancelled')),
  payment_method text not null default 'online'
    check (payment_method in ('cod', 'bank_transfer', 'online')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  subtotal numeric not null check (subtotal >= 0),
  shipping_fee numeric not null default 0 check (shipping_fee >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  total_amount numeric not null check (total_amount >= 0),
  notes text,
  provider text not null default 'sepay',
  sepay_invoice_number text unique,
  sepay_order_id text,
  sepay_checkout_action text,
  sepay_status text,
  sepay_response jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  line_total numeric not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'sepay',
  event_type text not null,
  event_key text not null,
  raw_payload jsonb not null,
  verified_data jsonb,
  created_at timestamptz not null default now(),
  unique (provider, event_key)
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_order_number_idx
  on public.orders (order_number);

create index if not exists orders_sepay_invoice_number_idx
  on public.orders (sepay_invoice_number);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists payment_events_order_id_created_at_idx
  on public.payment_events (order_id, created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;

revoke all on public.orders from anon;
revoke all on public.order_items from anon;
revoke all on public.payment_events from anon;

revoke insert, update, delete on public.orders from authenticated;
revoke insert, update, delete on public.order_items from authenticated;
revoke all on public.payment_events from authenticated;

grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant all on public.orders to service_role;
grant all on public.order_items to service_role;
grant all on public.payment_events to service_role;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "order_items_select_own_order" on public.order_items;
create policy "order_items_select_own_order"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );
