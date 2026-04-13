alter table public.user_profiles
add column if not exists market_scope text not null default 'eu_fallback';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_market_scope_check'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_market_scope_check
      check (market_scope in ('local_only', 'eu_fallback', 'all_europe'));
  end if;
end $$;

