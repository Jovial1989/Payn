# Supabase Data Patterns

## When to load this skill
- Writing Supabase migrations (`.sql` files in `supabase/migrations/`)
- Adding `.from("table")` calls anywhere in the codebase
- Schema design: adding columns, indexes, RLS policies
- Country/locale broadcasting (highlights, announcements)
- Touching `createSupabaseAdminClient`, `createSupabaseClient`, Supabase queries

## TL;DR
- **ALWAYS verify the actual table name** via `information_schema.tables` before writing migrations or `.from()` calls. TypeScript type names ≠ DB table names.
- **Service-role key = server-only.** Never in client components or public env vars.
- **Country broadcast pattern:** `.or("country.is.null,country.eq.EU,country.eq." + upper)` — EU and null act as pan-regional broadcasts.
- **Migration safety:** always `ADD COLUMN IF NOT EXISTS`, always `CREATE INDEX IF NOT EXISTS`.
- **JSONB `attributes` for flexible metadata; dedicated columns for queryable fields.**

## The pattern

### CRITICAL: Verify table names before any SQL

```sql
-- Run this in Supabase SQL editor BEFORE writing any migration:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Or in psql:
\dt
```

Do NOT infer table names from:
- TypeScript type names (`MarketplaceOffer` → NOT `marketplace_offers`)
- Variable names in code
- What "sounds right"

The actual table for offer admin CRUD is `product_offers`, not `marketplace_offers`.

### Supabase client — which to use where

```ts
// Server-side admin operations — bypasses RLS, full access
import { createSupabaseAdminClient } from "@/server/supabase/admin";
// Uses SUPABASE_SERVICE_ROLE_KEY — server-only, never expose to client

const admin = createSupabaseAdminClient();
if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

// Always guard: returns null if SUPABASE_SERVICE_ROLE_KEY is not set
const { data, error } = await admin.from("product_offers").select("*");

// Client-side — respects RLS, uses anon key
import { createSupabaseClient } from "@/server/supabase/client";
// Uses NEXT_PUBLIC_SUPABASE_ANON_KEY — safe to expose
```

### Migration file pattern

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_description.sql
-- Filename: 20260514090000_add_bullets_to_offers.sql

-- Always use IF NOT EXISTS guards — migrations may be re-run or applied in stages
ALTER TABLE product_offers
  ADD COLUMN IF NOT EXISTS bullets text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_ai_enrichment_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_human_review_at timestamptz;

-- Index only columns you'll actually filter/sort by
CREATE INDEX IF NOT EXISTS product_offers_last_ai_enrichment_at_idx
  ON product_offers (last_ai_enrichment_at);

-- Verify at end (run manually to confirm after applying):
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'product_offers' ORDER BY ordinal_position;
```

### Column type selection

```sql
-- Text fields
title text NOT NULL,                    -- required
notes text,                             -- nullable
slug text UNIQUE NOT NULL,              -- unique constraint inline

-- Arrays
country_codes text[] NOT NULL DEFAULT '{}',
bullets text[] DEFAULT '{}',
tags text[] NOT NULL DEFAULT '{}',

-- JSONB (flexible/optional metadata)
attributes jsonb NOT NULL DEFAULT '{}',
metrics jsonb NOT NULL DEFAULT '[]',

-- Numbers
affiliate_priority_score numeric NOT NULL DEFAULT 0.5,

-- Booleans
is_monetised boolean NOT NULL DEFAULT false,

-- Timestamps
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
last_ai_enrichment_at timestamptz,     -- nullable: null = never enriched
last_human_review_at timestamptz,      -- nullable: null = never reviewed

-- Enums via CHECK constraints (simpler than Postgres enums)
status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'needs_review', 'archived')),
data_source text NOT NULL DEFAULT 'admin'
  CHECK (data_source IN ('static', 'admin', 'parser')),
```

### JSONB attributes vs dedicated columns — decision rule

```
Use dedicated column when:
  ✓ You filter by it in queries (WHERE, order by)
  ✓ It's required for every row
  ✓ It has a fixed shape (always a number, always a text, etc.)

Use attributes JSONB when:
  ✓ It's optional metadata on a subset of rows
  ✓ Shape varies by category (loans vs insurance have different fields)
  ✓ You never filter by it in Supabase queries
  ✓ Future-flexibility: might add more sub-fields later

Examples in product_offers:
  dedicated: id, title, category, country_codes, affiliate_link, status, is_monetised
  attributes: subtype, insuranceType, minAmount, cardType, annualFeeAmount, etc.
```

### Country broadcast pattern

This pattern is used for `home_highlights` and any content that should be visible to broad audiences:

```ts
// .or() with three conditions:
// 1. country IS NULL → visible everywhere (global content)
// 2. country = 'EU' → visible to all European country cookies (broadcast)
// 3. country = specific code → only that country

const { data } = await admin
  .from("home_highlights")
  .select("*")
  .eq("status", "published")
  .or(`country.is.null,country.eq.EU,country.eq.${countryCode.toUpperCase()}`)
  .order("published_at", { ascending: false })
  .limit(6);

