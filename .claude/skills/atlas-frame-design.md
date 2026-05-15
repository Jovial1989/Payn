# Atlas-Frame Design

## When to load this skill
- Any work on offer rendering, category pages (e.g. `/banking`, `/cards`, `/loans`)
- Building or editing browse UX, product listing, comparison UI
- Adding carousels, "top picks", ranking sections, or sorting labels
- Touching `AtlasGrid`, `OfferCardAtlas`, `OfferRowAtlas`, `dashboard-category-workspace.tsx`, `dashboard-cards-workspace.tsx`
- Reviewer asks "why does this page not show a winner?" or "where's the best pick?"

## TL;DR
- **Atlas = browse-first.** Show the inventory, withhold judgment. Let the user decide.
- **Never show ranking numbers** (#1, #2, #3) or "top picks" in Atlas UI — that's a compare-frame leak.
- **Words to avoid:** ranked, compare, best, top, sorted by relevance, winner, recommended.
- **Words to use:** available, options, browse, what's here, explore.
- `DecisionResultRow` is deleted. `OfferRowAtlas` is the only row component. Do not resurrect compare-frame components.

## The pattern

### Two frames — Atlas vs Compare

| Dimension | Atlas Frame | Compare Frame |
|-----------|-------------|---------------|
| Philosophy | "Here's what's available — you decide" | "Here's our ranking — #1 is best for you" |
| User state | Exploring, discovering | Ready to choose, wants a verdict |
| UI signals | Inventory list, equal-weight cards | #1 badge, "Best for X" banner, Score columns |
| Sorting | By coverage/availability | By rank/relevance |
| Copy tone | Neutral, descriptive | Opinionated, superlative |

**Payn adopted Atlas in March 2026 after finding compare-frame created false confidence** — users trusted "best" labels that were actually affiliate-priority scores, not objective analysis.

### Atlas components in this codebase

```tsx
// OfferCardAtlas — vertical card, 3-col grid — used on /explore/[bucket]
// OfferRowAtlas  — horizontal row, 1-per-row — used on /banking, /cards, /loans etc.

// AtlasGrid — the grid container on the /explore page:
<AtlasGrid locale={locale} country={country} buckets={ATLAS_BUCKETS} />

// SiteShell — wraps homepage + /explore/* (no sidebar, full-width Atlas)
// AppShell  — wraps legacy category pages with sidebar
```

### Atlas copy rules

```tsx
// ✅ Atlas copy
const t = {
  heading: "What's available in your area",
  subheading: "Browse the full range of options",
  cta: "See all options",
  exploreMore: "Explore more",
  goToProvider: "Go to provider",
};

// ❌ Compare-frame copy (banned)
const bad = {
  heading: "Top-ranked options for you",  // "ranked" — NO
  subheading: "Sorted by relevance",       // judgment — NO
  cta: "See best picks",                   // "best" — NO
  badge: "#1 Choice",                      // ranking — NO
};
```

### bestFor pill — the only allowed opinion signal

The `bestFor` pill on offer cards is the one permitted opinionated signal, because it comes from the provider (not Payn's internal ranking):

```tsx
{firstBestFor && (
  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-emerald-soft px-2.5 py-1 text-[10px] font-semibold text-accent-emerald-strong">
    <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" />
    {formatCopy(t.bestFor, { audience: firstBestFor })}
    {/* renders: "Best for Freelancers" — sourced from offer.bestFor[0] */}
  </div>
)}
```

This is provider-declared, not Payn-ranked — acceptable in Atlas frame.

### Filter panels — collapsible, never sorting

Atlas allows filtering (narrow by currency, amount, region) but NOT sorting by rank:

```tsx
// ✅ Atlas filter — narrows inventory
const [filtersOpen, setFiltersOpen] = useState(false);

<button onClick={() => setFiltersOpen((v) => !v)}>
  {t.refineResults}
  <ChevronIcon open={filtersOpen} />
</button>
{filtersOpen && (
  <div>
    {/* filter by amount, region, type — never "sort by relevance" */}
  </div>
)}
```

## Anti-patterns — DO NOT do these

```tsx
// ❌ Top-3 summary carousel — compare-frame leak
<section>
  <h2>Top 3 picks for you</h2>
  <div className="grid grid-cols-3">
    {topOffers.slice(0,3).map((o, i) => (
      <div>
        <span className="badge">#{i+1}</span>  {/* ranking number — banned */}
        <OfferCard offer={o} />
      </div>
    ))}
  </div>
</section>

// ❌ Compare checkbox — decision-frame UI
<label>
  <input type="checkbox" /> Compare
</label>

// ❌ "Save offer" CTA — implies Payn is arbitrating (compare-frame)
<button>⭐ Save offer</button>

// ❌ Sort label
<p className="text-ink-tertiary">Sorted by relevance</p>

// ❌ Score column in table
<td>{(offer.affiliatePriorityScore * 10).toFixed(1)} / 10</td>
```

## Real bugs we've hit

**Bug: "/cards top-3 summary row" compare-frame leak (PR 4)**
- Root cause: an earlier commit had a `<div className="top-picks-row">` left over from the compare-frame era above the `OfferRowAtlas` list on the `/cards` route.
- Detection: code review before deploy noticed `"top 3"` string in JSX.
- Fix: required a separate cleanup commit (PR 4 Commit 6) to remove it. Had to audit all 23 category routes in `dashboard-category-workspace.tsx` and the `/cards` route in `dashboard-cards-workspace.tsx` separately.
- Lesson: when migrating from compare → Atlas, search for "top", "ranked", "sorted", "#1", "best pick" string literals across all templates.

**Bug: "How ranking works" section surfaced under Atlas offers**
- The `DecisionResultRow` component imported a `translateTradeoff` / `getOfferTradeoff` helper that appended a "How ranking works" accordion below the offer list. This is pure compare-frame UI.
- Fix: removed the import and JSX in PR 4 Commit 6 across both workspace files.
- Lesson: deleting a compare-frame component (`DecisionResultRow`) isn't enough if its *helpers* are still imported in consuming files.

## Checklist before shipping

- [ ] No string literals containing "ranked", "best pick", "top", "sorted by relevance", "#1"
- [ ] No rank number badges (#1, #2, #3) on cards or rows
- [ ] No "Compare" checkbox or "Save offer" star UI
- [ ] bestFor pill reads from `offer.bestFor[0]` (provider-declared), not from score
- [ ] Filter panels collapse by default (`filtersOpen = false`)
- [ ] Offer list uses `OfferRowAtlas` (rows) or `OfferCardAtlas` (cards), never `DecisionResultRow` (deleted)
- [ ] `AtlasGrid` used on `/explore/*` routes, not legacy workspace components
- [ ] New category routes added to `dashboard-category-workspace.tsx` `HANDLED_ROUTES` set, not a new compare-frame page
- [ ] Copy reviewed against Atlas word list (no judgment words)
