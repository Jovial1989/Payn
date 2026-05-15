# i18n Implementation

## When to load this skill
- Any work touching `apps/web/src/lib/i18n.ts`
- Adding new UI copy that users will see (labels, CTAs, headings, descriptions)
- Locale routing, language detection, country/locale cookie handling
- Multilingual content in any component
- Adding new dictionary keys, new locale files, new namespace sections
- Touching `useMarketplacePreferences`, `getRequestPreferences`, `MarketplaceLocale`

## TL;DR
- **6 locales only:** `en`, `de`, `es`, `fr`, `it`, `pt`. NL was dropped (middleware locale conflict).
- **Never add a key to fewer than 6 locales** — missing key → runtime `undefined.property` crash.
- **Type-safe dictionary access only** — no string-path lookups like `t("section.key")`. Use typed union keys.
- **`formatCopy(template, vars)`** for interpolation — not string concatenation.
- **Server reads preferences from cookies via `getRequestPreferences()`; client uses `useMarketplacePreferences()`.**

## The pattern

### Locale type

```ts
// packages/types/src/index.ts
export type MarketplaceLocale = "en" | "de" | "es" | "fr" | "it" | "pt";
// NL was removed — middleware had a conflict with Dutch locale detection
```

### Adding a new dictionary key — all 6 locales simultaneously

When adding a new key to `i18n.ts`, always update all 6 locale objects in the same commit:

```ts
// apps/web/src/lib/i18n.ts

type SidebarNavGroupKey =
  | "groupBankingCards"
  | "groupInvesting"
  | "groupBusiness"
  | "groupLifestyle"
  | "refineResults";  // ← new key added here

const dictionaries = {
  en: {
    sidebarNav: {
      groupBankingCards: "Banking & Cards",
      groupInvesting: "Investing",
      groupBusiness: "Business",
      groupLifestyle: "Lifestyle",
      refineResults: "Refine results",   // ← en
    },
    // ... other namespaces
  },
  de: {
    sidebarNav: {
      groupBankingCards: "Banking & Karten",
      groupInvesting: "Investieren",
      groupBusiness: "Business",
      groupLifestyle: "Lifestyle",
      refineResults: "Ergebnisse verfeinern",  // ← de
    },
  },
  es: { sidebarNav: { /* ... */ refineResults: "Refinar resultados" } },
  fr: { sidebarNav: { /* ... */ refineResults: "Affiner les résultats" } },
  it: { sidebarNav: { /* ... */ refineResults: "Affina i risultati" } },
  pt: { sidebarNav: { /* ... */ refineResults: "Refinar resultados" } },
};
```

### Type-safe access pattern

```ts
// ✅ Type-safe — union type enforced at compile time
type SidebarNavGroupKey = "groupBankingCards" | "groupInvesting" | "refineResults";

const dictionary = getDictionary(locale);
const label = dictionary.sidebarNav[group.labelKey];  // TypeScript checks the key exists

// ✅ In components:
const t = dictionary.homeAtlas.exploreBucket;
const heading = t.heading;       // string — TypeScript verified
const cta = t.goToProvider;      // string — TypeScript verified

// ❌ Never use string-path lookups:
const label = get(dictionary, "sidebarNav.groupBankingCards");  // no autocomplete, no type check
const label = dictionary["sidebarNav"]["groupBankingCards"];    // acceptable but less safe
```

### formatCopy — interpolation helper

```ts
// For strings with {variable} placeholders:
const t = {
  bestFor: "Best for {audience}",
  offerCount: "{count} options available",
};

// Usage:
formatCopy(t.bestFor, { audience: "Freelancers" })
// → "Best for Freelancers"

formatCopy(t.offerCount, { count: 12 })
// → "12 options available"

// Pluralization — use inline ternary, not i18n library:
`${count} ${count === 1 ? "option" : "options"} available`
```

### Server-side locale reading

```ts
// In server components and route handlers:
import { getRequestPreferences } from "@/lib/marketplace";

export default async function CategoryPage() {
  const { locale, country } = getRequestPreferences();
  // locale: "de" | "en" | ...
  // country: "DE" | "FR" | ...

  const dictionary = getDictionary(locale);
  return <PageContent t={dictionary} locale={locale} country={country} />;
}
```

### Client-side locale reading