// Examples:
// User with country cookie "DE": sees null + EU + DE rows
// User with country cookie "FR": sees null + EU + FR rows
// User with country cookie "US": sees null + US rows (EU excludes non-EU)
```

### RLS policies — standard pattern

```sql
-- Enable RLS on every table that touches user data
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;

-- Public read of active offers
CREATE POLICY "anon_read_active_product_offers"
  ON product_offers FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Admin tables: service role only, no public policies
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- (no policy = service role only access)

-- updated_at trigger
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN new.updated_at = now(); RETURN new; END;
$$;

CREATE TRIGGER product_offers_updated_at
  BEFORE UPDATE ON product_offers
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
```

### Querying product_offers — common patterns

```ts
// Fetch single offer by id
const { data } = await admin
  .from("product_offers")
  .select("*")
  .eq("id", id)
  .maybeSingle();  // returns null if not found (not error)

// List with filters
let query = admin
  .from("product_offers")
  .select("*", { count: "exact" })
  .order("affiliate_priority_score", { ascending: false });

if (category) query = query.eq("category", category);
if (status)   query = query.eq("status", status);
if (search)   query = query.or(`provider_name.ilike.%${search}%,title.ilike.%${search}%`);

// Upsert (seed from static catalog)
await admin
  .from("product_offers")
  .upsert(rows, { onConflict: "id" });

// Partial update
await admin
  .from("product_offers")
  .update({ bullets, last_ai_enrichment_at: new Date().toISOString() })
  .eq("id", row.id);
```

### Financeads identification

Financeads offers can NOT be identified by `data_source` or `link_type` columns — DB constraints only allow `('static','admin','parser')` and `('affiliate_redirect','lead_capture','embedded_partner','informational')` respectively. Use:

```ts
// In Supabase queries:
.not("affiliate_link", "ilike", "%financeads.net%")
.not("id", "ilike", "financeads-%")

// For static catalog filtering:
offers.filter(o =>
  !o.affiliateLink?.includes("financeads.net") &&
  !o.id.startsWith("financeads-")
)
```

## Anti-patterns — DO NOT do these

```ts
// ❌ Inferring table name from TypeScript type
// Type: MarketplaceOffer → assuming table: marketplace_offers → WRONG
// Real table: product_offers

// ❌ Service role key in client component or public env var
"use client";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;  // never exposed client-side

// ❌ Migration without IF NOT EXISTS
ALTER TABLE product_offers ADD COLUMN bullets text[];
// Fails if column exists — migration cannot be safely re-run

// ❌ Country filter without EU broadcast
const { data } = await admin
  .from("home_highlights")
  .eq("country", countryCode);
// NL users with countryCode="NL" see nothing if content is tagged "EU"
// Fix: use .or("country.is.null,country.eq.EU,country.eq." + countryCode)

// ❌ PII in attributes JSONB
attributes: { email: "user@example.com", phone: "+49..." }
// Use proper user tables with RLS for PII, not the attributes catch-all

// ❌ No index on filterable columns
// After adding: WHERE last_ai_enrichment_at IS NULL
// Add: CREATE INDEX IF NOT EXISTS ... ON product_offers (last_ai_enrichment_at)

// ❌ .single() when row might not exist
const { data } = await admin.from("product_offers").eq("id", id).single();
// Throws error if not found → use .maybeSingle() which returns null
```

## Real bugs we've hit

**Bug: home_highlights EU broadcast excluded — NL users saw empty WhatsNew section**

- Root cause: the query used `.eq("country", countryCode)`. Content tagged with `country = 'EU'` was only returned for users with a "EU" country cookie (which doesn't exist in practice — users have "DE", "FR", "NL" etc.).
- Fix: changed to `.or("country.is.null,country.eq.EU,country.eq." + countryCode.toUpperCase())`.
- Impact: all users were missing EU-broadcast content (most highlights were EU-tagged).
- Lesson: always use the three-part OR pattern for country-filtered content.

**Bug: Migration written for `marketplace_offers` — real table is `product_offers` (PR 5, May 2026)**

- Root cause: TypeScript type `MarketplaceOffer` led to the assumption that the DB table was `marketplace_offers`. The actual Supabase table is `product_offers` (named differently by the project setup).
- Detection: Supabase returned "relation 'marketplace_offers' does not exist" error.
- Fix: find-replace across 12 source files + extra commit + re-deploy.
- Prevention: run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` before any schema work.

## Checklist before shipping

- [ ] Table name verified via `information_schema.tables` (not inferred from TypeScript)
- [ ] Migration uses `ADD COLUMN IF NOT EXISTS` (not bare `ADD COLUMN`)
- [ ] New indexes use `CREATE INDEX IF NOT EXISTS`
- [ ] Service role key only in server-side code (`createSupabaseAdminClient`)
- [ ] Country-filtered content uses the three-part `.or()` pattern (null + EU + specific)
- [ ] RLS enabled on all tables with user-visible data
- [ ] `touch_updated_at()` trigger added for tables with `updated_at` column
- [ ] Filterable columns have indexes
- [ ] Financeads exclusion uses `affiliate_link ILIKE %financeads.net%` (not `data_source`)
- [ ] `.maybeSingle()` used instead of `.single()` for lookups that might not find a row
