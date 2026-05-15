# Admin Tools Patterns

## When to load this skill
- Any work in `apps/web/src/app/admin/**`
- Building internal tools, AI integrations, backend jobs triggered from UI
- Touching `AdminEnrichmentControls`, `AdminParserControls`, `lib/gemini-enrich.ts`
- Adding new admin API routes under `/api/admin/**` or `/api/v1/admin/**`
- Long-running server jobs (parser, enrichment, bulk operations)
- Supabase batch operations on `product_offers` table

## TL;DR
- **Admin auth:** `x-admin-token` header + `checkAdminToken()` for `/api/admin/*`; middleware covers `/api/v1/admin/*`. Always verify 401 on bad token.
- **AI calls:** direct Gemini REST, no SDK. Use `gemini-2.5-flash`, `responseMimeType: "application/json"`, temperature 0.2–0.3 for structured extraction.
- **Rate limit every LLM loop:** 200ms sleep between calls. Hard cap at 500 offers max.
- **Never overwrite human-edited fields by default.** Fill-empty mode first; `?force=true` to override.
- **Track AI enrichment:** `last_ai_enrichment_at` + `last_human_review_at` columns. Show amber banner in UI when AI ran but human hasn't reviewed.

## The pattern

### Admin auth — two systems

```ts
// System 1: /api/v1/admin/** — protected by middleware.ts
// Middleware checks Supabase session or admin session cookie.
// No extra auth needed in route handlers.
export async function GET(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  // middleware already verified the request
}

// System 2: /api/admin/** — NOT in middleware scope
// Must call checkAdminToken() manually:
import { checkAdminToken } from "@/lib/admin-api-auth";

export async function POST(request: NextRequest) {
  const authError = checkAdminToken(request);
  if (authError) return authError;  // returns NextResponse with status 401
  // proceed with handler
}

// Client-side token:
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";
// Pass as header:
fetch("/api/admin/enrich-offers", {
  method: "POST",
  headers: { "x-admin-token": ADMIN_TOKEN },
});
```

### Gemini REST integration pattern

```ts
// lib/gemini-enrich.ts — the established pattern
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const res = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,        // low = deterministic extraction
      maxOutputTokens: 512,    // keep responses tight
      responseMimeType: "application/json",  // structured output
    },
  }),
});

// Parse response:
const data = await res.json();
const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
const parsed = JSON.parse(raw);

// Temperature guide:
// 0.1–0.3  → structured extraction, JSON, classification
// 0.4–0.6  → summarization, rewriting
// 0.7–0.9  → creative, varied outputs
```

### Bulk job pattern — with rate limiting and cap

```ts
// api/admin/enrich-offers/route.ts — the established template
const MAX_OFFERS = 500;    // hard billing safeguard
const SLEEP_MS = 200;      // rate limit between LLM calls

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: NextRequest) {
  const authError = checkAdminToken(request);
  if (authError) return authError;

  const force = request.nextUrl.searchParams.get("force") === "true";
  const startMs = Date.now();

  // Fetch eligible rows — always include a hard limit
  const { data: rows } = await admin
    .from("product_offers")
    .select("id, title, ...")
    .not("affiliate_link", "ilike", "%financeads.net%")  // exclude third-party
    .limit(MAX_OFFERS);                                   // hard cap

  let enriched = 0, skipped = 0, failed = 0;

  for (const row of rows ?? []) {
    // Skip if already has data (unless force mode)
    if (!force && hasAllRequiredFields(row)) {
      skipped++;
      continue;
    }

    try {
      const result = await callGemini(row);
      await updateRow(row.id, result);
      enriched++;
    } catch {
      failed++;
    }

    await sleep(SLEEP_MS);  // rate limit — never skip this
  }

  return NextResponse.json({
    totalEligible: rows?.length ?? 0,
    enriched,
    skipped,
    failed,
    durationMs: Date.now() - startMs,
  });
}
```

### AI enrichment tracking — columns + UI pattern

**Database columns (product_offers table):**
```sql
last_ai_enrichment_at  timestamptz  -- when Gemini last ran on this row
last_human_review_at   timestamptz  -- when admin last saved the form
```

**Fill-empty logic:**
```ts
// Only write AI results into empty fields
const update: Record<string, unknown> = {
  last_ai_enrichment_at: new Date().toISOString(),
};

if (result.bullets?.length && (!hasBullets || force)) {
  update.bullets = result.bullets;
}
if (result.bestFor?.length && (!hasBestFor || force)) {
  update.best_for = result.bestFor;
}
// Human-edited fields are preserved unless force=true
```

