create table if not exists public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  country text not null,
  metric text not null,
  operator text not null check (operator in ('above', 'below')),
  threshold numeric(10,4) not null,
  label text not null,
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_alerts_user on public.rate_alerts (user_id);
create index if not exists idx_rate_alerts_active on public.rate_alerts (is_active, category, country) where is_active = true;

alter table public.rate_alerts enable row level security;

create policy "Users can read own alerts" on public.rate_alerts for select using (auth.uid() = user_id);
create policy "Users can insert own alerts" on public.rate_alerts for insert with check (auth.uid() = user_id);
create policy "Users can update own alerts" on public.rate_alerts for update using (auth.uid() = user_id);
create policy "Users can delete own alerts" on public.rate_alerts for delete using (auth.uid() = user_id);
