# Provider Card Patterns

## When to load this skill
- Working with offer cards anywhere in the UI
- Editing `/explore/[bucket]`, `/banking`, `/cards`, `/loans`, `/insurance` or any category route
- Touching `OfferCardAtlas`, `OfferRowAtlas`, `offer-card-atlas.tsx`, `offer-row-atlas.tsx`
- Adding a new field to `MarketplaceOffer` type that needs to render visually
- Implementing logo display, provider branding, metric cells

## TL;DR
- **Two variants:** `OfferCardAtlas` (vertical, 3-col grid) for `/explore/[bucket]`; `OfferRowAtlas` (horizontal, 1-per-row) for all legacy category routes.
- **Always filter COUNTRIES metric** — `offer.metrics.filter(m => !/countr/i.test(m.label))`. The country picker already filters; showing it again is redundant.
- **Max 4 metrics shown**, max 5 bullets shown — truncate with `.slice(0, 4)`.
- **Logo → initials fallback** via `getProviderLogoPath()` — never show a broken `<img>`.
- **No ranking numbers, no compare checkboxes, no save stars** — Atlas frame only.

## The pattern

### The two card variants

```
OfferCardAtlas (vertical)          OfferRowAtlas (horizontal)
─────────────────────────          ──────────────────────────
┌─────────────────────┐            ┌────┬──────────────┬────────────────┬───────┐
│ [logo] Provider · Cat│            │logo│ Title        │ Metric Metric  │  CTA  │
│ ──────────────────── │            │    │ Provider·Cat │ Metric Metric  │       │
│ Best for Freelancers │            │    │ [bestFor]    │                │       │
│                      │            └────┴──────────────┴────────────────┴───────┘
│ • Bullet 1           │            [mobile: metrics + bullets below border-t]
│ • Bullet 2           │
│                      │            File: features/marketplace/offer-row-atlas.tsx
│ APR      Fee         │            Used: dashboard-category-workspace.tsx
│ 5.9%     €0/mo       │                  dashboard-cards-workspace.tsx
│                      │
│ [Go to provider →]   │            File: features/explore/offer-card-atlas.tsx
└─────────────────────┘            Used: /explore/[bucket] page
```

### Logo handling

```tsx
import { getProviderLogoPath } from "@/features/catalog/provider-logo";

const logoPath = getProviderLogoPath(offer.providerName);

// In both OfferCardAtlas and OfferRowAtlas:
{logoPath ? (
  <Image
    src={logoPath}
    alt={offer.providerName}
    width={36}
    height={36}
    className="h-9 w-9 object-contain"
  />
) : (
  // Initials fallback — always shows something
  <span className="text-[13px] font-extrabold text-accent-emerald-strong">
    {offer.providerMark.slice(0, 2).toUpperCase()}
  </span>
)}
```

Logo container sizes:
- `OfferRowAtlas`: `h-12 w-12 rounded-[12px] bg-accent-emerald-soft`
- `OfferCardAtlas`: `h-12 w-12 rounded-[12px] bg-accent-emerald-soft` (same)

### Metric filtering — always skip COUNTRIES

```tsx
// Filter applied at top of render in BOTH components
const isCountryMetric = (label: string) => /countr/i.test(label);
const visibleMetrics = offer.metrics
  .filter((m) => !isCountryMetric(m.label))
  .slice(0, 4);

// Why: the country selector at the top of every page already filters offers
// by country. Showing "Countries: DE, FR, ES" in the card is redundant noise.
```

### Bullets list (PR 5 — AI-enriched)

```tsx
// offer.bullets is optional — guard before rendering
const bullets = offer.bullets?.filter(Boolean).slice(0, 4) ?? [];

// OfferCardAtlas — below bestFor pill, above metrics grid
{bullets.length > 0 && (
  <ul className="mb-3 grid gap-1">
    {bullets.map((b) => (
      <li key={b} className="flex items-start gap-2 text-[12px] text-ink-secondary">
        <span className="mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
        {b}
      </li>
    ))}
  </ul>
)}

// OfferRowAtlas — desktop: inline with metrics; mobile: below border-t section
// Desktop (hidden md:flex center column):
{bullets.length > 0 && (
  <ul className="grid min-w-0 flex-1 gap-0.5">
    {bullets.map((b) => (
      <li key={b} className="flex items-start gap-1.5 truncate text-[11px] text-ink-secondary">
        <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
        <span className="truncate">{b}</span>
      </li>
    ))}
  </ul>
)}
```

### bestFor pill

```tsx
const firstBestFor = offer.bestFor?.[0];

{firstBestFor && (
  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-emerald-soft px-2.5 py-1 text-[10px] font-semibold text-accent-emerald-strong">
    <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
    {formatCopy(t.bestFor, { audience: firstBestFor })}
    {/* e.g. "Best for Freelancers" */}
  </div>
)}
```

### Metric cells

