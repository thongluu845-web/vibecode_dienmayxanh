create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.orders') is not null then
    alter table public.orders
      add column if not exists provider text default 'sepay',
      add column if not exists sepay_invoice_number text,
      add column if not exists sepay_order_id text,
      add column if not exists sepay_checkout_action text,
      add column if not exists sepay_status text,
      add column if not exists sepay_response jsonb,
      add column if not exists expires_at timestamptz,
      add column if not exists paid_at timestamptz,
      add column if not exists cancelled_at timestamptz,
      add column if not exists failed_at timestamptz;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'orders'
        and column_name = 'payos_payment_link_id'
    ) then
      update public.orders
        set sepay_invoice_number = coalesce(sepay_invoice_number, payos_payment_link_id);
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'orders'
        and column_name = 'payos_checkout_url'
    ) then
      update public.orders
        set sepay_checkout_action = coalesce(sepay_checkout_action, payos_checkout_url);
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'orders'
        and column_name = 'payos_status'
    ) then
      update public.orders
        set sepay_status = coalesce(sepay_status, payos_status);
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'orders'
        and column_name = 'payos_response'
    ) then
      update public.orders
        set sepay_response = coalesce(sepay_response, payos_response);
    end if;

    update public.orders
      set provider = 'sepay'
      where provider is null or provider = 'payos';

    alter table public.orders
      alter column provider set default 'sepay',
      alter column provider set not null;

    if exists (
      select 1
      from pg_constraint
      where conrelid = 'public.orders'::regclass
        and conname = 'orders_payos_payment_link_id_key'
    ) then
      alter table public.orders
        drop constraint orders_payos_payment_link_id_key;
    end if;

    alter table public.orders
      drop column if exists payos_payment_link_id,
      drop column if exists payos_checkout_url,
      drop column if exists payos_status,
      drop column if exists payos_response;

    create unique index if not exists orders_sepay_invoice_number_key
      on public.orders (sepay_invoice_number)
      where sepay_invoice_number is not null;
  end if;
end $$;

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

alter table public.payment_events enable row level security;

revoke all on public.payment_events from anon;
revoke all on public.payment_events from authenticated;
grant all on public.payment_events to service_role;

create index if not exists payment_events_order_id_created_at_idx
  on public.payment_events (order_id, created_at desc);

do $$
begin
  if to_regclass('public.payment_events') is not null then
    alter table public.payment_events alter column provider set default 'sepay';

    update public.payment_events
      set provider = 'sepay'
      where provider = 'payos';
  end if;
end $$;
