# Next.js App Router Patterns

## When to load this skill
- Any work in `apps/web/src/app/**`
- Server vs client component decisions
- Shell layout selection for new pages
- Routing, caching, cookie-based personalization
- Touching `SiteShell`, `AppShell`, `payn-shell.tsx`, middleware, layout files
- Running builds, deploys, or lint from the CLI
- Bug: "component has no locale", "server component importing client hook"

## TL;DR
- **Two shells:** `SiteShell` (homepage + `/explore/*`) and `AppShell` (legacy category routes). Choose at page creation time.
- **Default to server components.** Add `"use client"` only when you need `useState`, `useEffect`, event handlers, or browser APIs.
- **Never import server-only utilities in client components** — causes a build error.
- **Always build + lint before pushing:** `pnpm --filter web build && pnpm --filter web lint`.
- **Deploy from monorepo root:** `vercel --prod` (not from inside `apps/web/`).

## The pattern

### Two shells — decide before building

```
SiteShell                              AppShell
─────────────────────                  ──────────────────────────────
Full-width, no sidebar                 Left sidebar (248px) + main
/                                      /banking
/explore                               /cards
/explore/[bucket]                      /loans
/how-we-rank                           /insurance
/how-we-make-money                     /investments
/about                                 (all legacy category routes)
/ranking
```

```tsx
// SiteShell — in apps/web/src/app/explore/page.tsx
import { SiteShell } from "@/components/site-shell";

export default async function ExplorePage() {
  return (
    <SiteShell locale={locale} country={country}>
      <AtlasGrid locale={locale} country={country} buckets={ATLAS_BUCKETS} />
    </SiteShell>
  );
}

// AppShell — in apps/web/src/app/banking/page.tsx (via dashboard-category-workspace)
import { AppShell } from "@/components/app-shell";  // or wraps via payn-shell

export default async function BankingPage() {
  return (
    <AppShell locale={locale} country={country}>
      <DashboardCategoryWorkspace category="banking" ... />
    </AppShell>
  );
}
```

### Server component by default

```tsx
// ✅ Server component — no "use client" — can be async, fetch server-side data
export default async function LoansPage() {
  const { locale, country } = getRequestPreferences();
  const offers = await getOffersForCategory("loans", country);
  return <DashboardCategoryWorkspace offers={offers} locale={locale} />;
}

// ✅ Mixed — server parent, client child
// Server parent passes data down; only the interactive bit is a client component
export default async function ParserPage() {
  const runs = await fetchRuns();
  return (
    <div>
      <RunHistory runs={runs} />          {/* server component */}
      <AdminParserControls />             {/* "use client" — has buttons */}
      <AdminEnrichmentControls />         {/* "use client" — has state */}
    </div>
  );
}
```

### "use client" boundary rules

```tsx
// Add "use client" when you need:
// - useState / useReducer
// - useEffect / useLayoutEffect
// - event handlers (onClick, onChange)
// - browser APIs (window, document, localStorage)
// - motion hooks (useReducedMotion, useMotionValue)
// - custom hooks that use any of the above

"use client";
import { useState } from "react";
export function FilterPanel() {
  const [open, setOpen] = useState(false);
  // ...
}
```

### Locale + country resolution

```tsx
// SERVER — reads from middleware-injected cookies
import { getRequestPreferences } from "@/lib/marketplace";

export default async function Page() {
  const { locale, country } = getRequestPreferences();
  // locale: MarketplaceLocale ("en" | "de" | "es" | "fr" | "it" | "pt")
  // country: string ("DE" | "FR" | "EU" | ...)
}

// CLIENT — reads from cookie store reactively
import { useMarketplacePreferences } from "@/hooks/use-marketplace-preferences";

export function ClientComponent() {
  const { locale, country } = useMarketplacePreferences();
}
```

### Route segment config

```ts
// Force dynamic — personalized content (has country/locale cookie reads)
export const dynamic = "force-dynamic";

// Static — marketing pages that don't need personalization
export const dynamic = "force-static";

// Most category pages don't need explicit config — Next.js detects cookie reads
// and automatically makes them dynamic
```

### Admin auth — middleware protection

