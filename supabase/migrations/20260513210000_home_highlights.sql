-- home_highlights: admin-managed feed for "What's new" section on the homepage
create table if not exists home_highlights (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text not null,
  kind          text not null check (kind in ('rate_change','new_launch','new_provider','feature_update')),
  country       text,                          -- null = visible in all countries
  offer_id      text,
  cta_text      text not null default 'See offer',
  cta_url       text,
  is_active     boolean not null default true,
  published_at  timestamptz not null default now(),
  expires_at    timestamptz,
  created_by    text,
  created_at    timestamptz not null default now()
);

create index if not exists home_highlights_active_idx
  on home_highlights (is_active, published_at desc)
  where is_active = true;

create index if not exists home_highlights_country_idx
  on home_highlights (country);
