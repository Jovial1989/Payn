create extension if not exists "pgcrypto";

create table if not exists public.offer_discovery_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  country text not null default 'EU',
  categories text[] not null default '{}',
  source_type text not null check (source_type in ('provider', 'marketplace', 'affiliate')),
  crawl_strategy text not null default 'html' check (crawl_strategy in ('static', 'api', 'html')),
  reliability_score numeric(5,4) not null default 0.5000,
  is_active boolean not null default true,
  last_crawled_at timestamptz,
  parser_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (url, country)
);

create table if not exists public.offer_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued',
  source_count integer not null default 0,
  offers_discovered integer not null default 0,
  offers_normalized integer not null default 0,
  offers_published integer not null default 0,
  changes_detected integer not null default 0,
  error_count integer not null default 0,
  duration_ms integer,
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.offer_ingestion_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.offer_ingestion_runs(id) on delete set null,
  source_id uuid references public.offer_discovery_sources(id) on delete set null,
  level text not null check (level in ('info', 'warn', 'error')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.discovered_offers (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  provider_name text not null,
  product_name text not null,
  category text not null,
  country text not null,
  apr_min numeric,
  apr_max numeric,
  fee text,
  currency text not null default 'EUR',
  amount_min numeric,
  amount_max numeric,
  term_min integer,
  term_max integer,
  features text[] not null default '{}',
  is_monetised boolean not null default false,
  affiliate_url text,
  raw_tracking_url text,
  tracking_network text,
  source_url text not null,
  source_type text not null check (source_type in ('provider', 'marketplace', 'affiliate')),
  last_updated timestamptz not null default now(),
  confidence_score numeric(5,4) not null default 0,
  informational boolean not null default true,
  estimated boolean not null default true,
  published boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discovered_offer_versions (
  id uuid primary key default gen_random_uuid(),
  discovered_offer_id uuid references public.discovered_offers(id) on delete cascade,
  fingerprint text not null,
  changed_fields text[] not null default '{}',
  previous_payload jsonb,
  next_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_offer_discovery_sources_active_country
  on public.offer_discovery_sources (is_active, country);
create index if not exists idx_discovered_offers_scope
  on public.discovered_offers (published, country, category, is_monetised desc, confidence_score desc);
create index if not exists idx_offer_ingestion_logs_source_created
  on public.offer_ingestion_logs (source_id, created_at desc);

alter table public.offer_discovery_sources enable row level security;
alter table public.offer_ingestion_runs enable row level security;
alter table public.offer_ingestion_logs enable row level security;
alter table public.discovered_offers enable row level security;
alter table public.discovered_offer_versions enable row level security;

create policy "Public can read published discovered offers"
  on public.discovered_offers
  for select
  using (published = true);
