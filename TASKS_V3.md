# Payn — TASKS_V3.md

> Generated per Step 0 of `PAYN_REFACTOR_BRIEF_V3.md`. Tickets numbered from
> TASK-301 onwards as instructed (V1 brief asked TASK-001+, but no
> `TASKS.md` was committed at the time — those completed tasks live in the
> session task tracker as P*/RESP*/CAT*/BUG*/UX*/MOB*/WEB* IDs). This file
> is the single canonical backlog from V3 onwards.
>
> Wait for "go" before any code changes (per brief Step 0 §5). Each PR
> covers 2–4 closely-coupled tickets unless flagged otherwise.

---

## Conflicts vs. existing code (read before approving)

These are work items where the V3 brief expects a state that the repo
does NOT match. Calling them out so the order of tickets makes sense.

1. **Old category labels were never replaced.** `apps/web/src/lib/i18n.ts`
   still emits `"Savings & Deposits"`, `"Transfers & Exchange"`,
   `"Loans & BNPL"`, `"Family & Kids"` in every locale. Mobile mirrors
   these via `app_localizations_ext.dart` + `explore_screen.dart`. V1
   asked for plain-English labels; that work never landed. TASK-302 is
   the foundation — every other label/copy ticket depends on it.

2. **Sidebar still nested.** `apps/web/src/components/app-shell.tsx`
   keeps `CollapsibleBucketGroup` with children per bucket. V1 asked
   for a flat 9-item sidebar. TASK-303.

3. **`/i-want-to/*` routes still live.** 8 dirs under
   `apps/web/src/app/i-want-to/` (big-purchase, family, get-protected,
   grow-money, run-business, send-money, switch-bank, travel). V1 said
   delete + redirect; they were instead built out in UX.3. TASK-310
   resolves this — but it's a destructive change worth flagging.

4. **`SUB_CATEGORIES` taxonomy from V1 was never centralised.** Some
   chips exist per-bucket via `bucket-workspace.tsx` but the V1-mandated
   single source of truth at `lib/categories.ts` does not exist.
   TASK-304 creates it.

5. **Three offer-card variants exist.** Web has `OfferCard` + 
   `OfferRowAtlas`; mobile has `OfferRow`. V1 asked for ONE per
   platform with optional `hero` variant. Out of scope for V3 unless
   the brief explicitly wants it now — flagging only.

6. **Compare ribbon style.** V3 §4.3 says current black ribbon is
   jarring vs mint palette. We touched it recently (MOB.10 / WEB.4)
   but kept the dark ink colour. TASK-326 changes the palette.

---

## Suggested PR groupings

| PR | Tickets | Why grouped |
|---|---|---|
| **PR-V3-01** | TASK-301 | Audit-only, no code, gates the rest |
| **PR-V3-02** | TASK-302, TASK-303, TASK-304 | Foundational label + sidebar rename |
| **PR-V3-03** | TASK-305 | Category descriptions (needs PR-V3-02) |
| **PR-V3-04** | TASK-306, TASK-307, TASK-308 | Compare table bugs |
| **PR-V3-05** | TASK-309 | App Profile Interests state |
| **PR-V3-06** | TASK-310, TASK-311, TASK-312 | Saved/Recently-viewed cleanup |
| **PR-V3-07** | TASK-313, TASK-314 | App + web Investments demote |
| **PR-V3-08** | TASK-315, TASK-316 | Crypto jargon + splash tagline |
| **PR-V3-09** | TASK-317, TASK-318, TASK-319 | Template-text & internal-copy leaks |
| **PR-V3-10** | TASK-320, TASK-321 | Inline Y-axis + filter band review |
| **PR-V3-11** | TASK-322, TASK-323 | Copy simplification + Compare column rename |
| **PR-V3-12** | TASK-324 | Inline jargon definitions (single feature) |
| **PR-V3-13** | TASK-325, TASK-326, TASK-327 | Home hero + chip + Compare-ribbon visuals |
| **PR-V3-14** | TASK-328, TASK-329, TASK-330 | Bookmark icon + sub-chip state + empty filter |
| **PR-V3-15** | TASK-331 | "What you'd save" calculator (one big feature) |
| **PR-V3-16** | TASK-332 | "Tell me when this changes" alerts |
| **PR-V3-17** | TASK-333 | Country detection prompt |
| **PR-V3-18** | TASK-334, TASK-335 | Why #1 tooltip + personal scoreboard |
| **PR-V3-19** | TASK-336 | Onboarding 3-question quiz |
| **PR-V3-20** | TASK-337, TASK-338 | Switch walkthrough + bundles |
| **PR-V3-21** | TASK-339, TASK-340 | Smart anti-rec + glossary surface |
| **PR-V3-22** | TASK-341 | Tone audit grep + rewrite (must ship before launch) |

---

## Backlog

### TASK-301 [P0] · Audit current state vs V1 + V3 expectations
**Platform:** both
**Files affected:** (read-only) `apps/web/src/lib/i18n.ts`,
`apps/web/src/components/app-shell.tsx`,
`apps/web/src/features/catalog/outcomes.ts`,
`apps/mobile/lib/core/localization/app_localizations_ext.dart`,
`apps/mobile/lib/features/explore/presentation/explore_screen.dart`,
`apps/web/src/app/i-want-to/*`,
`apps/web/src/components/comparison-table.tsx`,
`apps/mobile/lib/features/compare/presentation/compare_screen.dart`
**Why:** Confirm exactly which V1 deliverables landed vs. shipped vs. drifted, so subsequent tickets know what they're modifying.
**What to do:**
1. Run a structured grep for every red-flag phrase in V3 §6 + every old label in V3 §1.1 → produce a one-page audit table to `docs/V3_AUDIT.md`.
2. Tag each finding (web / app / both) + (label / description / copy / structure / behaviour).
3. Identify which existing files own each category label so TASK-302 can plan the rename surgically.
4. No code changes outside `docs/V3_AUDIT.md`.
**Acceptance criteria:**
- [ ] `docs/V3_AUDIT.md` exists, lists every file containing one of: `Savings & Deposits`, `Transfers & Exchange`, `Loans & BNPL`, `Family & Kids`, `Banking` as label, `Investments` as label, `overpaying`, `your bank charges`, `hidden fees`, `quietly`, `rip off`, `predatory`
- [ ] Each row has: platform, file path, line, old text, proposed new text
- [ ] Sidebar nesting audit: list every nested child still in code
- [ ] `/i-want-to/*` audit: list every file under that route + every link pointing to it
**Depends on:** none
**Effort:** S

