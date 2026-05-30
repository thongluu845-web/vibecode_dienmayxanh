create or replace function public.get_admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  summary jsonb;
begin
  if not coalesce(private.has_role('admin'::public.app_role), false) then
    raise insufficient_privilege using message = 'Admin role required';
  end if;

  with month_series as (
    select generate_series(
      date_trunc('month', now()) - interval '5 months',
      date_trunc('month', now()),
      interval '1 month'
    )::date as month_start
  ),
  monthly_revenue as (
    select
      month_series.month_start,
      count(public.orders.id)::integer as orders,
      coalesce(sum(public.orders.total_amount), 0)::numeric as revenue
    from month_series
    left join public.orders
      on date_trunc('month', public.orders.created_at)::date = month_series.month_start
    group by month_series.month_start
  ),
  order_statuses as (
    select
      public.orders.status,
      count(*)::integer as orders,
      coalesce(sum(public.orders.total_amount), 0)::numeric as revenue
    from public.orders
    group by public.orders.status
  ),
  category_rollup as (
    select
      public.categories.name,
      public.categories.sort_order,
      count(public.products.id)::integer as products,
      (count(public.products.id) filter (where public.products.is_active))::integer as active_products,
      coalesce(sum(public.products.stock_quantity), 0)::integer as stock_units,
      coalesce(sum(public.products.sold), 0)::integer as sold_units
    from public.categories
    left join public.products on public.products.category_id = public.categories.id
    group by public.categories.id, public.categories.name, public.categories.sort_order
  ),
  product_summary as (
    select
      count(*)::integer as total_products,
      (count(*) filter (where public.products.is_active))::integer as active_products,
      (count(*) filter (where public.products.is_featured))::integer as featured_products,
      (count(*) filter (where public.products.is_flash_sale))::integer as flash_sale_products,
      (count(*) filter (where public.products.stock_quantity <= 0))::integer as out_of_stock,
      (count(*) filter (where public.products.stock_quantity > 0 and public.products.stock_quantity <= 10))::integer as low_stock,
      (count(*) filter (where public.products.stock_quantity > 10))::integer as healthy_stock,
      coalesce(sum(public.products.stock_quantity), 0)::integer as stock_units,
      coalesce(sum(public.products.sold), 0)::integer as sold_units
    from public.products
  ),
  cart_summary as (
    select
      count(*)::integer as cart_items,
      coalesce(sum(public.cart_items.quantity), 0)::integer as cart_quantity
    from public.cart_items
  ),
  order_summary as (
    select
      count(*)::integer as total_orders,
      (count(*) filter (
        where public.orders.status ilike '%pending%'
          or public.orders.status ilike '%processing%'
      ))::integer as pending_orders,
      coalesce(sum(public.orders.total_amount), 0)::numeric as total_revenue
    from public.orders
  ),
  role_rollup as (
    select
      public.user_roles.role::text as role,
      count(*)::integer as users
    from public.user_roles
    group by public.user_roles.role
  )
  select jsonb_build_object(
    'counts', jsonb_build_object(
      'orders', coalesce((select total_orders from order_summary), 0),
      'pendingOrders', coalesce((select pending_orders from order_summary), 0),
      'totalRevenue', coalesce((select total_revenue from order_summary), 0),
      'products', coalesce((select total_products from product_summary), 0),
      'activeProducts', coalesce((select active_products from product_summary), 0),
      'featuredProducts', coalesce((select featured_products from product_summary), 0),
      'flashSaleProducts', coalesce((select flash_sale_products from product_summary), 0),
      'lowStockProducts', coalesce((select low_stock from product_summary), 0),
      'outOfStockProducts', coalesce((select out_of_stock from product_summary), 0),
      'healthyStockProducts', coalesce((select healthy_stock from product_summary), 0),
      'stockUnits', coalesce((select stock_units from product_summary), 0),
      'soldUnits', coalesce((select sold_units from product_summary), 0),
      'categories', (select count(*) from public.categories),
      'activeCategories', (select count(*) from public.categories where public.categories.is_active),
      'banners', (select count(*) from public.banners),
      'activeBanners', (select count(*) from public.banners where public.banners.is_active),
      'profiles', (select count(*) from public.profiles),
      'roles', (select count(*) from public.user_roles),
      'cartItems', coalesce((select cart_items from cart_summary), 0),
      'cartQuantity', coalesce((select cart_quantity from cart_summary), 0)
    ),
    'revenueSeries', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'label', to_char(month_start, 'FMMM/YY'),
            'value', revenue,
            'orders', orders
          )
          order by month_start
        )
        from monthly_revenue
      ),
      '[]'::jsonb
    ),
    'statusSegments', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'label', status,
            'value', orders,
            'amount', revenue
          )
          order by orders desc, status
        )
        from order_statuses
      ),
      '[]'::jsonb
    ),
    'categorySegments', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'label', name,
            'value', products,
            'activeProducts', active_products,
            'stockUnits', stock_units,
            'soldUnits', sold_units
          )
          order by sort_order, name
        )
        from category_rollup
      ),
      '[]'::jsonb
    ),
    'stockSegments', jsonb_build_array(
      jsonb_build_object('label', 'Hết hàng', 'value', coalesce((select out_of_stock from product_summary), 0)),
      jsonb_build_object('label', 'Sắp hết', 'value', coalesce((select low_stock from product_summary), 0)),
      jsonb_build_object('label', 'Ổn định', 'value', coalesce((select healthy_stock from product_summary), 0))
    ),
    'roleSummary', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('label', role, 'value', users)
          order by role
        )
        from role_rollup
      ),
      '[]'::jsonb
    )
  )
  into summary;

  return summary;
end;
$$;

revoke all on function public.get_admin_dashboard_summary() from anon, public;
grant execute on function public.get_admin_dashboard_summary() to authenticated;
