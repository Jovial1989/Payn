# Motion Best Practices

## When to load this skill
- Any file that imports from `"motion/react"` or `"framer-motion"`
- Working on hover states, scroll reveals, count-up animations, entrance transitions
- Touching `ScrambleNumber`, `MotionReveal`, `AtlasGrid`, `OfferCardAtlas`, `OfferRowAtlas`, `home-page.tsx`
- Bug report: "animation restarts on hover", "component flickers", "count restarts"

## TL;DR
- **Always gate with `useReducedMotion()`** — pass `undefined` to motion props when reduced.
- **Never create `motion(Tag)` inline** — hoist to module scope or `useMemo`. Inline = new component type every render = full remount.
- **Module-level `Set`/`Map` for one-shot animations** — the only reliable way to prevent re-play across renders.
- **`variants` prop over inline style objects** — defined once at module scope, never recreated.
- **`AnimatePresence` only for actual unmounting** — not for toggling visible states.

## The pattern

### 1. Reduced-motion gate — mandatory on every animated component

```tsx
import { motion, useReducedMotion } from "motion/react";

export function OfferCardAtlas({ offer, locale }: OfferCardAtlasProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduce ? undefined : cardVariants}
      initial={shouldReduce ? undefined : "rest"}
      whileHover={shouldReduce ? undefined : "hover"}
      whileTap={shouldReduce ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* ... */}
    </motion.div>
  );
}
```

### 2. Module-level variants — never inline

```tsx
// ✅ Module scope — created once, stable reference
const cardVariants = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px rgba(15,23,32,0.06)",
    borderColor: "rgba(17,24,39,0.08)",
  },
  hover: {
    y: -3,
    boxShadow: "0 8px 24px -8px rgba(16,185,129,0.20)",
    borderColor: "#10B981",
  },
};

const rowVariants = {
  rest:  { y: 0,  borderColor: "rgba(17,24,39,0.08)" },
  hover: { y: -1, borderColor: "rgba(16,185,129,0.4)" },
};

// Used in OfferRowAtlas:
<motion.div variants={rowVariants} initial="rest" whileHover="hover" whileTap={{ scale: 0.995 }}>
```

### 3. Module-level Set for one-shot animations

When an animation must play ONCE per value and never replay (e.g. count-up, scramble):

```tsx
// ✅ Module-level — survives component unmount/remount, never resets
const PLAYED_VALUES = new Set<string | number>();

export function ScrambleNumber({ value, ... }: ScrambleNumberProps) {
  const alreadyPlayed = PLAYED_VALUES.has(value);

  useEffect(() => {
    if (alreadyPlayed) return;
    PLAYED_VALUES.add(value);
    // start animation
  }, [value, alreadyPlayed]);
}
```

This is the fix for the ScrambleNumber bug (see Real bugs).

### 4. motion(Tag) — never inline, always module or useMemo scope

```tsx
// ❌ Wrong — creates NEW component type on every render → remounts children
export function MotionReveal({ tag = "div", children }) {
  const Tag = motion(tag);  // new identity every render!
  return <Tag>{children}</Tag>;
}

// ✅ Fix option A — memoize the component type
export function MotionReveal({ tag = "div", children }) {
  const Tag = useMemo(() => motion(tag), [tag]);
  return <Tag>{children}</Tag>;
}

// ✅ Fix option B — hoist to module scope (preferred for fixed tags)
const MotionDiv = motion("div");
const MotionSection = motion("section");
```

### 5. Variants inheritance — parent → children

Children inherit `rest`/`hover` state from parent when they also declare `variants`:

```tsx
const logoVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.05 },
};

// In OfferCardAtlas:
<motion.div variants={cardVariants} initial="rest" whileHover="hover">
  {/* Logo inherits "rest"/"hover" from parent automatically */}
  <motion.div variants={logoVariants} transition={{ duration: 0.2 }}>
    <Image src={logo} ... />
  </motion.div>
</motion.div>
```

### 6. AnimatePresence — only for real unmounting

```tsx
// ✅ Real unmount — AnimatePresence appropriate
{isOpen && (
  <AnimatePresence>
    <motion.div key="drawer" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}>
      <Drawer />
    </motion.div>
  </AnimatePresence>
)}

// ❌ State toggle — use animate prop, NOT AnimatePresence
// AnimatePresence here causes flicker as element mounts/unmounts
<AnimatePresence>
  {isVisible ? (
    <motion.div key="a">Content A</motion.div>
  ) : (
    <motion.div key="b">Content B</motion.div>
  )}
</AnimatePresence>

// ✅ Better for toggle:
<motion.div animate={{ opacity: isVisible ? 1 : 0 }} transition={{ duration: 0.2 }}>
  Content
</motion.div>
```