---

### TASK-302 [P0] · Centralise category labels + slugs (`lib/categories.ts` + Dart equivalent)
**Platform:** both
**Files affected:**
- `apps/web/src/lib/categories.ts` (new)
- `apps/web/src/lib/i18n.ts` (update bucket entries in every locale)
- `apps/web/src/features/catalog/outcomes.ts`
- `packages/types/src/marketplace.ts` (if labels are exported from shared types)
- `apps/mobile/lib/core/localization/app_localizations_ext.dart`
- `apps/mobile/lib/features/explore/presentation/explore_screen.dart`
- `apps/mobile/lib/l10n/*.arb` (all 6 locales)
**Why:** Every other label/copy/structure ticket depends on a single source of truth. V1 mandated it; it doesn't exist.
**What to do:**
1. Create `apps/web/src/lib/categories.ts` exporting `CATEGORIES` (per V1 §B) with `{ id, slug, label, icon }` for the 9 canonical categories.
2. Add `CATEGORY_REDIRECTS` map (per V1 step 2) — drives the 301s in TASK-310.
3. Update every i18n locale: replace the 5 old labels with new English (and locale equivalents per V1 step 3 for de/es/fr/it/pt — research natural translations, no word-for-word).
4. Mobile: emit equivalent constants in `core/constants/categories.dart` + update `app_localizations_ext.dart` to consume it.
5. Run a final grep to ensure zero production hits for the 5 old labels.
**Acceptance criteria:**
- [ ] `apps/web/src/lib/categories.ts` exists, is the ONLY place labels live
- [ ] All 6 web locales updated with new labels (en/de/es/fr/it/pt)
- [ ] Mobile shows identical labels on Explore chips + filter sheet + profile interests
- [ ] `grep -rn "Savings & Deposits\|Transfers & Exchange\|Loans & BNPL\|Family & Kids" --include="*.ts" --include="*.tsx" --include="*.dart"` returns 0 matches in production code (redirect maps + tests OK)
- [ ] `next build` + `flutter analyze` clean
**Depends on:** TASK-301
**Effort:** L

---

### TASK-303 [P0] · Flatten web sidebar (kill nested bucket groups)
**Platform:** web
**Files affected:**
- `apps/web/src/components/app-shell.tsx` (replace `CollapsibleBucketGroup` with `SidebarLink` per category)
- `apps/web/src/components/sidebar/*` (if it exists as separate file)
**Why:** V1 mandated flat 9-item sidebar; V3 §1.1 confirms it didn't ship. The nesting on Investments / Cards / Banking is now actively confusing because their pages already use chip filters for the same sub-categories.
**What to do:**
1. Replace expandable group rendering with one `SidebarLink` per category from `CATEGORIES`.
2. Drop chevron + animation. Active = filled mint bg.
3. On `/explore/<category>` the chips (TASK-304-style row) carry sub-navigation.
4. Mobile drawer mirrors the desktop sidebar.
**Acceptance criteria:**
- [ ] Sidebar shows exactly 9 items in this order: Cards / Saving / Sending money / Bank accounts / Investing / Borrowing / For business / Family / Insurance
- [ ] No expand/collapse on any item
- [ ] Mobile drawer same flat list
- [ ] Lighthouse CLS not regressed (the change is structural — verify)
**Depends on:** TASK-302
**Effort:** M

---

### TASK-304 [P0] · Centralise SUB_CATEGORIES taxonomy + reuse on category page
**Platform:** both
**Files affected:**
- `apps/web/src/lib/categories.ts` (add SUB_CATEGORIES per V1 §D)
- `apps/web/src/features/explore/bucket-workspace.tsx` (consume SUB_CATEGORIES, drop hardcoded chip arrays)
- `apps/mobile/lib/shared/constants/sub_categories.dart` (new)
- Mobile explore filter sheet
**Why:** V1 §D defines a 9-bucket taxonomy that should drive both platforms' chip rows. Currently only web Cards page has the chips; other categories diverge.
**What to do:**
1. Export `SUB_CATEGORIES` map (per V1 spec exactly).
2. Web: `bucket-workspace.tsx` consumes the map — every category gets identical chip-row contract.
3. Mobile: filter sheet bottom-sheet reads the same constants.
4. Order: `All` always first.
**Acceptance criteria:**
- [ ] All 9 categories have a sub-category chip row on web AND mobile filter sheet
- [ ] Plain-English labels (no `bnpl`, no `remittance`) — match V1 §D exactly
- [ ] Same map drives both platforms
**Depends on:** TASK-302
**Effort:** M

---