**Amber review banner (admin-offer-full-form.tsx):**
```tsx
const needsReview =
  isEdit &&
  offer.last_ai_enrichment_at &&
  (!offer.last_human_review_at ||
    new Date(offer.last_human_review_at) < new Date(offer.last_ai_enrichment_at));

{needsReview && (
  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    <InfoIcon />
    <span>
      AI-enriched on <strong>{offer.last_ai_enrichment_at.slice(0, 10)}</strong> —
      please review bullets, best_for, and metrics, then save to mark as human-reviewed.
    </span>
  </div>
)}
```

**Auto-stamp on save:**
```ts
// admin-offer-full-form.tsx — handleSubmit
const payload = {
  ...form,
  last_human_review_at: new Date().toISOString(),  // stamp every save
};
```

### Admin client component pattern

```tsx
"use client";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";

export function AdminEnrichmentControls() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [force, setForce] = useState(false);

  async function handleRun() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/enrich-offers${force ? "?force=true" : ""}`,
        { method: "POST", headers: { "x-admin-token": ADMIN_TOKEN } },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }
  // ...
}
```

### Financeads exclusion pattern

Financeads offers must be excluded from AI enrichment. They cannot be identified by `data_source` or `link_type` (DB constraints don't allow 'financeads' value in those columns). Use:

```ts
// In Supabase queries:
.not("affiliate_link", "ilike", "%financeads.net%")
.not("id", "ilike", "financeads-%")

// In-memory filter (for static catalog):
offers.filter(o =>
  !o.affiliateLink?.includes("financeads.net") &&
  !o.id.startsWith("financeads-")
)
```

## Anti-patterns — DO NOT do these

```ts
// ❌ LLM loop with no rate limiting
for (const offer of offers) {
  await callGemini(offer);  // no sleep — hits rate limits, costs spike
}

// ❌ No hard cap on iterations
const { data: rows } = await admin.from("product_offers").select("*");
// → could be 10,000 rows, running Gemini on all of them

// ❌ Overwriting human-edited fields by default
update.best_for = result.bestFor;  // always overwrites — loses human edits

// ❌ No tracking of AI-touched records
await admin.from("product_offers").update({ bullets: result.bullets }).eq("id", id);
// → no timestamp → impossible to audit which records need human review

// ❌ Synchronous endpoint for long jobs (>10s)
export async function POST() {
  for (const offer of allOffers) {  // 500 offers × 0.2s sleep = 100s
    await sleep(200);
    await enrichOffer(offer);
  }
  return NextResponse.json({ ok: true });  // times out before finishing
}
// Fix: stream NDJSON, or fire-and-forget + poll status endpoint

// ❌ Missing checkAdminToken on /api/admin/* routes
export async function POST(request: NextRequest) {
  // no auth check → anyone can trigger Gemini calls and run up the bill
  const admin = createSupabaseAdminClient();
}

// ❌ Inferring table name from TypeScript type
// MarketplaceOffer type → assuming table is "marketplace_offers"
// Real table name: product_offers
```

## Real bugs we've hit

**Bug: Wrong table name throughout PR 5 — marketplace_offers vs product_offers (May 2026)**

- Root cause: The TypeScript type is named `MarketplaceOffer`, so the assumption was that the DB table was `marketplace_offers`. The actual Supabase table created by the DBA was `product_offers`.
- Scope: All 4 new files created in PR 5 referenced the wrong table, plus 8 pre-existing files also had the wrong name.
- Detection: Supabase returned "relation 'marketplace_offers' does not exist" on first query.
- Fix: `find-replace marketplace_offers → product_offers` across 12 source files. Extra commit + deploy.
- Cost: one additional commit and ~3 min deploy cycle.
- Lesson: **never infer DB table names from TypeScript type names.** Always run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` or check Supabase dashboard before writing any migration or `.from()` call.

## Checklist before shipping

- [ ] New `/api/admin/*` route has `checkAdminToken(request)` as first statement
- [ ] Verified 401 with wrong token: `curl -X POST /api/admin/new-route -H "x-admin-token: wrong"`
- [ ] LLM loop has `await sleep(200)` between iterations
- [ ] Hard limit set (e.g. `.limit(500)`) before fetching rows to process
- [ ] Fill-empty mode is default; force mode requires `?force=true`
- [ ] `last_ai_enrichment_at` stamped on every AI-processed row
- [ ] Admin form saves `last_human_review_at` on every submit
- [ ] Financeads excluded via `.not("affiliate_link", "ilike", "%financeads.net%")`
- [ ] Table name verified against Supabase schema before writing `.from()` calls
- [ ] Client component uses `NEXT_PUBLIC_ADMIN_API_TOKEN` env var, not hardcoded string
