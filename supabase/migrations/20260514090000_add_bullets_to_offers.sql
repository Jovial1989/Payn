alter table product_offers
  add column if not exists bullets text[] default '{}',
  add column if not exists last_ai_enrichment_at timestamptz,
  add column if not exists last_human_review_at timestamptz;

create index if not exists product_offers_last_ai_enrichment_at_idx
  on product_offers (last_ai_enrichment_at);