### TASK-305 [P0] · Rewrite category descriptions in plain English (per V3 §1.3)
**Platform:** both
**Files affected:**
- `apps/web/src/lib/i18n.ts` (description fields)
- `apps/web/src/lib/categories.ts` (description default)
- Mobile equivalents in `app_localizations_ext.dart` + `.arb` files
**Why:** Current descriptions still ship jargon ("Brokers, ETFs, crypto, robo-advisors"). V3 §1.3 gives explicit rewrites in a table.
**What to do:**
1. Replace each description per V3 §1.3 table (9 categories) for `en`.
2. Translate naturally for de/es/fr/it/pt (use existing translation pattern from TASK-302).
3. Wire mobile via shared map.
**Acceptance criteria:**
- [ ] Web + app show identical category descriptions (per platform locale)
- [ ] No jargon term from V3 §1.3 left in production code (`grep`-clean for: brokers, ETFs, BNPL, remittance, robo-advisors, neobanks)
**Depends on:** TASK-302
**Effort:** S

---

### TASK-306 [P0] · Compare table — Tradeoff must be product-specific, not template
**Platform:** both
**Files affected:**
- Mobile: `apps/mobile/lib/shared/services/local_marketplace_repository.dart` (`tradeoffFor`)
- Mobile: `apps/mobile/lib/features/compare/presentation/compare_screen.dart`
- Web: `apps/web/src/components/comparison-table.tsx` + `product-compare-table.tsx`
- Catalog data files (audit + populate per-offer `tradeoff` field)
**Why:** V3 §2.1 — both Revolut cards in Compare show the same Tradeoff string. The template fallback is leaking through.
**What to do:**
1. Add a per-offer `tradeoff` text field to `PaynOffer` / `MarketplaceOffer` data (mobile + web shared types).
2. Backfill in catalog data files — one factual, distinctive sentence per offer.
3. If two offers in the Compare set have identical tradeoff strings → suppress the Tradeoff row entirely (per V3).
4. Remove the category-level templated fallback from `tradeoffFor`.
**Acceptance criteria:**
- [ ] No two products in a Compare set ever show the same Tradeoff text
- [ ] Tradeoff row is hidden when all picks share the same text
- [ ] All catalog offers have a non-templated `tradeoff` field
**Depends on:** TASK-301
**Effort:** L

---

### TASK-307 [P0] · Compare table — replace em-dash with explicit "Not offered" / "Free" / "0%"
**Platform:** both
**Files affected:**
- Mobile: `compare_screen.dart` (`_Row` widget)
- Web: `comparison-table.tsx`, `product-compare-table.tsx`
**Why:** V3 §2.2 — em-dash is ambiguous. User can't tell if cell means "not offered", "zero", "unknown", "not applicable".
**What to do:**
1. Introduce a `MetricCell` type with `{ value: string; kind: 'has' | 'free' | 'zero' | 'not_offered' | 'not_applicable' | 'unknown' }`.
2. Render explicit copy per kind (not em-dash).
3. Add tap (mobile) / hover (web) tooltip explaining why a cell is "not offered".
4. If kind=`unknown` → suppress the row entirely (rather than show "Check with provider" link — keep tighter).
**Acceptance criteria:**
- [ ] No em-dash visible in any Compare cell
- [ ] Each empty cell has explicit text + tooltip
- [ ] Tooltip copy reviewed by tone audit (TASK-341)
**Depends on:** TASK-306
**Effort:** M

---

### TASK-308 [P0] · Compare — one "Best" indicator, not two
**Platform:** both
**Files affected:**
- Mobile: `compare_screen.dart` (top "Best option" banner + inline `★ BEST` badge)
- Web: `comparison-table.tsx` / `product-compare-table.tsx`
**Why:** V3 §2.3 — current Compare shows BOTH a top banner AND an inline ★ BEST badge in the column header. Redundant; brief recommends Option A (keep banner, drop inline badge).
**What to do:**
1. Mobile: remove the inline `★ BEST` chip from `_HeaderRow` (compare_screen.dart); keep the green column highlight + top banner with Apply CTA.
2. Web: do the equivalent in the comparison table component.
3. Verify on a 3-offer compare that the visual hierarchy still reads "this one wins" without the badge.
**Acceptance criteria:**
- [ ] Only ONE "best" indicator visible per Compare view (the top banner)
- [ ] Winning column still highlighted via column tint + green border
- [ ] No `★ BEST` / `★ Best` text rendered inline
**Depends on:** none
**Effort:** S

---

### TASK-309 [P0] · App Profile — Interests chips need clear selected state + immediate save
**Platform:** app
**Files affected:**
- `apps/mobile/lib/features/profile/presentation/profile_screen.dart`
- `apps/mobile/lib/shared/services/app_controller.dart` (interests persistence)
**Why:** V3 §2.4 — chips all look identical, user can't tell which are saved or whether tap does anything.
**What to do:**
1. Tap toggles a per-chip `selected` flag; persist immediately to local storage.
2. Selected: emerald-filled bg + white text + leading checkmark; unselected: outlined.
3. Add explainer line above the chip row: "Tap topics you care about. We'll show those first."
4. After a tap, brief 220ms scale-bounce so the action is felt (NOT a full toast).
**Acceptance criteria:**
- [ ] Each chip has a visually distinct selected state (not just colour shift)
- [ ] Tap-to-toggle persists across app restart
- [ ] Explainer line visible
- [ ] No "Save" button needed (state is auto-saved)
**Depends on:** TASK-302 (label names must be plain-English already)
**Effort:** M

---

