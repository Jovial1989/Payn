-- Full admin CRUD for marketplace offers
-- Also adds: admin audit log, user stats helpers, parser trigger log

-- ── product_offers ──────────────────────────────────────────────────────
create table if not exists product_offers (
  id                     text primary key,
  slug                   text unique not null,
  provider_name          text not null,
  provider_mark          text not null default '',
  provider_website_url   text not null default '',
  title                  text not null,
  subtitle               text not null default '',
  category               text not null,
  country_codes          text[] not null default '{}',
  affiliate_link         text not null default '',
  link_type              text not null default 'affiliate_redirect'
                           check (link_type in ('affiliate_redirect','lead_capture','embedded_partner','informational')),
  affiliate_priority_score numeric not null default 0.5,
  is_monetised           boolean not null default false,
  status                 text not null default 'active'
                           check (status in ('active','inactive','needs_review','archived')),
  is_featured            boolean not null default false,
  best_for               text[] not null default '{}',
  metrics                jsonb not null default '[]',
  attributes             jsonb not null default '{}',
  tags                   text[] not null default '{}',
  notes                  text,
  data_source            text not null default 'admin'
                           check (data_source in ('static','admin','parser')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists product_offers_category_idx       on product_offers(category);
create index if not exists product_offers_status_idx         on product_offers(status);
create index if not exists product_offers_provider_name_idx  on product_offers(provider_name);
create index if not exists product_offers_is_monetised_idx   on product_offers(is_monetised);
create index if not exists product_offers_created_at_idx     on product_offers(created_at desc);

alter table product_offers enable row level security;

create policy "anon_read_active_product_offers"
  on product_offers for select
  to anon, authenticated
  using (status = 'active');

-- trigger: keep updated_at fresh
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger product_offers_updated_at
  before update on product_offers
  for each row execute function touch_updated_at();

-- ── admin_audit_log ──────────────────────────────────────────────────────────
create table if not exists admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor       text not null default 'admin',
  action      text not null,   -- create_offer | update_offer | delete_offer | seed_offers | trigger_parser
  target_id   text,
  target_type text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx on admin_audit_log(created_at desc);
create index if not exists admin_audit_log_action_idx     on admin_audit_log(action);

alter table admin_audit_log enable row level security;
-- service role only — no public access

-- ── user stats helpers ────────────────────────────────────────────────────────
create or replace function admin_user_click_counts()
returns table (user_id uuid, click_count bigint)
language sql security definer as $$
  select user_id, count(*) as click_count
  from offer_click_events
  where user_id is not null
  group by user_id;
$$;

create or replace function admin_user_saved_counts()
returns table (user_id uuid, saved_count bigint)
language sql security definer as $$
  select user_id, count(*) as saved_count
  from saved_offers
  group by user_id;
$$;

-- ── clicks analytics helpers ─────────────────────────────────────────────────
create or replace function admin_clicks_by_day(days_back integer default 30)
returns table (day date, click_count bigint, monetised_count bigint)
language sql security definer as $$
  select
    date_trunc('day', created_at)::date as day,
    count(*) as click_count,
    count(*) filter (where is_monetised) as monetised_count
  from offer_click_events
  where created_at >= now() - (days_back || ' days')::interval
  group by 1
  order by 1 desc;
$$;

create or replace function admin_clicks_summary()
returns table (
  total_clicks bigint,
  clicks_today bigint,
  monetised_clicks bigint,
  mobile_clicks bigint,
  unique_offers bigint,
  unique_providers bigint
)
language sql security definer as $$
  select
    count(*) as total_clicks,
    count(*) filter (where created_at >= current_date) as clicks_today,
    count(*) filter (where is_monetised) as monetised_clicks,
    count(*) filter (where device_type = 'mobile') as mobile_clicks,
    count(distinct offer_id) as unique_offers,
    count(distinct provider_id) as unique_providers
  from offer_click_events;
$$;

-- ── existing RPC guards (idempotent) ────────────────────────────────────────
create or replace function admin_top_clicked_offers(limit_n integer default 10)
returns table (offer_id text, click_count bigint)
language sql security definer as $$
  select offer_id, count(*) as click_count
  from offer_click_events
  group by offer_id
  order by click_count desc
  limit limit_n;
$$;

create or replace function admin_top_clicked_providers(limit_n integer default 10)
returns table (provider_id text, click_count bigint)
language sql security definer as $$
  select provider_id, count(*) as click_count
  from offer_click_events
  group by provider_id
  order by click_count desc
  limit limit_n;
$$;
