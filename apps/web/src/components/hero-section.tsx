"use client";

import {
  type ChangeEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────────
 * Standalone dark-mode hero (Stripe / Linear / Ramp aesthetic).
 * Deliberately diverges from the light Payn token system — uses default
 * Tailwind zinc/emerald/teal scales. Self-contained: drop <HeroSection /> on
 * a full-bleed dark page.
 * ──────────────────────────────────────────────────────────────────────────── */

const MIN_SPEND = 500;
const MAX_SPEND = 10_000;
const STEP = 50;
/** Avg. hidden FX + fee spread vs. a sorted-by-cost pick. */
const SAVINGS_RATE = 0.035;
/** Elegant default physics, reused everywhere. */
const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

const euroFormatter = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const formatAmount = (n: number) => euroFormatter.format(Math.round(n));
const toPercent = (v: number) => ((v - MIN_SPEND) / (MAX_SPEND - MIN_SPEND)) * 100;

/* ── 1. OdometerDigit — a single clipped, slot-machine character cell ──────── */

const digitVariants: Variants = {
  // dir > 0 (increase): new enters from BELOW, old exits UP. dir < 0 reverses.
  enter: (dir: number) => ({ y: dir >= 0 ? "110%" : "-110%", opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: (dir: number) => ({ y: dir >= 0 ? "-110%" : "110%", opacity: 0 }),
};

function charWidth(char: string): string {
  if (/\d/.test(char)) return "1ch";
  if (char === ",") return "0.42ch";
  if (char === " ") return "0.5ch";
  return "0.72ch";
}

function OdometerDigit({ char, direction }: { char: string; direction: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden text-center"
      style={{ width: charWidth(char), height: "1em", lineHeight: 1 }}
    >
      {/* Swaps only when `char` (the key) changes; static chars never animate.
          Both spans are absolutely stacked so they slide past each other and
          get clipped by the overflow-hidden cell. */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.span
          key={char}
          custom={direction}
          variants={digitVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SPRING}
          className="absolute inset-0 flex items-center justify-center"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Odometer({ value, className = "" }: { value: number; className?: string }) {
  const previous = useRef(value);
  const direction = value === previous.current ? 0 : value > previous.current ? 1 : -1;
  useEffect(() => {
    previous.current = value;
  }, [value]);

  const chars = useMemo(() => formatAmount(value).split(""), [value]);

  return (
    <div
      className={`flex items-end font-semibold leading-none tracking-tight tabular-nums ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`€${formatAmount(value)} saved per year`}
    >
      <span className="mr-1.5 bg-gradient-to-br from-emerald-300 to-teal-300 bg-clip-text text-transparent">
        €
      </span>
      {/* `layout` springs the row width when the digit count crosses a
          thousands boundary, so the inserted comma + digit don't snap. */}
      <motion.div layout transition={SPRING} className="flex items-end" aria-hidden>
        {chars.map((char, i) => (
          <OdometerDigit key={i} char={char} direction={direction} />
        ))}
      </motion.div>
    </div>
  );
}

/* ── Magnetic CTA with a sweeping sheen ────────────────────────────────────── */

function CompareCTA() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_10px_40px_-8px_rgba(16,185,129,0.5)] outline-none transition-shadow hover:shadow-[0_14px_50px_-6px_rgba(16,185,129,0.6)] focus-visible:ring-2 focus-visible:ring-emerald-300 sm:w-auto"
    >
      <motion.span
        aria-hidden
        variants={{ rest: { x: "-160%" }, hover: { x: "160%" } }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-white/30 blur-md"
      />
      <span className="relative">Compare Live Offers</span>
      <svg
        className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <path
          d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

/* ── 2. SavingsCalculator — the interactive card ───────────────────────────── */

function SavingsCalculator() {
  const reduce = useReducedMotion();
  const [monthlySpend, setMonthlySpend] = useState(2_000);
  const totalSaved = Math.round(monthlySpend * 12 * SAVINGS_RATE);

  // Visual track fill lives entirely in a MotionValue → no React re-render on
  // drag for the gradient/thumb. State drives only the odometer, which itself
  // only re-renders cells whose displayed digit actually changes.
  const pct = useMotionValue(toPercent(2_000));
  const fill = useSpring(pct, { stiffness: 320, damping: 34, restDelta: 0.01 });
  const fillWidth = useMotionTemplate`${fill}%`;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setMonthlySpend(v);
    pct.set(toPercent(v));
  }

  return (
    <div className="relative">
      {/* Slow-pulsing glow behind the card */}
      <motion.div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-emerald-500/25 via-teal-400/15 to-transparent blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-7 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            Your estimated savings
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Live · 70+ banks
          </span>
        </div>

        <div className="mt-3">
          <Odometer value={totalSaved} className="text-6xl text-white sm:text-7xl" />
          <p className="mt-2 text-sm text-zinc-500">per year vs. your current bank</p>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm text-zinc-400">Monthly spend</span>
            <span className="text-base font-semibold tabular-nums text-white">
              €{formatAmount(monthlySpend)}
              <span className="ml-1 text-sm font-normal text-zinc-500">/mo</span>
            </span>
          </div>

          <div className="relative h-6">
            <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-zinc-800" />
            <motion.div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: fillWidth }}
            />
            <motion.div
              aria-hidden
              className="absolute top-1/2 h-5 w-5 rounded-full border border-emerald-200/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
              style={{ left: fillWidth, x: "-50%", y: "-50%" }}
            />
            <input
              type="range"
              min={MIN_SPEND}
              max={MAX_SPEND}
              step={STEP}
              value={monthlySpend}
              onChange={handleChange}
              aria-label="Monthly spend in euros"
              className="absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent opacity-0"
            />
          </div>

          <div className="mt-2 flex justify-between text-xs tabular-nums text-zinc-600">
            <span>€{formatAmount(MIN_SPEND)}</span>
            <span>€{formatAmount(MAX_SPEND)}</span>
          </div>
        </div>

        <div className="mt-8">
          <CompareCTA />
          <p className="mt-3 text-xs leading-relaxed text-zinc-600">
            Estimate based on a 3.5% blended FX + fee spread. Your real number is
            computed per provider from live rates — no affiliate weighting.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── 3. HeroSection — manifesto (left) + calculator (right) ────────────────── */

const containerVariants: Variants = { show: { transition: { staggerChildren: 0.08 } } };
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

const STATS = [
  { k: "70+", v: "banks compared" },
  { k: "Daily", v: "rate refresh" },
  { k: "€0", v: "affiliate weighting" },
] as const;

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
      {/* faint grid, masked to the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-600/15 blur-[120px]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
        <motion.div initial="hidden" animate="show" variants={containerVariants}>
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            No affiliate bias · sorted by real cost
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Financial comparison for people who{" "}
            <span className="bg-gradient-to-br from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              actually do the math.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400"
          >
            We check <span className="font-medium text-zinc-200">70+ European banks</span> every day
            and rank them by what they actually cost you — real FX spreads and hidden fees. Not
            commissions. Not who pays us.
          </motion.p>

          <motion.dl variants={itemVariants} className="mt-10 flex gap-8">
            {STATS.map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-semibold tabular-nums text-white">{s.k}</dt>
                <dd className="mt-0.5 text-sm text-zinc-500">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <SavingsCalculator />
      </div>
    </section>
  );
}