```ts
// In client components:
import { useMarketplacePreferences } from "@/hooks/use-marketplace-preferences";

export function ClientFilter() {
  const { locale, country } = useMarketplacePreferences();
  const t = getDictionary(locale);
  return <select>{t.filter.allCategories}</select>;
}
```

### Locale-aware links

```ts
import { localePath } from "@/lib/marketplace";

// ✅ Locale-prefixed path
<a href={localePath(locale, "/waitlist")}>Join waitlist</a>
// → "/de/waitlist" for German users

// ❌ Hardcoded path without locale
<a href="/waitlist">Join waitlist</a>
// → doesn't preserve user's locale
```

### Dictionary structure — namespaces

```ts
const en = {
  sidebarNav: {           // navigation labels
    groupBankingCards: "Banking & Cards",
    // ...
  },
  homeAtlas: {
    exploreBucket: {      // /explore/[bucket] page
      heading: "Explore",
      bestFor: "Best for {audience}",
      goToProvider: "Go to provider",
    },
    heroSection: {        // homepage hero
      tagline: "...",
    },
  },
  categoryPage: {         // /banking, /cards, /loans etc.
    filters: { ... },
    emptyState: { ... },
  },
};
```

### Adding a new locale section — checklist flow

1. Add the TypeScript union type for new keys
2. Add the keys to `en` (English, source of truth)
3. Copy to all 5 other locales and translate
4. Export/use from the type-safe dictionary object
5. Run `pnpm --filter web build` — TypeScript will catch missing keys

## Anti-patterns — DO NOT do these

```ts
// ❌ Hardcoded English string in a component
<h2>Banking & Cards</h2>
// Should be: dictionary.sidebarNav.groupBankingCards

// ❌ Key added to only some locales
// en: { newSection: { title: "Hello" } }
// de: {}  // ← missing — runtime crash: Cannot read properties of undefined

// ❌ String-path lookup — no compiler checking
const label = dictionary?.sidebarNav?.["groupBankingCards"] ?? "";  // ok but fragile
const label = t("sidebarNav.groupBankingCards");  // no compile-time check at all

// ❌ Hardcoded locale path
<a href="/de/waitlist">Join</a>  // breaks when user is French

// ❌ Pulling in i18n library (i18next, react-intl) for 6 locales
// We have 6 locales with small dictionaries — typed objects are sufficient
// No external i18n library needed

// ❌ locale = "nl" — NL was dropped
// Do not add nl to MarketplaceLocale — middleware conflict
```

## Real bugs we've hit

**Bug: Category group labels were hardcoded English in sidebar (PR 4 Commit 1)**

- Root cause: `categoryGroups` in `marketplace.ts` had hardcoded English labels like `label: "Banking & Cards"`. These were not i18n keys.
- Fix: introduced `labelKey: SidebarNavGroupKey` union type. Each group now carries `labelKey: "groupBankingCards"` and the component looks up `dictionary.sidebarNav[group.labelKey]`.
- Commit: `feat(sidebar): i18n keys for category group labels`
- Lesson: any string that appears in a visible UI element must be a dictionary key, not a hardcoded string.

**Bug: Missing `refineResults` key in non-English locales caused "undefined" in filter button**

- Root cause: Added `refineResults` to English dictionary during PR 4 Commit 6, forgot to add to de/es/fr/it/pt.
- Detection: found during Portuguese locale test — button showed "undefined".
- Fix: added all 6 locale translations in the same commit.
- Lesson: always add keys to all 6 locales in the same commit. Use `pnpm --filter web build` — TypeScript catches missing keys if the type union is correct.

**Dropped locale: NL (Dutch)**

- Dutch (`nl`) was briefly considered but caused middleware conflicts with the locale detector. `nl` was removed from `MarketplaceLocale`. Do not re-add without fixing the middleware `handleLocale()` function first.

## Checklist before shipping

- [ ] New UI strings defined as dictionary keys, not hardcoded
- [ ] Keys added to all 6 locales: `en`, `de`, `es`, `fr`, `it`, `pt`
- [ ] TypeScript union type updated for new keys (not string-typed)
- [ ] `formatCopy()` used for `{variable}` interpolation (not template literals)
- [ ] `localePath(locale, path)` used for locale-prefixed links
- [ ] Server components use `getRequestPreferences()` for locale
- [ ] Client components use `useMarketplacePreferences()` for locale
- [ ] Build passes: `pnpm --filter web build` (TypeScript catches missing dict keys)
- [ ] No `nl` locale added
- [ ] No external i18n library imports added
