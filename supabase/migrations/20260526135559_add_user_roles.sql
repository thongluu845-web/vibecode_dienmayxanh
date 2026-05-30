do $$
begin
  if to_regtype('public.app_role') is null then
    create type public.app_role as enum ('user', 'admin');
  end if;
end $$;

grant usage on type public.app_role to authenticated, service_role;

create schema if not exists private;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_roles is 'Application-level roles for authenticated users.';
comment on column public.user_roles.role is 'Use admin for staff/admin access. Regular users default to user.';

create index if not exists user_roles_role_idx
  on public.user_roles (role);

create or replace function private.touch_user_roles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_roles_updated_at on public.user_roles;
create trigger touch_user_roles_updated_at
  before update on public.user_roles
  for each row
  execute function private.touch_user_roles_updated_at();

create or replace function private.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user'::public.app_role)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_default_role on auth.users;
create trigger on_auth_user_created_assign_default_role
  after insert on auth.users
  for each row
  execute function private.handle_new_user_role();

insert into public.user_roles (user_id, role)
select id, 'user'::public.app_role
from auth.users
on conflict (user_id) do nothing;

create or replace function private.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and (
          role = required_role
          or role = 'admin'::public.app_role
        )
    );
$$;

create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security invoker
set search_path = ''
as $$
  select
    case
      when coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
        then 'admin'::public.app_role
      else coalesce(
        (
          select role
          from public.user_roles
          where user_id = auth.uid()
        ),
        'user'::public.app_role
      )
    end;
$$;

revoke all on function private.touch_user_roles_updated_at() from anon, authenticated, public;
revoke all on function private.handle_new_user_role() from anon, authenticated, public;
revoke all on function private.has_role(public.app_role) from anon, authenticated, public;
grant usage on schema private to authenticated;
grant execute on function private.has_role(public.app_role) to authenticated;
grant execute on function public.get_my_role() to authenticated;

alter table public.user_roles enable row level security;

revoke all on public.user_roles from anon;
revoke insert, update, delete on public.user_roles from authenticated;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin"
  on public.user_roles
  for select
  to authenticated
  using ((select private.has_role('admin'::public.app_role)));

do $$
begin
  if to_regclass('public.products') is not null then
    execute 'drop policy if exists "products_role_admin_manage" on public.products';
    execute 'create policy "products_role_admin_manage" on public.products for all to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.categories') is not null then
    execute 'drop policy if exists "categories_role_admin_manage" on public.categories';
    execute 'create policy "categories_role_admin_manage" on public.categories for all to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'drop policy if exists "profiles_role_admin_select" on public.profiles';
    execute 'create policy "profiles_role_admin_select" on public.profiles for select to authenticated using ((select private.has_role(''admin''::public.app_role)))';

    execute 'drop policy if exists "profiles_role_admin_update" on public.profiles';
    execute 'create policy "profiles_role_admin_update" on public.profiles for update to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.cart_items') is not null then
    execute 'drop policy if exists "cart_items_role_admin_select" on public.cart_items';
    execute 'create policy "cart_items_role_admin_select" on public.cart_items for select to authenticated using ((select private.has_role(''admin''::public.app_role)))';

    execute 'drop policy if exists "cart_items_role_admin_update" on public.cart_items';
    execute 'create policy "cart_items_role_admin_update" on public.cart_items for update to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)) and quantity > 0 and quantity <= 99)';

    execute 'drop policy if exists "cart_items_role_admin_delete" on public.cart_items';
    execute 'create policy "cart_items_role_admin_delete" on public.cart_items for delete to authenticated using ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.orders') is not null then
    execute 'drop policy if exists "orders_role_admin_select" on public.orders';
    execute 'create policy "orders_role_admin_select" on public.orders for select to authenticated using ((select private.has_role(''admin''::public.app_role)))';

    execute 'drop policy if exists "orders_role_admin_update" on public.orders';
    execute 'create policy "orders_role_admin_update" on public.orders for update to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';

    execute 'drop policy if exists "orders_role_admin_delete" on public.orders';
    execute 'create policy "orders_role_admin_delete" on public.orders for delete to authenticated using ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.order_items') is not null then
    execute 'drop policy if exists "order_items_role_admin_manage" on public.order_items';
    execute 'create policy "order_items_role_admin_manage" on public.order_items for all to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.payment_events') is not null then
    execute 'grant select on public.payment_events to authenticated';

    execute 'drop policy if exists "payment_events_role_admin_select" on public.payment_events';
    execute 'create policy "payment_events_role_admin_select" on public.payment_events for select to authenticated using ((select private.has_role(''admin''::public.app_role)))';
  end if;
end $$;
