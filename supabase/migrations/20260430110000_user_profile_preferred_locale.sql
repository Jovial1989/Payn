alter table public.user_profiles
add column if not exists preferred_locale text;

update public.user_profiles
set preferred_locale = coalesce(preferred_locale, 'en')
where preferred_locale is null;

alter table public.user_profiles
alter column preferred_locale set default 'en';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_preferred_locale_check'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_preferred_locale_check
      check (preferred_locale in ('en', 'de', 'es', 'fr', 'it', 'pt'));
  end if;
end $$;