### TASK-310 [P0] · Delete `/i-want-to/*` routes + 301-redirect to filtered Explore URLs
**Platform:** web
**Files affected:**
- Delete: `apps/web/src/app/i-want-to/` (8 directories)
- `next.config.js` (redirects per V1 step 6)
- `apps/web/src/features/home/home-page.tsx` (situational tile `href`s)
- Mobile equivalent if any deep-links into `/i-want-to/*`
**Why:** V1 said delete + redirect. V3 confirms it's still alive. Two URL structures for the same content is splitting traffic + SEO.
**What to do:**
1. Add 301 redirects in `next.config.js` per V1 step 6 mapping.
2. Update homepage situational tiles' `href` to the new filtered Explore URLs (preserve the V1 §F mapping).
3. Delete the 8 directories under `apps/web/src/app/i-want-to/`.
4. Move the quick-check calculator widget (currently inline in those pages) into `bucket-workspace.tsx` as an optional banner shown when `?context=` matches.
5. Run `next build` to confirm no orphan imports.
**Acceptance criteria:**
- [ ] No directory `apps/web/src/app/i-want-to/` in the repo
- [ ] All old `/i-want-to/*` URLs return 301 to a filtered Explore URL with `?context=` set
- [ ] Homepage tiles navigate to new URLs
- [ ] Quick-check calculator still appears (now inside Explore page) when `?context=travel` (or other matching context)
- [ ] `grep -rn "i-want-to" --include="*.tsx"` returns only the redirect map + analytics reference
**Depends on:** TASK-302 (slugs must match), TASK-303 (sidebar already flat)
**Effort:** L

---

### TASK-311 [P0] · App Saved — single layout regardless of compare count
**Platform:** app
**Files affected:** `apps/mobile/lib/features/saved/presentation/saved_screen.dart`
**Why:** V3 §2.5 — two screenshots show different layouts depending on compare state. Layout shift = user disorientation.
**What to do:**
1. Settle on ONE Saved layout: header + summary tiles (Saved / Compare / Recently viewed) + compare-ready inline card (when count > 0) + offer list with both Save + Compare chips always visible.
2. Compare chip on a row: active = emerald-filled, inactive = outlined — never absent.
3. Recently-viewed becomes its own scrollable section below saved list (TASK-312).
**Acceptance criteria:**
- [ ] Saved page has one stable layout at compareCount = 0, 1, 2, 3
- [ ] Compare-ready card slides in/out smoothly, doesn't reorder the rest of the page
- [ ] Both icons (Save bookmark + Compare chip) always present on each row
**Depends on:** TASK-302
**Effort:** M

---

### TASK-312 [P0] · "Recently viewed" — show as section, not just a stat
**Platform:** both
**Files affected:**
- Mobile: `saved_screen.dart`
- Web: dashboard-app-view.tsx
**Why:** V3 §2.6 — "Recently viewed: 7" with no action is dead UI.
**What to do:**
1. Add a "Recently viewed" section below the saved offers: horizontal scrollable cards, max 5.
2. Each card is the compact offer row (mobile) / OfferCard (web).
3. The stat tile in the Saved summary becomes the count of THIS section — they stay in sync.
4. If recentCount = 0 → hide both the tile and the section.
**Acceptance criteria:**
- [ ] Recently viewed renders as a scrollable section on mobile + web
- [ ] Stat tile count = section count, always
- [ ] Section hidden when empty
**Depends on:** TASK-311
**Effort:** M

---

### TASK-313 [P1] · App Investments — demote Market section
**Platform:** app
**Files affected:** `apps/mobile/lib/features/explore/presentation/*` (Investments tab content), `apps/mobile/lib/shared/widgets/market_chart.dart` if separate
**Why:** V3 §2.7 — the chart/AI-insights block dilutes focus from the user's actual goal (ranked investment offers).
**What to do:**
1. Collapse the "Market context"/"Market intelligence" block under a tap-to-expand header.
2. Page hero = ranked offer list.
3. Rename heading "Market intelligence" → "Market today".
4. Subtitle: "See how the market's moving before you invest."
5. Either remove "AI insights" or wire to real per-asset content; ban templated "Volatility contained" / "Trend stabilizing" filler.
6. Format prices with locale separators (`$75,605` not `$75605`); add directional arrow on signed deltas (`▼ -2.28%`).
**Acceptance criteria:**
- [ ] Market section is collapsed by default on Investments tab
- [ ] Ranked offer list is first visible thing
- [ ] No "AI" claim without real LLM output
- [ ] All prices use locale separators
**Depends on:** TASK-302
**Effort:** M

---

### TASK-314 [P1] · Web Investments — same demote as TASK-313
**Platform:** web
**Files affected:** `apps/web/src/app/investing/*` (or current path under `/[category]`), `apps/web/src/features/explore/bucket-workspace.tsx`
**Why:** V3 §2.8 — same issue as app, worse on web (huge TradingView chart eats the fold).
**What to do:**
1. Demote market chart to a sidebar widget OR collapsed accordion.
2. Hero = ranked offer list with "Compare access routes for BTC" lead copy.
3. Same locale-separator + directional-arrow fixes as TASK-313.
**Acceptance criteria:**
- [ ] First-fold of `/explore/investing` is the offer list
- [ ] Chart is in a collapsed/sidebar position
- [ ] Locale-aware number formatting
**Depends on:** TASK-313 (so the copy + framing stays in sync across platforms)
**Effort:** M

---

### TASK-315 [P1] · Crypto exchange — kill maker/taker jargon in listing
**Platform:** both
**Files affected:**
- Catalog data (per-offer metric labels for crypto exchanges)
- Mobile: any place that renders offer metric labels
- Web: same
**Why:** V3 §2.9 — "0.16% maker / 0.26% taker" is pro-trading vocabulary AND it's truncated to "0.16% maker / 0.26% t…".
**What to do:**
1. In the catalog, change the listing-row metric label to "Trading fee" with value formatted "0.16–0.26%" (a range).
2. The detail (PDP) can keep maker/taker breakdown as secondary info with an inline tooltip explaining the two terms.
3. Audit other crypto-specific pro-jargon labels (e.g. "spread", "depth").
**Acceptance criteria:**
- [ ] No "maker"/"taker" text on listing rows
- [ ] Range fits on one line at 375px width
- [ ] PDP keeps the breakdown with a tap-tooltip glossary
**Depends on:** TASK-324 (inline glossary infra — or this ticket includes a one-off tooltip)
**Effort:** M

