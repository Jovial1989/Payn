# Payn Constitution

## Core Principles

### I. Design Tokens Are the Only Visual Source of Truth

- Colors, radii, shadows, spacing and typography MUST come from the theme extension in
  `tailwind.config.ts` or the CSS variables in `globals.css`. Hardcoded hex, rgb or hsl
  values in components are forbidden.
- Styling MUST use Tailwind utility classes. Inline `style` attributes are forbidden except
  for values that are computed at runtime and cannot be expressed as a class.
- New visual values MUST be added as tokens first (config or CSS variable), then consumed.
- Figma MCP output is design reference only: it MUST be translated to project tokens and
  components and checked against the Figma screenshot for 1:1 parity before merge.

Rationale: a single token layer keeps every surface on-brand and makes theme changes a
one-file edit instead of a codebase-wide search.

### II. Component Reuse & Predictable Placement

- UI primitives (button, tag, card, input) live in `apps/web/src/components/`; feature
  components in `apps/web/src/features/{feature}/`; routes in `apps/web/src/app/`;
  server-only services in `apps/web/src/server/`; shared types in `packages/types/src/`.
- Before creating a component, existing primitives and feature components MUST be checked
  and reused or extended. A near-duplicate component requires written justification in the plan.
- Components MUST use named exports; default exports are forbidden for components.
- Icons MUST be inline SVG React components. External icon libraries are forbidden.
  Static assets live in `apps/web/public/`.

Rationale: a predictable layout lets anyone (human or agent) find and reuse code, and
prevents parallel, drifting implementations of the same UI.

### III. Server-First, Type-Strict Next.js

- Components are React Server Components by default. `"use client"` MUST be added only
  when a component needs state, effects, browser APIs or event handlers, and SHOULD be
  pushed to the smallest leaf that needs it.
- TypeScript runs in strict mode. `any`, non-null assertions and `@ts-ignore` require an
  inline justification comment.
- Imports inside the web app MUST use the `@/*` alias for `./src/*`.
- Secrets and service-role credentials MUST only be read in server code (`src/server/`,
  route handlers, server actions), never in client bundles.

Rationale: server-first rendering keeps bundles small and data access secure; strict
typing catches contract drift between the app, Supabase and shared packages.

### IV. Mobile-First, Responsive & Accessible UI

- Layouts MUST be authored mobile-first and widened through `sm → md → lg → xl`
  breakpoints. Every new page or component MUST be checked at phone width with no
  horizontal scroll.
- Grid and flex children that hold text MUST guard overflow (e.g. `min-w-0`).
- Interactive targets MUST be at least 44×44px on touch layouts.
- Animations MUST respect `prefers-reduced-motion` (`useReducedMotion` gate).

Rationale: most marketplace traffic is mobile; overflow and motion bugs are the most
frequent regressions on this codebase.

### V. Browse-First, Neutral & Localised Presentation

- Offer surfaces follow the Atlas frame: show what is available and let the user decide.
  Ranking numbers, "best", "top picks", "winner", "recommended" or similar verdict copy
  MUST NOT appear in browse UI unless a spec explicitly introduces a compare frame.
- User-facing copy MUST go through the locale dictionaries and exist for all supported
  locales (en, de, es, fr, it, pt). Hardcoded user-facing strings are forbidden.
- Offer data shown to users MUST carry the project's freshness signal; stale data is
  flagged, never silently presented as current.
- Internal implementation jargon MUST NOT leak into user-facing copy (enforced by
  `check-banned-phrases`).

Rationale: Payn is a European financial marketplace; neutral, current and localised
information is a trust and regulatory requirement, not a style choice.

## Technology Stack & Constraints

- Monorepo managed with pnpm workspaces: `apps/web` (Next.js 16, React, Tailwind 3),
  `apps/mobile` (Flutter), `backend` (Go), `supabase` (migrations), `packages/*`
  (config, types, ui, utils).
- Typography: Manrope with the system fallback stack; type scale, spacing (4px base),
  radii and elevation follow the scale documented in `CLAUDE.md`.
- Data: Supabase. Table names MUST be verified before writing migrations; RLS applies to
  every user-facing table; service-role keys are server-only.
- New runtime dependencies require a stated reason in the plan; icon and UI kit libraries
  are not accepted (see Principle II).
- Mobile UI changes that mirror a web redesign SHOULD land in the same feature spec so both
  surfaces stay consistent.

## Quality Gates & Deployment

- Every change to `apps/web` MUST pass `pnpm deploy:check` (typecheck + `next build`,
  which includes the banned-phrase check) with no errors or warnings before it is deployed.
- Logic in `src/lib` and `src/server` that computes money, rates, offer ordering or
  freshness MUST have Vitest coverage; new such logic ships with tests.
- UI work MUST be visually verified at phone and desktop widths; Figma-derived work is
  compared against the Figma screenshot.
- Production is `payn.online`, served from the Vercel production deployment of this repo.
  A build that fails any gate above MUST NOT be deployed.
- Commit messages follow the `[area][topic] summary` convention used in the history.

## Governance

- This constitution takes precedence over other conventions in the repo. `CLAUDE.md` and
  `.claude/skills/*` provide runtime guidance and MUST stay consistent with it; on conflict,
  amend one of them explicitly rather than ignore the other.
- Every `/speckit-plan` MUST pass the Constitution Check; any violation is recorded in the
  plan's Complexity Tracking with justification and a simpler alternative that was rejected.
- Amendments are made via `/speckit-constitution`, reviewed in a PR, and versioned with
  semantic versioning: MAJOR for removed or redefined principles, MINOR for new principles
  or materially expanded guidance, PATCH for wording and clarifications.
- Reviews (human or agent) MUST check changed code against Principles I–V and the quality
  gates before merge.

**Version**: 1.0.0 | **Ratified**: 2026-11-17 | **Last Amended**: 2026-11-17
