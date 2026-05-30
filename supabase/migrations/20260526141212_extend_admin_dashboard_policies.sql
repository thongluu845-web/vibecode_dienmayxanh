do $$
begin
  if to_regclass('public.banners') is not null then
    execute 'grant select, insert, update, delete on public.banners to authenticated';

    execute 'drop policy if exists "banners_role_admin_manage" on public.banners';
    execute 'create policy "banners_role_admin_manage" on public.banners for all to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';
  end if;

  if to_regclass('public.user_roles') is not null then
    execute 'grant update on public.user_roles to authenticated';

    execute 'drop policy if exists "user_roles_update_admin" on public.user_roles';
    execute 'create policy "user_roles_update_admin" on public.user_roles for update to authenticated using ((select private.has_role(''admin''::public.app_role))) with check ((select private.has_role(''admin''::public.app_role)))';
  end if;
end $$;