---

### TASK-316 [P1] · Splash tagline — rewrite to non-narrow positioning
**Platform:** app + web meta
**Files affected:**
- Mobile splash screen (`apps/mobile/ios/Runner/Base.lproj/LaunchScreen.storyboard`, Android splash if exists, Dart splash `apps/mobile/lib/app/...`)
- Web `<meta>` description in `apps/web/src/app/layout.tsx`
- Open Graph metadata
- App Store / Play Store listing metadata (out-of-repo task — flag)
**Why:** V3 §2.10 — current "Move money with more clarity" narrows the brand to a transfer-app. Brief proposes four alternatives.
**What to do:**
1. Pick ONE tagline (brief recommends "Money decisions, made clear" or "See every option. Pick yours."). Defer to product owner; default to "Money decisions, made clear" if no answer in 24h.
2. Apply identically across: splash screen, web `<meta>`, OG, app store metadata (flag the store update as separate manual task).
**Acceptance criteria:**
- [ ] Splash screen text matches chosen tagline
- [ ] `<meta name="description">` matches
- [ ] OG `og:description` matches
- [ ] Store-metadata-update task created in a follow-up tracker
**Depends on:** none
**Effort:** S (in-repo) + manual store work (separate)

---

### TASK-317 [P1] · Web Investments — kill template "Why this provider"
**Platform:** web
**Files affected:** Wherever provider cards render the "Why this provider" sentence (likely `apps/web/src/components/offer-card.tsx` or a sibling)
**Why:** V3 §2.11 — every provider shows the identical template sentence. Like Tradeoff (TASK-306), data-driven or removed.
**What to do:**
1. Add a `whyThisProvider` field per offer to catalog data.
2. Suppress the line until the field is populated.
3. Author 1–2 sentence per offer for the top 30 providers (rest can ship with the row hidden).
**Acceptance criteria:**
- [ ] No two provider cards in the same list render the same "Why this provider" text
- [ ] The line is hidden when data is missing
**Depends on:** TASK-301
**Effort:** L

---

### TASK-318 [P1] · Audit Benefits sections — remove internal-product copy leaks
**Platform:** both
**Files affected:** Catalog `benefits` per-offer field; web `apps/web/src/app/offers/[slug]/page.tsx`; mobile `offer_detail_screen.dart`
**Why:** V3 §2.14 — Trade Republic Savings ships benefit "Visible across European comparison flows" + "Continue where you left off". Internal product-feature copy leaked into user-facing UI.
**What to do:**
1. Audit every offer's `benefits` array. Flag any item that describes Payn (not the product).
2. Rewrite to real product benefits — examples per V3 brief:
   `✓ 4.0% interest per year`
   `✓ €1 minimum to open`
   `✓ €100,000 deposit protection (BaFin)`
3. Cap each offer at 3-4 benefits.
**Acceptance criteria:**
- [ ] No `benefits` entry references "comparison", "Payn", "continue where you left off", or any Payn-feature copy
- [ ] Every benefit is a fact about the provider's product
**Depends on:** TASK-301
**Effort:** L

---

### TASK-319 [P1] · "Strong match" badge — explain or replace with concrete reason
**Platform:** both
**Files affected:** wherever the "Strong match" badge is rendered (web `OfferCard`/`OfferCardHero`, mobile `OfferRow` + `offer_detail_screen.dart`)
**Why:** V3 §2.13 — badge is opaque. User has no idea what's being matched.
**What to do:**
1. If a real ranking signal is computed for this offer in this context, render that as the badge text:
   - "Best rate in your country"
   - "Cheapest to open"
   - "No lock-in"
2. If no signal beats the others → drop the badge.
3. Never render the generic "Strong match" string in production.
**Acceptance criteria:**
- [ ] Badge always carries a concrete reason
- [ ] No offer shows generic "Strong match" anymore
**Depends on:** TASK-301 (needs audit of which offers render this badge)
**Effort:** M

---

