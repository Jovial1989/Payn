# Responsive Grid Traps

## When to load this skill
- CSS Grid work anywhere in the codebase
- Flex layouts, marquee components, multi-column responsive UIs
- Layout shifts, horizontal scroll, content overflowing viewport
- Touching `ProviderStrip`, `AtlasGrid`, `home-page.tsx`, `payn-shell.tsx`, drawer/sidebar components
- Bug report: "content bleeds off screen", "horizontal scrollbar appeared", "card grid went horizontal"

## TL;DR
- **`min-w-0` is mandatory on all grid children** that contain text, images, or `whitespace-nowrap` content.
- **CSS Grid default `min-width: min-content`** — without `min-w-0`, a child with long text or `whitespace-nowrap` expands the column and breaks the layout.
- **Mobile-first breakpoints:** `sm:640` `md:768` `lg:1024` `xl:1280` — always start with the mobile layout.
- **Overflow on marquee containers:** `overflow-hidden` on the wrapper, `whitespace-nowrap` inside.
- **Touch targets:** minimum 44×44px (`p-3` minimum on tappable elements).

## The pattern

### The min-w-0 rule — most critical

CSS Grid columns have `min-width: min-content` by default. If a grid child contains:
- Text that doesn't wrap (`whitespace-nowrap`)
- A wide image
- A flex row that doesn't shrink

...then the child expands to its content width, blowing the grid column past the container.

```tsx
// ❌ Broken — grid cell expands to match whitespace-nowrap child
<div className="grid grid-cols-3">
  <div>
    <p className="whitespace-nowrap">Very long provider name that won't wrap</p>
  </div>
</div>

// ✅ Fixed — min-w-0 allows the grid cell to shrink below min-content
<div className="grid grid-cols-3">
  <div className="min-w-0">
    <p className="truncate">Very long provider name that won't wrap</p>
  </div>
</div>
```

### Standard card grid

```tsx
// Category pages, explore page
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {offers.map((o) => (
    <div key={o.id} className="min-w-0">  {/* min-w-0 on every grid child */}
      <OfferCardAtlas offer={o} locale={locale} />
    </div>
  ))}
</div>
```

### ProviderStrip marquee — overflow-hidden + whitespace-nowrap pattern

```tsx
// The marquee pattern: outer clips overflow, inner scrolls
<div className="overflow-hidden">  {/* clips the scrolling content */}
  <div className="flex animate-marquee whitespace-nowrap gap-6">
    {/* doubled list for seamless loop */}
    {[...providers, ...providers].map((p, i) => (
      <div key={`${p.id}-${i}`} className="flex shrink-0 items-center gap-2">
        <Image src={p.logo} width={24} height={24} className="shrink-0" />
        <span className="text-sm font-medium text-ink-secondary">{p.name}</span>
      </div>
    ))}
  </div>
</div>
```

`overflow-hidden` on the wrapper is the critical piece. Without it, the `whitespace-nowrap` inner div expands the parent and the viewport.

### AtlasGrid — grid with min-w-0 guards

```tsx
// AtlasGrid bucket grid
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {buckets.map((bucket) => (
    <div key={bucket.id} className="min-w-0 flex flex-col">
      <AtlasBucketCard bucket={bucket} />
    </div>
  ))}
</div>
```

### Sidebar layout — sticky on desktop, drawer on mobile

```tsx
// Page layout with sidebar
<div className="grid gap-6 lg:grid-cols-[248px_1fr]">
  {/* Sidebar */}
  <aside className="hidden lg:block lg:sticky lg:top-5 lg:self-start">
    <SiteNav />
  </aside>

  {/* Main content */}
  <main className="min-w-0">  {/* CRITICAL: main must have min-w-0 in grid context */}
    {children}
  </main>
</div>

// Mobile drawer
<div className={`
  fixed inset-y-0 left-0 z-50 w-[min(88vw,340px)]
  transform transition-transform duration-300
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  bg-white shadow-elevated
`}>
  <SiteNav />
</div>

{/* Backdrop */}
{isOpen && (
  <div
    className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
    onClick={close}
  />
)}
```

### Flex children that must shrink — min-w-0

```tsx
// OfferRowAtlas title area — must truncate long names
<div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-[0_0_260px]">
  <div className="flex h-12 w-12 shrink-0 items-center justify-center ...">
    {/* logo — shrink-0 prevents logo from collapsing */}
  </div>
  <div className="min-w-0">  {/* allows text to truncate */}
    <p className="truncate text-[15px] font-bold text-ink">{offer.title}</p>
    <p className="truncate text-[12px] text-ink-tertiary">
      {offer.providerName} · {offer.category}
    </p>
  </div>
</div>
```

