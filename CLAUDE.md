# Payn — Design System & Development Rules

## Project Overview
Payn is a European fintech marketplace. React + Next.js 16 + Tailwind 3 web app in a pnpm monorepo.

## Figma MCP Integration Rules

### Required Flow
1. Run `get_design_context` for the node
2. Run `get_screenshot` for visual reference
3. Translate output to this project's conventions
4. Validate against Figma for 1:1 parity

### Implementation Rules
- Treat Figma MCP output as design reference, not final code
- Reuse components from `apps/web/src/components/`
- Use the project's token system (Tailwind config + CSS variables)
- IMPORTANT: Never hardcode colors — use design tokens

## Component Organization
- UI primitives: `apps/web/src/components/` (button, tag, card, input)
- Feature components: `apps/web/src/features/{feature}/`
- Page routes: `apps/web/src/app/`
- Server services: `apps/web/src/server/`
- Shared types: `packages/types/src/`

## Design Token System

### Color Palette (Light Theme)
```
Backgrounds (CSS vars in globals.css):
  --bg-base:          #ffffff         (page / html background)
  --surface-base:     #ffffff         (cards, panels)
  --surface-muted:    #f5f7f4         (secondary surfaces, pill-chips)

Emerald accent:
  --emerald:          #0f8a4b         (primary actions, active states)
  --emerald-strong:   #0b6d3b         (hover states)
  --emerald-soft:     #ddf4e7         (tinted backgrounds)

Text:
  --ink-primary:      #111827         (headings, primary text)
  --ink-secondary:    #4b5563         (body text)
  --ink-tertiary:     #8a94a6         (labels, captions)
  --ink-inverse:      #ffffff         (text on emerald)

Borders:
  --line-subtle:      rgba(17, 24, 39, 0.08)
  --line-strong:      rgba(17, 24, 39, 0.14)
```

Tailwind tokens (tailwind.config.ts):
- `bg-white` / `bg-bg-surface` (#F5F7F4) / `bg-bg-overlay` (#EEF2EE)
- `text-ink` / `text-ink-secondary` / `text-ink-tertiary`
- `border-line` / `border-line-strong` / `border-line-active`
- `bg-accent-emerald-soft` + `text-accent-emerald-strong` (tinted emerald)
- `bg-accent-emerald` (#0F8A4B) for primary buttons/badges
- `bg-accent-blue` + `text-accent-blue-text` (blue tags)
- `bg-accent-orange` + `text-accent-orange-text` (orange tags)

### Typography Scale
- display: 4rem / 800 / -0.04em (hero headlines)
- h1: 2.75rem / 800 / -0.035em (page titles)
- h2: 2rem / 700 / -0.025em (section titles)
- h3: 1.25rem / 700 / -0.015em (card titles)
- body: 16px / 400 / normal (paragraphs)
- caption: 0.75rem / 600 / 0.04em uppercase (labels, eyebrows)

Font stack: Manrope, -apple-system, BlinkMacSystemFont, sans-serif

### Spacing Scale
4px base: 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64), 20(80), 24(96)

### Border Radius
- sm: 8px (tags, small elements)
- md: 12px (buttons, inputs)
- lg: 16px (cards)
- xl: 20–24px (panels, sections)
- 2xl: 28–40px (hero containers)

### Elevation (light-theme shadows)
- subtle:     shadow-subtle → 0 8px 20px rgba(15,23,32,0.04)
- card:       shadow-card → 0 10px 30px rgba(15,23,32,0.05)
- elevated:   shadow-elevated → 0 18px 48px rgba(15,23,32,0.08)
- card-hover: shadow-card-hover → 0 22px 56px rgba(15,23,32,0.10)
- glow:       0 18px 36px rgba(15,138,75,0.24) (emerald CTA)

## Styling Rules
- IMPORTANT: Use Tailwind utility classes
- IMPORTANT: All colors come from tailwind.config.ts theme extension
- Global CSS variables defined in globals.css
- No inline styles
- Responsive: mobile-first (sm → md → lg → xl)

## Asset Rules
- If Figma MCP returns localhost source, use directly
- Store static assets in `apps/web/public/`
- SVG icons inline as React components
- No external icon libraries

## Code Conventions
- TypeScript strict mode
- Named exports (no default exports for components)
- Path alias: `@/*` maps to `./src/*`
- Server components by default, `"use client"` only when needed

## Deploy Workflow
- IMPORTANT: After every code change run `vercel --prod --yes` from the monorepo root
- payn.online is aliased to the production deployment — no separate "deploy to prod" step needed
- Always verify with `next build` first; never deploy a build that fails typecheck or has warnings
- Do not ask before deploying — assume the user wants every change live