```tsx
// OfferCardAtlas — 2-col grid
<div className="grid grid-cols-2 gap-x-4 gap-y-3">
  {visibleMetrics.map((m) => (
    <div key={m.label} className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        {m.label}
      </p>
      <p className="mt-0.5 text-[16px] font-bold tabular-nums leading-tight text-ink">
        {m.value}
      </p>
    </div>
  ))}
</div>

// OfferRowAtlas mobile — 2-col grid in border-t section
<div className="grid grid-cols-2 gap-3">
  {visibleMetrics.map((m) => (
    <div key={m.label}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        {m.label}
      </p>
      <p className="mt-0.5 text-[13px] font-bold tabular-nums text-ink">{m.value}</p>
    </div>
  ))}
</div>
```

### CTA buttons

```tsx
// OfferCardAtlas — full-width at card bottom
<a
  href={offer.affiliateLink || offer.providerWebsiteUrl}
  target="_blank"
  rel="noopener noreferrer sponsored"
  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-emerald py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-emerald-strong"
>
  {t.goToProvider}
  <ArrowSvg />
</a>

// OfferRowAtlas — compact inline pill, right-aligned
<a
  href={href}
  target="_blank"
  rel="noopener noreferrer sponsored"
  className="flex items-center gap-1.5 rounded-xl bg-accent-emerald px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-emerald-strong sm:px-5 sm:py-2.5 sm:text-[14px]"
>
  <span className="hidden sm:inline">{t.goToProvider}</span>
  <span className="sm:hidden">Go</span>
  <ArrowSvg />
</a>
```

### Grid containers

```tsx
// OfferCardAtlas grid (on /explore/[bucket])
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {offers.map((o) => <OfferCardAtlas key={o.id} offer={o} locale={locale} />)}
</div>

// OfferRowAtlas list (on category pages)
<div className="flex flex-col gap-3 sm:gap-4">
  {offers.map((o) => <OfferRowAtlas key={o.id} offer={o} locale={locale} />)}
</div>
```

### Motion variants (both components)

```tsx
// OfferCardAtlas
const cardVariants = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(15,23,32,0.06)", borderColor: "rgba(17,24,39,0.08)" },
  hover: { y: -3, boxShadow: "0 8px 24px -8px rgba(16,185,129,0.20)", borderColor: "#10B981" },
};
const logoVariants = { rest: { scale: 1 }, hover: { scale: 1.05 } };

// OfferRowAtlas
const rowVariants = {
  rest:  { y: 0,  borderColor: "rgba(17,24,39,0.08)" },
  hover: { y: -1, borderColor: "rgba(16,185,129,0.4)" },
};
```

## Anti-patterns — DO NOT do these

```tsx
// ❌ Ranking numbers — Atlas frame violation
<span className="rank-badge">#1</span>
<p className="text-accent-emerald">Best overall</p>

// ❌ Duplicate provider name (old DecisionResultRow anti-pattern)
<p className="text-sm text-ink-tertiary">{offer.providerName}</p>  {/* left side */}
<p className="text-2xl font-bold">{offer.providerName}</p>         {/* right side — redundant */}

// ❌ Compare-frame actions
<input type="checkbox" /> Compare
<button>⭐ Save offer</button>

// ❌ Showing COUNTRIES metric
// offer.metrics might contain { label: "Countries", value: "DE, FR, ES, IT, PT, EU" }
// This is redundant — the page-level country picker already filters
visibleMetrics = offer.metrics.slice(0, 4)  // wrong: no country filter

// ❌ Broken image without fallback
<img src={logoPath} />  // throws if logoPath is null

// ❌ Not slicing bullets/metrics
{offer.bullets?.map(b => <li>{b}</li>)}  // could render 20+ items
```

## Real bugs we've hit

**Bug: DecisionResultRow showed provider name twice (pre-PR 4)**
- The old `DecisionResultRow` component had `offer.providerName` in a small grey caption on the left AND in large bold text as the main title. Confusing and wasteful.
- Fix: `OfferRowAtlas` shows provider name once in the subtitle `{offer.providerName} · {category}` and the product title separately.

**Bug: COUNTRIES metric appeared in offer cards**
- Some offers in the static catalog have a `{ label: "Countries", value: "DE, FR, ES" }` metric.
- This appeared in the 2-col metric grid until we added the `/countr/i` filter.
- Fix added to both `OfferCardAtlas` and `OfferRowAtlas` in PR 5 Commit 7.

**Bug: Bullets undefined crash on old offers**
- `offer.bullets` is optional (added in PR 5). Early renders before the migration ran hit `offer.bullets.map(...)` → TypeError.
- Fix: always guard with `offer.bullets?.filter(Boolean).slice(0, 4) ?? []`.

## Checklist before shipping

- [ ] COUNTRIES metric filtered with `/countr/i` test before `.slice(0, 4)`
- [ ] Bullets guarded with `?.filter(Boolean).slice(0, N) ?? []`
- [ ] Logo uses `getProviderLogoPath()` with initials fallback (never bare `<img>`)
- [ ] CTA uses `offer.affiliateLink || offer.providerWebsiteUrl` (not just one)
- [ ] `rel="noopener noreferrer sponsored"` on all affiliate CTAs
- [ ] `useReducedMotion()` gate on all motion variants
- [ ] Both card and row use `offer.bestFor?.[0]` (not `[1]` or full array)
- [ ] Row layout: `hidden md:flex` for center metrics column (not `md:hidden`)
- [ ] `key={offer.id}` on list items (not index)
- [ ] No ranking numbers, compare checkboxes, or save stars
