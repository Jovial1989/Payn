# Offer Discovery Engine

## Architecture

```text
offer_discovery_sources
  -> source repository
  -> safe fetcher (robots.txt, daily cache, low-frequency user agent)
  -> parser modules
       html parser
       api parser
       fallback parser
  -> normalizer
       unified offer schema
       affiliate URL preservation
       confidence scoring
       provider/product dedupe
  -> persistence
       discovered_offers
       discovered_offer_versions
       offer_ingestion_runs
       offer_ingestion_logs
  -> product publishing
       GET /api/v1/offers
       canonical catalog merge
       web + mobile catalog consumption
```

## Database

Migration: `supabase/migrations/20260506090000_offer_discovery_engine.sql`

Core tables:
- `offer_discovery_sources`: DB-backed source registry. Sources are not hardcoded in application code.
- `offer_ingestion_runs`: one row per scheduled or manual ingestion run.
- `offer_ingestion_logs`: source-level logs and parser failures.
- `discovered_offers`: normalized offer records ready for review/publishing.
- `discovered_offer_versions`: value-change history for rates, fees, terms, confidence, and tracking URLs.

Source fields:
- `source_type`: `provider`, `marketplace`, or `affiliate`
- `crawl_strategy`: `static`, `api`, or `html`
- `reliability_score`: baseline confidence input

## Parser Structure

Code path: `apps/web/src/server/offers/discovery`

- `fetcher.ts`: public fetch with robots.txt respect and Vercel daily cache.
- `parsers.ts`: strategy router plus HTML, API, and fallback parsers.
- `normalizer.ts`: maps raw data into one schema and dedupes by provider/product/country.
- `source-repository.ts`: loads active sources from Supabase.
- `run-repository.ts`: writes runs, logs, normalized offers, and version history.

## Monetisation Safety

Rules enforced in normalizer/publisher:
- Curated monetised offers keep their existing affiliate links.
- Parsed affiliate URLs are stored as `affiliateUrl` and `rawTrackingUrl`.
- Tracking network is tagged as `financeads`, `impact`, `custom`, `direct`, or `null`.
- Non-monetised parsed offers are marked `informational` and `estimated`.
- Direct provider data is preferred over marketplace data when confidence is comparable.

## Scheduler

Vercel cron: `apps/web/vercel.json`

```json
{
  "path": "/api/v1/offers/import",
  "schedule": "0 4 * * *"
}
```

Manual dry run:

```bash
curl "https://payn.online/api/v1/offers/import?country=DE&category=loans"
```

Manual apply:

```bash
curl -X POST "https://payn.online/api/v1/offers/import?apply=1"
```

Set `OFFER_IMPORT_SECRET` in production to require `x-payn-import-secret` or `?secret=`.

## Product API

Endpoint:

```text
GET /api/v1/offers?country=DE&category=loans
```

Response includes:
- canonical curated offers
- published discovered offers
- monetised offers sorted first
- `flags.monetised`
- `flags.informational`
- `flags.estimated`
- UI labels for `Best option` vs `Market data`

## Current Integration Plan

1. Create sources in `offer_discovery_sources`.
2. Run import in dry-run mode and inspect `normalizedOffers`.
3. Enable `apply=1` to persist normalized records.
4. Review and set `discovered_offers.published = true` for product visibility.
5. Point web/mobile catalog fetches to `/api/v1/offers` when ready to include discovered offers in the main catalog.
