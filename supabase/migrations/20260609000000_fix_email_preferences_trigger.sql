-- Fix: ensure_email_preferences_trg was blocking OAuth user creation.
-- When the trigger raises an exception (e.g. table missing, search_path issue),
-- Supabase GoTrue rolls back the entire auth.users INSERT and returns
-- "Database error saving new user". Adding EXCEPTION + explicit search_path
-- makes the trigger fault-tolerant so user creation always succeeds.

-- 1. Ensure the table exists (idempotent — no-op if already there)
create table if not exists public.email_preferences (
  id                    uuid      primary key default gen_random_uuid(),
  user_id               uuid      references auth.users(id) on delete cascade unique,
  marketing_opt_in      boolean   default false,
  transactional_opt_in  boolean   default true,
  digest_frequency      text      check (digest_frequency in ('weekly', 'monthly', 'off')) default 'monthly',
  country               text,
  language              text      default 'en',
  unsubscribe_token     text      unique default encode(gen_random_bytes(24), 'base64'),
  last_email_sent_at    timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists email_preferences_user_id_idx    on public.email_preferences(user_id);
create index if not exists email_preferences_marketing_idx  on public.email_preferences(marketing_opt_in) where marketing_opt_in = true;
create index if not exists email_preferences_token_idx      on public.email_preferences(unsubscribe_token);

-- 2. Replace the trigger function with:
--    • explicit search_path = public  (prevents "relation not found" when search_path differs)
--    • EXCEPTION block               (never let a failed insert block user creation)
create or replace function public.ensure_email_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.email_preferences (user_id, marketing_opt_in, transactional_opt_in)
  values (new.id, false, true)
  on conflict (user_id) do nothing;
  return new;
exception when others then
  -- Silently swallow any error so auth.users INSERT always succeeds.
  -- The missing preference row will be backfilled on first login or via cron.
  return new;
end;
$$;

-- 3. Recreate the trigger (drop first to pick up the new function signature)
drop trigger if exists ensure_email_preferences_trg on auth.users;
create trigger ensure_email_preferences_trg
  after insert on auth.users
  for each row execute function public.ensure_email_preferences();

-- 4. Backfill any users who don't have a preference row yet
insert into public.email_preferences (user_id, marketing_opt_in, transactional_opt_in)
select id, false, true from auth.users
on conflict (user_id) do nothing;
