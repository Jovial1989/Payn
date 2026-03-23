create extension if not exists "pgcrypto";

create table if not exists public.categories (
  code text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.countries (
  code text primary key,
  name text not null,
  region text not null default 'EU',
  created_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text not null,
  logo_path text,
  trust_score numeric(5,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_offers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id),
  category_code text not null references public.categories(code),
  slug text not null unique,
  title text not null,
  subtitle text,
  pricing_snapshot jsonb not null default '{}'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  best_for jsonb not null default '[]'::jsonb,
  compliance_notes jsonb not null default '[]'::jsonb,
  provider_website_url text not null,
  affiliate_link text not null,
  link_type text not null,
  affiliate_priority_score numeric(5,2) not null default 0,
  base_rank numeric(8,3) not null default 0,
  published boolean not null default false,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offer_country_availability (
  offer_id uuid not null references public.product_offers(id) on delete cascade,
  country_code text not null references public.countries(code),
  is_available boolean not null default true,
  primary key (offer_id, country_code)
);

create table if not exists public.ranking_rules (
  id uuid primary key default gen_random_uuid(),
  category_code text not null references public.categories(code),
  country_code text references public.countries(code),
  rule_key text not null,
  weight numeric(6,3) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.product_offers(id),
  country_code text,
  session_id text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.product_offers(id),
  category_code text not null references public.categories(code),
  country_code text references public.countries(code),
  email text,
  phone text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  page_type text not null,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key,
  preferred_country_code text references public.countries(code),
  saved_filters jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_offers_category_published on public.product_offers (category_code, published);
create index if not exists idx_offer_country_availability_country on public.offer_country_availability (country_code, is_available);
create index if not exists idx_affiliate_clicks_offer_created on public.affiliate_clicks (offer_id, created_at desc);
create index if not exists idx_leads_category_status on public.leads (category_code, status);