```ts
// middleware.ts protects these paths:
// /admin/**          → redirects to /admin/login if no valid session
// /api/v1/admin/**   → returns 401 if no valid session

// /api/admin/**      → NOT protected by middleware!
// These routes use checkAdminToken(request) directly:
import { checkAdminToken } from "@/lib/admin-api-auth";

export async function POST(request: NextRequest) {
  const authError = checkAdminToken(request);
  if (authError) return authError;  // returns 401 NextResponse
  // ...
}

// Client components call /api/admin/* with:
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? "";
// passed as x-admin-token header
```

### Build + lint workflow

```bash
# TypeScript check (fast, no bundling)
pnpm --filter web exec tsc --noEmit

# Full build (required before push)
pnpm --filter web build

# Lint
pnpm --filter web lint

# Deploy from monorepo root (NOT from inside apps/web/)
cd /path/to/Payn  # ← monorepo root
vercel --prod

# Dev server
pnpm --filter web dev
```

### Monorepo package aliases

```ts
// @/* maps to apps/web/src/*
import { getDictionary } from "@/lib/i18n";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// @payn/types — shared types package
import type { MarketplaceOffer, MarketplaceLocale } from "@payn/types";

// @payn/ui — shared UI primitives (if used)
import { Button } from "@payn/ui";
```

## Anti-patterns — DO NOT do these

```tsx
// ❌ Importing server-only code in a client component
"use client";
import { createSupabaseAdminClient } from "@/server/supabase/admin";  // server-only!
// → Build error: "createClient" cannot be used in client components

// ❌ "use client" on entire page when only one child needs it
"use client";
export default function LoansPage() {
  // This forces the entire tree to client — including all data fetching
  // Fix: move "use client" to just the interactive child component
}

// ❌ Hardcoded country fallback
const country = "DE";  // ignores user's actual country cookie
// Fix:
const { country } = getRequestPreferences();

// ❌ Running deploy from inside apps/web/
cd apps/web && vercel --prod
// → deploys only the web app package, not the monorepo root config
// → environment variables and build config may differ

// ❌ Fetching data in client components that could be server components
"use client";
export function OfferList() {
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    fetch("/api/v1/offers").then(r => r.json()).then(setOffers);
  }, []);
  // Fix: make this a server component and fetch at render time
}

// ❌ Using /api/admin/* without x-admin-token
fetch("/api/admin/enrich-offers", { method: "POST" });
// → 401. Must include:
fetch("/api/admin/enrich-offers", {
  method: "POST",
  headers: { "x-admin-token": ADMIN_TOKEN },
});
```

## Real bugs we've hit

**Bug: /explore/[bucket] misidentified as AppShell page during PR 4 diagnostic**

- Symptom: during a diagnostic for PR 4, the incorrect assumption was made that `/explore/[bucket]` used `AppShell` (with sidebar).
- Reality: `/explore/[bucket]` uses `SiteShell` — no sidebar — and this was correct design.
- Detection: screenshots during verification showed no sidebar, which was initially flagged as a bug.
- Lesson: **decide the shell upfront** and document it. Atlas/marketing pages → `SiteShell`. Legacy category browse → `AppShell`. Check the actual file, don't infer from the URL pattern.

**Bug: Admin server action bypassed API route auth (PR 5 — admin login)**

- Root cause: the admin login was using a Next.js API route, which was caught by middleware before the route handler ran, causing a redirect loop.
- Fix: converted to a Next.js Server Action (`"use server"`) which bypasses the middleware/route system.
- Commit: `fix: use server action for admin login to bypass API route issues`
- Lesson: for admin auth flows, server actions sidestep middleware auth checks. Use route handlers for programmatic API access; server actions for form submissions.

## Checklist before shipping

- [ ] Shell chosen explicitly: `SiteShell` (marketing/browse) or `AppShell` (category with sidebar)
- [ ] New interactive components have `"use client"` at top
- [ ] Server-only imports (`createSupabaseAdminClient`, `getRequestPreferences`) not in client files
- [ ] TypeScript check passes: `pnpm --filter web exec tsc --noEmit`
- [ ] Full build passes: `pnpm --filter web build`
- [ ] Deploy from monorepo root (not `apps/web/`)
- [ ] `/api/admin/*` routes have `checkAdminToken()` guard
- [ ] `/api/v1/admin/*` routes rely on middleware for auth (no extra token check needed)
- [ ] Locale read uses `getRequestPreferences()` server-side or `useMarketplacePreferences()` client-side
- [ ] No `"nl"` locale in any new code (dropped locale)
