-- User profiles for onboarding and personalization
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_categories text[] not null default '{}',
  home_country text references public.countries(code),
  target_countries text[] not null default '{}',
  goals text[] not null default '{}',
  user_type text not null default 'personal',
  spending_range text,
  transfer_range text,
  loan_range text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saved / favorited offers
create table if not exists public.saved_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id text not null,
  category text not null,
  saved_at timestamptz not null default now(),
  unique (user_id, offer_id)
);

-- User activity tracking
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  offer_id text,
  category text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_saved_offers_user on public.saved_offers (user_id, saved_at desc);
create index if not exists idx_user_activity_user on public.user_activity (user_id, created_at desc);
create index if not exists idx_user_profiles_country on public.user_profiles (home_country);

-- RLS policies
alter table public.user_profiles enable row level security;
alter table public.saved_offers enable row level security;
alter table public.user_activity enable row level security;

create policy "Users can read own profile" on public.user_profiles
  for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = user_id);

create policy "Users can read own saved offers" on public.saved_offers
  for select using (auth.uid() = user_id);
create policy "Users can insert own saved offers" on public.saved_offers
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved offers" on public.saved_offers
  for delete using (auth.uid() = user_id);

create policy "Users can read own activity" on public.user_activity
  for select using (auth.uid() = user_id);
create policy "Users can insert own activity" on public.user_activity
  for insert with check (auth.uid() = user_id);
