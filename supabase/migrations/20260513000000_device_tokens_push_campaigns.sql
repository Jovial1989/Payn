-- device_tokens: stores FCM registration tokens per device
create table if not exists public.device_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  token         text not null unique,
  platform      text not null check (platform in ('ios', 'android', 'web')),
  locale        text,
  country       text,
  is_active     boolean not null default true,
  last_seen_at  timestamptz not null default now(),
  registered_at timestamptz not null default now(),
  metadata      jsonb default '{}'
);

create index if not exists device_tokens_user_id_idx    on public.device_tokens(user_id);
create index if not exists device_tokens_is_active_idx  on public.device_tokens(is_active);
create index if not exists device_tokens_country_idx    on public.device_tokens(country);
create index if not exists device_tokens_locale_idx     on public.device_tokens(locale);

alter table public.device_tokens enable row level security;

create policy "Users manage own tokens"
  on public.device_tokens for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- push_campaigns: admin-created push notification campaigns
create table if not exists public.push_campaigns (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  body                  text not null,
  audience_countries    text[] not null default '{}',
  audience_languages    text[] not null default '{}',
  audience_last_active_days integer,
  status                text not null default 'draft'
                          check (status in ('draft','scheduled','sending','sent','cancelled')),
  scheduled_at          timestamptz,
  sent_at               timestamptz,
  audience_size         integer,
  delivered_count       integer not null default 0,
  failed_count          integer not null default 0,
  invalid_tokens_marked integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists push_campaigns_status_idx       on public.push_campaigns(status);
create index if not exists push_campaigns_scheduled_at_idx on public.push_campaigns(scheduled_at);
create index if not exists push_campaigns_created_at_idx   on public.push_campaigns(created_at desc);

alter table public.push_campaigns enable row level security;
-- service role only — no public access

create trigger push_campaigns_updated_at
  before update on public.push_campaigns
  for each row execute function touch_updated_at();