### TASK-320 [P2] · Investments chart Y-axis label spacing
**Platform:** app
**Files affected:** `apps/mobile/lib/shared/widgets/market_chart.dart`
**Why:** V3 §2.15 — Y-axis labels overlap (e.g. 83.8k / 83.1k stacked at top).
**What to do:**
1. Reduce tick count or set min-vertical-distance between ticks.
2. Verify across BTC / S&P 500 / EUR/USD.
**Acceptance criteria:**
- [ ] No Y-axis label visually overlaps another
**Depends on:** TASK-313 (so we don't touch the widget twice)
**Effort:** S

---

### TASK-321 [P2] · Review filter "Best rate" bands vs current ECB context
**Platform:** app
**Files affected:** `apps/mobile/lib/shared/services/quick_filters.dart`
**Why:** V3 §2.16 — bands "4%+ / 3-4% / under 3%" should reflect current rates dynamically.
**What to do:**
1. Compute the savings buckets from the current top-of-list once per market load, not hardcoded.
2. Bucket boundaries: top quartile / middle two / bottom quartile of live AERs in the market.
**Acceptance criteria:**
- [ ] Quick-filter bands recompute from live data
- [ ] No hardcoded percentage thresholds remain
**Depends on:** none
**Effort:** M

---

### TASK-322 [P1] · Copy simplification pass (Part 3.1 table)
**Platform:** both
**Files affected:** `i18n.ts` / `.arb` files (every locale) + any inline string in components
**Why:** V3 §3.1 — explicit table of old vs simpler copy.
**What to do:**
1. For each row in V3 §3.1 table:
   - Find every occurrence in code (both platforms)
   - Replace with the simpler version (en)
   - Translate for de/es/fr/it/pt naturally
2. Run TASK-301 audit grep to confirm zero hits of the "now" phrases left in production.
**Acceptance criteria:**
- [ ] All 12 phrases from V3 §3.1 replaced everywhere
- [ ] Translations sound natural per locale
**Depends on:** TASK-302, TASK-305
**Effort:** M

---

### TASK-323 [P1] · Compare column labels — simplify per Part 3.2
**Platform:** both
**Files affected:** wherever metric labels render in Compare (both platforms)
**Why:** V3 §3.2 — "Tradeoff" → "Watch out for" is much friendlier, etc.
**What to do:**
1. Rename in Compare view only (PDP detail can keep technical labels): "FX fee (weekday)" → "Foreign use, weekdays", "Monthly fee" → "Monthly cost", "ATM" → "ATM withdrawals", "Cashback" → "Money back", "Best for" → "Best when", "Tradeoff" → "Watch out for".
2. Don't rename source data — use a display-mapping function.
**Acceptance criteria:**
- [ ] Compare view uses the new friendly labels
- [ ] Source metric labels in data unchanged (so PDP can still show "FX fee")
**Depends on:** TASK-307 (don't touch the same file twice)
**Effort:** S

---

### TASK-324 [P1] · Inline jargon definitions with localStorage tracking
**Platform:** both
**Files affected:**
- Web: new `apps/web/src/components/glossary-term.tsx`
- Mobile: new `apps/mobile/lib/shared/widgets/glossary_term.dart`
- Tooltip/popover infrastructure (re-use existing if any)
**Why:** V3 §3.4 — a one-shot inline definition that auto-suppresses on subsequent sessions once the user has seen the term.
**What to do:**
1. Implement a `<GlossaryTerm term="APR">4.0% APR</GlossaryTerm>` wrapper that renders the child + a "?" icon.
2. Tap/hover opens a 1-sentence definition.
3. Mark term as "seen" in localStorage / shared_prefs; on next session render the child without the "?" icon.
4. Build a 20-term glossary in `lib/glossary.ts` / `lib/glossary.dart` to cover: APR, FX fee, AER, BaFin, FSCS, BNPL, maker/taker, spread, escrow, IBAN, SEPA, swift, robo-advisor, ETF, yield, custody, KYC, ISA, SIPP, lock-in.
**Acceptance criteria:**
- [ ] Wrapping any jargon term with the component shows a "?" icon until first interaction
- [ ] After interaction, definition is shown briefly then dismissed; term won't show "?" again for that user
- [ ] All 20 terms have plain-English definitions
**Depends on:** none
**Effort:** L

---

### TASK-325 [P1] · Home hero — replace 3-stat block with actual best offer card
**Platform:** both
**Files affected:**
- Mobile: `apps/mobile/lib/features/home/presentation/home_screen.dart` (`_GlanceHero` / `_DashboardHero`)
- Web: `apps/web/src/components/dashboard-app-view.tsx` (`GlanceHero`)
**Why:** V3 §4.1 — 3 stat counters (177 offers / 111 providers / 30 markets) are vanity metrics. Replace with the actual best offer + a meta line summarising the rest.
**What to do:**
1. Replace the stats grid with a single OfferCardHero variant: logo + provider · product · headline metric + two CTAs ("Show me this →" / "See others").
2. Below the card: one-line "+ N more across M providers in K markets".
3. Pick the offer using the existing `_pickHeadlineOpportunity` heuristic from MOB.15 (re-use across platforms).
**Acceptance criteria:**
- [ ] No 3-stat block on Home (mobile + web)
- [ ] Hero card always shows a concrete offer + two CTAs
- [ ] Meta line shows live counts
**Depends on:** TASK-302
**Effort:** L

---

### TASK-326 [P1] · Home category chips — show all 9 (not arbitrary 3)
**Platform:** both
**Files affected:**
- Mobile: `home_screen.dart` (`_QuickCategoryStrip`)
- Web: `dashboard-app-view.tsx`
**Why:** V3 §4.2 — current "Loans / Credit Cards / Banking" feels arbitrary.
**What to do:**
1. Render all 9 categories in a horizontal scroll on mobile (already done in MOB.15 — verify it shipped).
2. Web: render all 9 as a wrapping chip grid below the hero.
3. Order matches `CATEGORIES` (TASK-302).
**Acceptance criteria:**
- [ ] All 9 categories visible/scrollable from Home on both platforms
- [ ] Order consistent
**Depends on:** TASK-302
**Effort:** S

---

### TASK-327 [P1] · Compare ribbon — sticky + brand-coloured + shorter
**Platform:** both
**Files affected:**
- Mobile: `payn_shell.dart` (or wherever ribbon lives post-MOB.10)
- Web: `compare-ready-card.tsx`, `compare-pick-strip.tsx`
**Why:** V3 §4.3 — current black ribbon jars vs mint palette; text is verbose.
**What to do:**
1. Sticky at top of `/saved` (mobile + web) when `compareCount > 0`.
2. Fill: emerald with white text OR dark slate (`#1F2937`) — pick one and keep it; emerald reads better with mint palette.
3. Text: just "Compare N →" (no "Ready to compare · See N offers side by side" verbosity).
**Acceptance criteria:**
- [ ] Compare ribbon uses brand colour, not pure black
- [ ] Short copy
- [ ] Sticks on scroll inside Saved
**Depends on:** none
**Effort:** S

---

### TASK-328 [P1] · Save vs Compare — different icons + labels
**Platform:** both
**Files affected:** `OfferRow` (mobile), `OfferRowAtlas` (web), Saved screen rows
**Why:** V3 §2.12 / §4.4 — two bookmark-style buttons confuse the user.
**What to do:**
1. Save uses ♥ (filled when saved) — already a heart in some places? Audit and unify.
2. Compare uses ⇄ icon + "Compare" text (multi-select pill).
3. Never two bookmark shapes side by side.
**Acceptance criteria:**
- [ ] Save = heart, Compare = parallel-arrows (or equivalent), visually distinct
- [ ] Every list row on mobile + web uses these icons
**Depends on:** none
**Effort:** S

---

### TASK-329 [P1] · Sub-chip active state — emerald-500 fill, not soft
**Platform:** both
**Files affected:** chip rendering in `bucket-workspace.tsx`, mobile chip component
**Why:** V3 §4.5 — "all chips look the same shape" makes scanning hard.
**What to do:**
1. Active: `bg-accent-emerald` (#0F8A4B) + white text + leading "●" dot indicator + slight scale 1.04.
2. Inactive: white bg + slate-700 text + slate-200 border.
3. Apply across both platforms.
**Acceptance criteria:**
- [ ] Active chip is unmistakably distinct from inactive
- [ ] Visual change ≥ 30% delta (perceived size + colour)
**Depends on:** TASK-304
**Effort:** S

---

### TASK-330 [P1] · Empty filter state — helpful copy
**Platform:** both
**Files affected:** `bucket-workspace.tsx`, mobile explore screen
**Why:** V3 §4.6 — current "0 ranked offers in All Europe" looks broken.
**What to do:**
1. When filter applies and 0 offers match: render "No offers match this combo. Try removing one filter, or [Reset all]."
2. Include chips for each active filter so user can drop one at a time (web already has this via TASK-301 audit — verify).
**Acceptance criteria:**
- [ ] Empty filter state on both platforms shows the new copy
- [ ] Reset CTA wired to the same handler as current "Clear filters"
**Depends on:** TASK-322
**Effort:** S

---

### TASK-331 [P1] · "What you'd save" calculator — start with 3 categories
**Platform:** both
**Files affected:** new component + per-offer/per-category calculator config
**Why:** V3 §5.1 — concrete savings number per offer = the value prop.
**What to do:**
1. Add per-category default inputs (savings: €5k for 1 year; cards: €1.5k/mo abroad; transfers: €500 to country X).
2. Compute estimated annual savings vs a national baseline.
3. Editable input (slider or number field) per offer.
4. Render inline on each offer row on Saving / Cards / Sending money first.
5. NEVER render with placeholder numbers (brief Part 8). If data missing → suppress the calculator for that offer.
**Acceptance criteria:**
- [ ] Calculator visible on at least Saving / Cards / Sending money offer rows
- [ ] Number updates live as user edits input
- [ ] No placeholder values shipped
**Depends on:** TASK-302, TASK-305
**Effort:** XL

---

### TASK-332 [P2] · "Tell me when this changes" — alert subscription
**Platform:** both
**Files affected:** new endpoint + UI on offer detail
**Why:** V3 §5.2 — sticky behaviour without forcing signup.
**What to do:**
1. Add an opt-in chip on offer detail: "Tell me when this changes".
2. Capture: email (optional) OR web-push permission.
3. Backend: schedule a daily check; if a tracked offer's primary metric changes by ≥10% → send notification.
4. No signup gate — guest email is fine.
**Acceptance criteria:**
- [ ] Subscription persists across sessions
- [ ] Backend test fires on a synthetic metric change
- [ ] One-click unsubscribe in email
**Depends on:** TASK-301
**Effort:** XL

---

### TASK-333 [P1] · Country detection prompt on first visit
**Platform:** both
**Files affected:** app first-launch screen, web `app/layout.tsx` + a one-time modal
**Why:** V3 §5.3 — "All Europe" default adds cognitive load.
**What to do:**
1. App: existing locale gate already does this (verify); ensure the gate is mandatory on first launch.
2. Web: IP-geolocate on first visit, set country pref automatically, show small inline "Showing offers for Germany. Wrong? [Change]".
3. Persist in localStorage / shared_prefs.
**Acceptance criteria:**
- [ ] User never sees "All Europe" as a default if their country is detected
- [ ] One-tap to change country
**Depends on:** none
**Effort:** M

---

### TASK-334 [P1] · "Why we picked #1" tap-tooltip on top-match cards
**Platform:** both
**Files affected:** `OfferRowAtlas` (web), `OfferRow` (mobile)
**Why:** V3 §5.4 — transparent reasoning builds trust.
**What to do:**
1. Add a "Why #1?" link on the rank-1 offer row.
2. Tap opens a sheet with 3-4 reasons (data-driven from ranking helper) + 1 honest "what didn't help" point.
3. Re-use the existing mobile `_RankReasonPill` widget where possible.
**Acceptance criteria:**
- [ ] Rank-1 offer always has the link
- [ ] Reasons are concrete facts (e.g. "Highest rate in your country") not template phrases
- [ ] Includes a "what didn't help" note
**Depends on:** TASK-319
**Effort:** M

---

### TASK-335 [P2] · Personal scoreboard on Home for return visitors
**Platform:** both
**Files affected:** Home screen on both platforms
**Why:** V3 §5.5 — make abstract "savings" concrete.
**What to do:**
1. Track in localStorage / shared_prefs: offersViewed, offersSaved, sum of "What you'd save" amounts on saved offers.
2. Show on Home: "You've explored N offers. Picked M. Estimated yearly savings: ~€X."
3. Hide for fully-new users (visit count < 3).
**Acceptance criteria:**
- [ ] Scoreboard hidden for new users
- [ ] Numbers reflect localStorage state
- [ ] Updates on every page interaction
**Depends on:** TASK-331 (savings data must exist first)
**Effort:** M

---

### TASK-336 [P2] · 3-question onboarding quiz (optional, skippable)
**Platform:** both
**Files affected:** Onboarding flow at first launch
**Why:** V3 §5.6 — adjust recommendation weighting + glossary verbosity.
**What to do:**
1. Add a 3-question quiz after country detection, skippable:
   - Money use (daily / saving / investing / sending / borrowing)
   - Self-rated finance literacy (new / some / confident)
   - Country (already known from TASK-333; reconfirm)
2. Store answers in shared prefs.
3. Use to adjust default sort, glossary tooltip count, and recommendation weighting.
**Acceptance criteria:**
- [ ] Quiz is skippable with a clear "skip" CTA
- [ ] Quiz answers persist
- [ ] At least one downstream behaviour changes based on answers (e.g. default sort)
**Depends on:** TASK-333
**Effort:** L

---

### TASK-337 [P2] · "Switch in 5 minutes" walkthrough for bank-account top picks
**Platform:** both
**Files affected:** PDP for bank-account / savings offers
**Why:** V3 §5.7 — turn compare into act.
**What to do:**
1. On bank-account PDPs, add a "Switch in 5 minutes" expander with 3-step list.
2. Each step has a sub-action (Open app, Verify ID, Transfer salary).
3. Final step links to a static "How to transfer your salary" mini-guide.
**Acceptance criteria:**
- [ ] Walkthrough visible on at least the rank-1 bank-account PDP per market
- [ ] Time-estimate visible per step
- [ ] Final transfer-salary guide page exists at `/help/transfer-salary`
**Depends on:** none
**Effort:** L

---

### TASK-338 [P2] · Pre-made bundles ("The Basic Set for Europe")
**Platform:** both
**Files affected:** Home screen + new bundle config
**Why:** V3 §5.8 — reduce decision fatigue.
**What to do:**
1. Define 2-3 bundles in `lib/bundles.ts`:
   - Basic Set: Revolut Standard + Trade Republic + Wise (free + works in 30 markets)
   - Travel Set: Revolut Standard + travel insurance + travel card
   - Saver Set: Top savings + best transfer + cashback card
2. Render a "Bundles" section on Home below the hero (collapsed by default).
3. Each bundle has: 3 offers + total monthly cost + estimated savings.
**Acceptance criteria:**
- [ ] 2 bundles visible on Home
- [ ] Tap bundle → all 3 offers added to compare automatically
- [ ] Estimated savings shown
**Depends on:** TASK-302, TASK-331
**Effort:** L

---

### TASK-339 [P2] · "I already use X" — anti-recommendation
**Platform:** both
**Files affected:** Profile, offer ranking
**Why:** V3 §5.9 — don't sell what user already has.
**What to do:**
1. Add a "I already use…" multi-select on Profile (top 20 providers).
2. Persist in shared prefs.
3. Ranking helper de-prioritises owned providers; surfaces "complements" instead.
**Acceptance criteria:**
- [ ] User can mark "I have Revolut" + 19 other top providers
- [ ] Marked providers drop in ranking weight
- [ ] A "complements" line appears on Home when user has marked at least one
**Depends on:** TASK-309 (interests UI pattern)
**Effort:** L

---

### TASK-340 [P2] · Glossary surface — three entry points
**Platform:** both
**Files affected:** Profile menu, offer detail header, generic
**Why:** V3 §5.10 — glossary always one tap away.
**What to do:**
1. Profile menu has a "Money basics" link.
2. PDP header has a "New to this? [Read the basics →]" small link.
3. Inline `GlossaryTerm` from TASK-324 covers the rest.
**Acceptance criteria:**
- [ ] All three entry points present
- [ ] Glossary page lists every term backed by TASK-324
**Depends on:** TASK-324
**Effort:** S

---

### TASK-341 [P0] · Tone audit grep + rewrite (before launch)
**Platform:** both
**Files affected:** every copy file across web + app
**Why:** V3 §6 + V1 §I — bashing banks burns affiliate partnerships. Brief explicitly says ship-blocker before launch.
**What to do:**
1. Run grep for: `overpaying`, `quietly`, `rip off`, `predatory`, `your bank charges`, `hidden fees`, `stealing`, `rob`, `no bank pays us`, `your bank doesn't tell you`.
2. For each hit, rewrite using safe patterns from V1 §I (or V3 §6).
3. Repeat for de/es/fr/it/pt translations.
4. Add a CI check that fails the build on any of the red-flag substrings.
**Acceptance criteria:**
- [ ] Zero production code matches the red-flag grep (any language)
- [ ] CI build fails if any of the red-flag substrings is reintroduced
- [ ] All replacements pass the V1 §I "the numbers do the talking" test
**Depends on:** TASK-322 (so we don't touch the same copy twice)
**Effort:** M

---

## Notes & open questions

1. **Tagline pick** (TASK-316): brief lists 4 options. Default = "Money decisions, made clear" unless owner picks another within 24h of approving this backlog.
2. **`whyThisProvider` and `tradeoff` content** (TASK-306, TASK-317): the field exists at code level after these tickets but the actual copy needs an editorial pass for ~30 top offers. Flagging as content-debt; tracked but not blocking the structural tickets.
3. **Personal scoreboard (TASK-335)** depends on TASK-331 for the savings amount data. If TASK-331 slips, scoreboard hides the savings line.
4. **Mobile PDP Compare button** (carried over from earlier session): not in V3 brief. Will keep tracking separately unless V4 picks it up.
5. **Web mobile `<sm` per-row Compare icons** (carried over): same as above.
6. **Drawer state architecture** (web): three components each own a `useState(open)` + render their own `<CompareDrawer />`. Not flagged in V3, but a single source-of-truth refactor would simplify TASK-307 + TASK-308. Adding as TASK-342 candidate if confirmed.