### Touch targets — minimum 44×44px

```tsx
// ✅ Adequate touch target
<button className="p-3 rounded-xl">  {/* 12px padding = 48px+ touch area */}
  <MenuIcon />
</button>

// ❌ Too small — icon-only with minimal padding
<button className="p-1">  {/* 4px padding — ~24px total, too small */}
  <MenuIcon />
</button>

// Invisible tap zone trick for small icons
<button className="relative p-1">
  <span className="absolute inset-[-8px]" />  {/* extend hit area */}
  <MenuIcon className="h-5 w-5" />
</button>
```

### Breakpoint reference

```
sm: 640px  — 2-col card grids start here
md: 768px  — sidebar metrics visible in OfferRowAtlas ("hidden md:flex")
lg: 1024px — 3-col grids, sticky sidebar visible, drawer hidden
xl: 1280px — wider containers, larger gaps
```

Common patterns:
```tsx
// Cards
"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"

// Two-panel with sidebar
"grid lg:grid-cols-[248px_1fr]"

// Admin two-panel
"grid gap-6 lg:grid-cols-[1.4fr_0.6fr]"

// Row center metrics (desktop only)
"hidden md:flex"

// Hamburger (mobile only)
"lg:hidden"
```

## Anti-patterns — DO NOT do these

```tsx
// ❌ Grid child with whitespace-nowrap and no min-w-0
<div className="grid grid-cols-3">
  <ProviderStrip />  {/* has whitespace-nowrap inside — blows the grid */}
</div>

// ❌ Fixed widths in flex without shrink control
<div className="flex">
  <div className="w-[300px]">Sidebar</div>  {/* won't shrink on mobile */}
  <div>Content</div>
</div>

// ❌ Different breakpoints for "the same" layout concept
// One component: sm:grid-cols-2
// Another: md:grid-cols-2
// Pick one and stick to it — sm for 2-col card grids

// ❌ overflow-x-auto on body to "fix" layout blowout
// This masks the bug; fix the min-w-0 instead

// ❌ md:hidden instead of hidden md:flex
// This hides on DESKTOP — opposite of what you usually want
<div className="md:hidden">  {/* only visible on mobile — is that what you meant? */}

// ❌ Forgetting shrink-0 on icons/logos in flex rows
<div className="flex items-center gap-3">
  <Image src={logo} className="h-8 w-8" />  {/* no shrink-0 — logo collapses */}
  <span className="truncate">{name}</span>
</div>
// Fix: add shrink-0 to the Image wrapper
```

## Real bugs we've hit

**Bug: ProviderStrip marquee blew past viewport width (March 2026)**

- Symptom: The hero section provider strip (Wise, Revolut, N26...) caused horizontal scroll on mobile. Hero card stack drifted right. `AtlasGrid` rendered as a horizontal stripe instead of 3-col grid.
- Root cause: `ProviderStrip` used `whitespace-nowrap` on the scrolling inner div. This div was a grid child without `min-w-0`. CSS Grid gave the cell `min-width: min-content` → the full width of the marquee expanded the grid column → entire hero blew out.
- Scope: Required `min-w-0` fixes on **10 components** — `home-page.tsx` (grid wrapper), `atlas-grid.tsx` (bucket grid children), `provider-strip.tsx` (+ `overflow-hidden` on wrapper), `whats-new.tsx`, `how-it-works.tsx`.
- Detection: spotted visually in mobile Chrome dev tools at 375px.
- Lesson: any time you use `whitespace-nowrap`, check every ancestor up to the nearest `grid` or `flex` container and add `min-w-0`/`overflow-hidden` as needed.

## Checklist before shipping

- [ ] Every grid child that contains text or `whitespace-nowrap` has `min-w-0`
- [ ] Every main content area in a sidebar layout has `min-w-0`
- [ ] `ProviderStrip` or marquee wrapper has `overflow-hidden`
- [ ] Logo/icon in flex row has `shrink-0`
- [ ] Text that can overflow in a narrow context has `truncate` (not just `overflow-hidden`)
- [ ] Touch targets are at least `p-3` / 44px in each direction
- [ ] Mobile layout tested at 375px width before shipping
- [ ] Breakpoints used consistently (`sm:` for 2-col, `lg:` for sidebar reveal)
- [ ] `hidden md:flex` vs `md:hidden` used correctly (former = mobile-hide; latter = desktop-hide)
