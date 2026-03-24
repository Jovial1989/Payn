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

### Color Palette
```
Background layers:
  --bg-deep:      #040907    (page background)
  --bg-base:      #070E0B    (main canvas)
  --bg-elevated:  #0C1A15    (cards, panels)
  --bg-surface:   #111F1A    (interactive surfaces)
  --bg-overlay:   #162A23    (hover states, modals)

Primary (emerald):
  --primary-400:  #34D399    (highlights, accents)
  --primary-500:  #10B981    (primary actions)
  --primary-600:  #059669    (hover states)
  --primary-700:  #047857    (active/pressed)

Secondary (teal):
  --secondary-400: #2DD4BF
  --secondary-500: #14B8A6
  --secondary-600: #0D9488

Text:
  --text-primary:   #F0FDF4
  --text-secondary: #94A3B8
  --text-tertiary:  #64748B

Borders:
  --border-subtle:  rgba(255, 255, 255, 0.06)
  --border-default: rgba(255, 255, 255, 0.10)
  --border-active:  rgba(16, 185, 129, 0.4)
```

### Typography Scale
- Display: 56px / 700 / -0.03em (hero headlines)
- H1: 40px / 700 / -0.025em (page titles)
- H2: 28px / 600 / -0.02em (section titles)
- H3: 20px / 600 / -0.015em (card titles)
- Body: 16px / 400 / normal (paragraphs)
- Small: 14px / 400 / normal (secondary text)
- Caption: 12px / 500 / 0.04em uppercase (labels, eyebrows)

Font stack: Inter, -apple-system, BlinkMacSystemFont, sans-serif

### Spacing Scale
4px base: 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64), 20(80), 24(96)

### Border Radius
- sm: 8px (tags, small elements)
- md: 12px (buttons, inputs)
- lg: 16px (cards)
- xl: 20px (panels, sections)
- 2xl: 24px (hero containers)

### Elevation
- Level 0: none (flat)
- Level 1: 0 1px 2px rgba(0,0,0,0.3) (subtle lift)
- Level 2: 0 4px 12px rgba(0,0,0,0.4) (cards)
- Level 3: 0 8px 24px rgba(0,0,0,0.5) (elevated panels)
- Glow: 0 0 20px rgba(16,185,129,0.15) (primary actions)

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