### 7. Key prop stability

```tsx
// ❌ Random key — remounts on every render
<motion.div key={Math.random()}>...</motion.div>

// ❌ Composite key from hover state — remounts when hover changes
{offers.map((o, i) => (
  <motion.div key={`${hoveredCard}-${i}`}>...</motion.div>
))}

// ✅ Stable identity key
{offers.map((o) => (
  <motion.div key={o.id}>...</motion.div>
))}
```

### 8. Performance — prefer transform + opacity

```tsx
// ✅ GPU-composited — no layout recalc
animate={{ opacity: 1, y: 0, scale: 1 }}

// ❌ Triggers layout — expensive on lists
animate={{ width: "100%", height: "auto", marginTop: 16 }}
```

### 9. whileTap for mobile

```tsx
// Standard tap feedback for offer cards
whileTap={shouldReduce ? undefined : { scale: 0.97 }}

// Lighter tap for rows (less travel)
whileTap={shouldReduce ? undefined : { scale: 0.995 }}
```

## Anti-patterns — DO NOT do these

```tsx
// ❌ Inline variants object — recreated every render
<motion.div
  variants={{ rest: { y: 0 }, hover: { y: -3 } }}  // new object every render
  whileHover="hover"
>

// ❌ Double whileHover conflict
<motion.div whileHover={{ scale: 1.02 }}>        {/* outer */}
  <motion.div whileHover={{ borderColor: "green" }}>  {/* inner — conflicts */}

// ❌ Tailwind hover AND motion whileHover together
<motion.div
  className="hover:shadow-lg"         // Tailwind hover
  whileHover={{ boxShadow: "..." }}   // motion hover — both fire, fight each other
>

// ❌ AnimatePresence on a stable list
<AnimatePresence>
  {offers.map((o) => (
    <motion.li key={o.id} exit={{ opacity: 0 }}>  // exit never fires unless item removed
      <OfferRowAtlas offer={o} />
    </motion.li>
  ))}
</AnimatePresence>

// ❌ Missing useReducedMotion gate
export function HeroCard() {
  // no shouldReduce check — fails a11y requirements
  return <motion.div whileHover={{ y: -3 }}>...</motion.div>;
}
```

## Real bugs we've hit

**Bug: ScrambleNumber restarted on every hero card hover (March 2026)**

- Symptom: The animated count-up numbers in the hero section (e.g. "€2.1M saved") restarted from 0 every time a user hovered an `OfferCardAtlas` nearby.
- Failed fix 1: Empty `useEffect` deps array — animation still restarted because component was remounting.
- Failed fix 2: `startedRef` guard inside the effect — same result, ref was lost on remount.
- Failed fix 3: `useMemo(() => motion(tag), [tag])` inside `MotionReveal` — reduced restarts but didn't eliminate them.
- Root cause: `MotionReveal` was calling `motion(tag)` inline (not memoized), so every render produced a new component *type*. React unmounted and remounted the entire subtree including `ScrambleNumber`. The memoize was applied in the wrong place.
- Real fix: Module-level `PLAYED_VALUES = new Set()` in `scramble-number.tsx` — the Set lives outside React, so it survives component remounts. Even if the component remounts, it checks the Set and skips the animation.
- Lesson: when "component restarts despite stable code", look **up** the tree for an ancestor that creates `motion(Tag)` inline.

**Bug: MotionReveal caused hero section remount on every render (March 2026)**

- Root cause: `MotionReveal` accepted a `tag` prop and called `motion(tag)` on every render = new component type identity = full child subtree remount.
- Fix: `useMemo(() => motion(tag), [tag])` inside `MotionReveal`.
- Commit reference: `fix(motion-reveal): memoize motion(Tag) to prevent child remount on parent re-render`

## Checklist before shipping

- [ ] Every animated component calls `useReducedMotion()` and passes `undefined` to motion props when true
- [ ] All `variants` objects are at module scope (not inline JSX)
- [ ] No `motion(Tag)` created inside a render function without `useMemo`
- [ ] One-shot animations use module-level `Set`/`Map` for play-tracking
- [ ] Keys on animated lists use stable IDs (not index, not random)
- [ ] `AnimatePresence` only wraps elements that genuinely unmount (conditional render)
- [ ] No mixing of Tailwind `hover:` classes and `whileHover` on the same element
- [ ] `whileTap` provides touch feedback on interactive cards (scale 0.97–0.995)
- [ ] Animation properties use `transform` + `opacity` (not layout properties like width/height)
