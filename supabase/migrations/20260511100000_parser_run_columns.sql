-- Add offers_imported / offers_skipped columns used by admin parser trigger
alter table public.offer_ingestion_runs
  add column if not exists offers_imported integer,
  add column if not exists offers_skipped  integer;
