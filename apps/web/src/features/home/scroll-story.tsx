"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

// ─── Step data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    eyebrow: "Step 1",
    title: "Tell us your situation",
    body: "Pick what you're trying to do — save more, send money, get a card. Payn filters 350+ products instantly.",
    glyph: "01",
  },
  {
    num: "02",
    eyebrow: "Step 2",
    title: "We rank what matters",
    body: "Every offer is scored on rate, fees, access, and eligibility — not who pays us the most.",
    glyph: "02",
  },
  {
    num: "03",
    eyebrow: "Step 3",
    title: "Compare side by side",
    body: "Add up to 4 products to a live comparison table. See exactly what you'd save switching today.",
    glyph: "03",
  },
  {
    num: "04",
    eyebrow: "Step 4",
    title: "Switch in under 2 minutes",
    body: "Click through to open the offer directly. No re-entering your details, no middleman.",
    glyph: "04",
  },
] as const;

const N = STEPS.length;
// Container taller than one screen so sticky child can pin for the scroll range.
// Total scroll range = height - 100vh. At 300vh → 200vh of scroll (50vh / step).
const CONTAINER_VH = 320;

// ─── Per-step slide (runs entirely inside the sticky panel) ──────────────────

function StepSlide({
  index,
  step,
  progress,
}: {
  index: number;
  step: (typeof STEPS)[number];
  progress: MotionValue<number>;
}) {
  // Each step owns [index/N … (index+1)/N] of the 0-1 scroll range.
  const enter = index / N;
  const exit = (index + 1) / N;

  // Slight overlap so cross-fade is smooth rather than a hard cut.
  // Clamp to [0, 1] — WAAPI ScrollTimeline (used by motion v12 for scroll-linked
  // style values) requires all keyframe offsets to be within [0, 1]. Steps at the
  // very start (enter=0) and end (exit=1) would otherwise produce negative or >1
  // offset values that throw "Offsets must be monotonically non-decreasing".
  const opacity = useTransform(
    progress,
    [Math.max(0, enter - 0.03), enter + 0.09, exit - 0.09, Math.min(1, exit + 0.01)],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [Math.max(0, enter - 0.06), enter + 0.06, exit - 0.06, exit],
    ["28px", "0px", "0px", "-20px"],
  );

  return (
    <motion.div
      aria-hidden={index !== 0}
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center px-6 sm:px-12 lg:px-20"
    >
      <div className="grid w-full max-w-4xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        {/* ── Left: text ── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
            {step.eyebrow} of {N}
          </p>
          <h3 className="mt-5 text-[2rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-[2.6rem] lg:text-[3rem]">
            {step.title}
          </h3>
          <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-white/65 sm:text-[17px]">
            {step.body}
          </p>
        </div>

        {/* ── Right: giant ghost glyph ── */}
        <div
          aria-hidden="true"
          className="flex items-center justify-center lg:justify-end"
        >
          <span
            className="select-none font-extrabold leading-none tracking-[-0.08em] text-white"
            style={{
              fontSize: "clamp(7rem, 18vw, 14rem)",
              opacity: 0.07,
            }}
          >
            {step.glyph}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Progress dot (one per step — hooks at component top level) ───────────────

function ProgressDot({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const enter  = index / N;
  const exit   = (index + 1) / N;
  const center = (enter + exit) / 2;

  // Clamp to [0, 1] — same WAAPI ScrollTimeline requirement as StepSlide above.
  const scale   = useTransform(progress, [Math.max(0, center - 0.12), center, Math.min(1, center + 0.12)], [1, 1.7, 1]);
  const opacity = useTransform(progress, [Math.max(0, enter - 0.04), enter + 0.08, exit - 0.08, Math.min(1, exit + 0.02)], [0.3, 1, 1, 0.3]);

  return (
    <motion.span
      className="block h-1.5 w-1.5 rounded-full bg-white"
      style={{ scale, opacity }}
    />
  );
}

// ─── Progress dots row ────────────────────────────────────────────────────────

function ProgressDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2"
    >
      {STEPS.map((_, i) => (
        <ProgressDot key={i} index={i} progress={progress} />
      ))}
    </div>
  );
}

// ─── Reduced-motion fallback ──────────────────────────────────────────────────

function StaticStory() {
  return (
    <section className="bg-accent-emerald px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-10 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          How it works
        </p>
        <div className="grid gap-10 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold leading-snug text-white">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/65">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ScrollStory() {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return <StaticStory />;

  return <ScrollStoryAnimated />;
}

function ScrollStoryAnimated() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    // Tall container; sticky child pins inside it.
    // overflow-clip stops the tall container from widening the scrollbar.
    <div
      ref={containerRef}
      style={{ height: `${CONTAINER_VH}vh` }}
      className="relative overflow-clip"
    >
      {/* ── Sticky panel ── */}
      <div className="sticky top-0 h-screen overflow-hidden bg-accent-emerald">
        {/* Dot grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60"
        />
        {/* Corner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-[40rem] w-[40rem] rounded-full bg-[#0b6d3b]/60 blur-[120px]"
        />

        {/* Eyebrow — stays pinned top-left */}
        <p className="absolute left-6 top-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35 sm:left-12">
          How it works
        </p>

        {/* Steps — each absolutely fills the panel and cross-fades */}
        {STEPS.map((step, i) => (
          <StepSlide
            key={step.num}
            index={i}
            step={step}
            progress={scrollYProgress}
          />
        ))}

        {/* Scroll progress dots */}
        <ProgressDots progress={scrollYProgress} />
      </div>
    </div>
  );
}
