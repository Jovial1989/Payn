-- Admin panel: offer click events + offer overrides

create table if not exists offer_click_events (
  id uuid primary key default gen_random_uuid(),
  offer_id text not null,
  provider_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  country text not null default '',
  category text not null default '',
  language text not null default 'en',
  device_type text not null default 'unknown',
  source_page text not null default '',
  is_monetised boolean not null default false,
  outbound_url text not null default '',
  created_at timestamptz not null default now()
);

create index offer_click_events_offer_id_idx on offer_click_events(offer_id);
create index offer_click_events_created_at_idx on offer_click_events(created_at desc);
create index offer_click_events_country_idx on offer_click_events(country);
create index offer_click_events_category_idx on offer_click_events(category);

alter table offer_click_events enable row level security;

-- No public access — admin reads via service role only

create table if not exists admin_offer_overrides (
  offer_id text primary key,
  affiliate_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'needs_review')),
  notes text,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'admin'
);

alter table admin_offer_overrides enable row level security;

-- Helper: top clicked offers
create or replace function admin_top_clicked_offers(limit_n integer default 10)
returns table (offer_id text, click_count bigint)
language sql
security definer
as $$
  select offer_id, count(*) as click_count
  from offer_click_events
  group by offer_id
  order by click_count desc
  limit limit_n;
$$;

-- Helper: top clicked providers
create or replace function admin_top_clicked_providers(limit_n integer default 10)
returns table (provider_id text, click_count bigint)
language sql
security definer
as $$
  select provider_id, count(*) as click_count
  from offer_click_events
  group by provider_id
  order by click_count desc
  limit limit_n;
$$;
