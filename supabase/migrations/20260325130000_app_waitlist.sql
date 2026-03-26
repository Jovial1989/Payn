create table if not exists public.app_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  platform text not null default 'both' check (platform in ('ios', 'android', 'both')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_app_waitlist_email_platform
  on public.app_waitlist ((lower(email)), platform);

alter table public.app_waitlist enable row level security;

create policy "Anyone can join app waitlist" on public.app_waitlist
  for insert
  to anon, authenticated
  with check (
    char_length(trim(email)) > 3
    and position('@' in email) > 1
    and platform in ('ios', 'android', 'both')
  );
