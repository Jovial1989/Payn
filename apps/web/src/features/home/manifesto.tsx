"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, useInView, animate, AnimatePresence } from "motion/react";
import Link from "next/link";
import type { MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";

const MANIFESTO = {
  eyebrow: "This is Payn",
  lines: [
    { text: "We rebuilt", muted: true },
    { text: "financial comparison", muted: false },
    { text: "for people who", muted: true },
    { text: "actually do the maths.", muted: false },
  ],
  body: "Every other site sorts by who pays them most. We sort by what the product actually costs you — fees, FX spreads, APRs, all in. Then we tell you which links pay us anyway.",
  primaryCta: { label: "How we rank", href: "/how-we-rank" },
  secondaryCta: { label: "Read the founder story", href: "/about" },
};

function milestone(count: number, step: number) {
  if (count <= 0) return "0";
  const floored = Math.floor(count / step) * step;
  return Math.max(floored, step);
}

// ─── Clip-reveal line ─────────────────────────────────────────────────────────
// Each manifesto line lives inside an overflow-hidden clip box so it rises
// from behind a mask, Metalab-style, rather than just fading in.

function ClipLine({
  text,
  muted,
  delay,
  shouldReduce,
}: {
  text: string;
  muted: boolean;
  delay: number;
  shouldReduce: boolean;
}) {
  return (
    <motion.span
      className="block leading-[1.08]"
      style={{ color: muted ? "rgba(255,255,255,0.40)" : "#ffffff" }}
      initial={shouldReduce ? false : { opacity: 0, y: 22 }}
      whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
// For stat values like "200+" and "24h" — parses the number, springs from 0,
// then re-attaches the suffix.
// Uses animate(number, number, {onUpdate: setState}) — same safe pattern as
// atlas-grid.tsx, avoids direct DOM mutation that fights React reconciliation.

function AnimatedStat({
  raw,
  shouldReduce,
}: {
  raw: string;
  shouldReduce: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const hasAnimated = useRef(false);

  // Parse: "200+" → { num: 200, suffix: "+" }, "24h" → { num: 24, suffix: "h" }
  const match = raw.match(/^(\d+)(.*)$/);
  const targetNum = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || shouldReduce || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(0, targetNum, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setCount(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, targetNum, shouldReduce]);

  return (
    <p
      ref={ref}
      className="text-[2rem] font-extrabold leading-none tracking-[-0.06em] text-white sm:text-[2.4rem] md:text-[2.7rem]"
    >
      {shouldReduce ? raw : `${count}${suffix}`}
    </p>
  );
}

// ─── Live Compare widget ──────────────────────────────────────────────────────
// Cycles through real provider matchups every 3s, showing a clear winner.
// Lives in the left column ABOVE the eyebrow — fills the visual gap without
// touching the headline text.

const COMPARE_MATCHUPS = [
  {
    a: { name: "Wise",   metric: "0.41%", label: "FX Spread" },
    b: { name: "PayPal", metric: "2.99%", label: "FX Spread" },
    category: "International Transfer",
    winner: "a",
  },
  {
    a: { name: "Plum",           metric: "4.73%",  label: "AER"         },
    b: { name: "HSBC Savings",   metric: "1.00%",  label: "AER"         },
    category: "Savings Account",
    winner: "a",
  },
  {
    a: { name: "Revolut Metal",  metric: "1%",     label: "Cashback"    },
    b: { name: "Barclays Card",  metric: "0%",     label: "Cashback"    },
    category: "Credit Card",
    winner: "a",
  },
  {
    a: { name: "Trade Republic", metric: "4.00%",  label: "Annual Rate" },
    b: { name: "Santander",      metric: "2.40%",  label: "Annual Rate" },
    category: "Savings / Investment",
    winner: "a",
  },
];

function LiveCompare({ shouldReduce }: { shouldReduce: boolean }) {
  const [idx, setIdx] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (shouldReduce) return;
    const id = setInterval(() => {
      setFlash(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % COMPARE_MATCHUPS.length);
        setFlash(false);
      }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, [shouldReduce]);

  const m = COMPARE_MATCHUPS[idx];

  return (
    <motion.div
      className="mb-6 hidden lg:block"
      initial={shouldReduce ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.04] p-3 backdrop-blur-md">
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {m.category}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-emerald/80">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-emerald" />
            </span>
            Payn ranking
          </span>
        </div>

        {/* Two-provider comparison */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* Winner */}
          <motion.div
            animate={flash ? { opacity: 0.4 } : { opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-xl border border-accent-emerald/40 bg-accent-emerald/[0.08] p-3"
          >
            {/* Winner crown */}
            <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(15,138,75,0.5)]">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 7l1.5-4 2 2.5L7 3l1.5 4H1.5z" fill="white" />
              </svg>
            </div>
            <p className="text-[11px] font-semibold text-white/70 truncate">{m.a.name}</p>
            <p className="mt-1 text-[1.25rem] font-extrabold leading-none tracking-[-0.04em] text-accent-emerald">
              {m.a.metric}
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">{m.a.label}</p>
          </motion.div>

          {/* VS divider */}
          <span className="text-[11px] font-bold text-white/25">vs</span>

          {/* Loser */}
          <motion.div
            animate={flash ? { opacity: 0.4 } : { opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3"
          >
            <p className="text-[11px] font-semibold text-white/40 truncate">{m.b.name}</p>
            <p className="mt-1 text-[1.25rem] font-extrabold leading-none tracking-[-0.04em] text-white/30">
              {m.b.metric}
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/25">{m.b.label}</p>
          </motion.div>
        </div>

        {/* Savings callout */}
        <motion.div
          animate={flash ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-2.5 rounded-lg bg-accent-emerald/10 px-3 py-1.5 text-[11px] font-semibold text-accent-emerald/80"
        >
          Payn found the cheaper option — ranked by true cost, not commission.
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Live Offer Reel ─────────────────────────────────────────────────────────
// Infinite-scroll ticker showing real provider data from the Payn marketplace.
// Duplicates the item list so the loop is seamless — when the first copy exits
// left, the second copy is already in position and the animation resets silently.

const REEL_OFFERS = [
  { provider: "Wise", category: "Transfers", metric: "0.41% FX spread", color: "emerald" },
  { provider: "Trade Republic", category: "Savings", metric: "4% AER", color: "blue" },
  { provider: "Revolut Metal", category: "Cards", metric: "1% cashback", color: "emerald" },
  { provider: "bunq", category: "Savings", metric: "3.11% AER", color: "blue" },
  { provider: "Plum", category: "Savings", metric: "4.73% AER", color: "emerald" },
  { provider: "Lightyear", category: "Investments", metric: "€1 / month", color: "blue" },
  { provider: "N26", category: "Cards", metric: "€0 monthly fee", color: "emerald" },
  { provider: "Klarna Card", category: "Cards", metric: "Pay in 3", color: "blue" },
  { provider: "Curve", category: "Cards", metric: "Cashback on top", color: "emerald" },
];

function LiveOfferReel({ shouldReduce }: { shouldReduce: boolean }) {
  // Duplicate so the scroll loop is invisible
  const items = [...REEL_OFFERS, ...REEL_OFFERS];

  return (
    <motion.div
      className="relative mt-10 overflow-hidden"
      initial={shouldReduce ? false : { opacity: 0 }}
      whileInView={shouldReduce ? {} : { opacity: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
    >
      {/* Section label */}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-emerald" />
          </span>
          Live offers
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      {/* Left / right gradient fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#0B2B1C] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#0B2B1C] to-transparent" />

      {/* Scrolling strip */}
      <div
        className="flex w-max gap-2"
        style={
          shouldReduce
            ? {}
            : { animation: "payn-ticker 36s linear infinite" }
        }
      >
        {items.map((offer, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2.5 rounded-lg border border-white/[0.09] bg-white/[0.04] px-3.5 py-2 backdrop-blur-sm"
          >
            <span className="text-[13px] font-semibold text-white">{offer.provider}</span>
            <span
              className={
                offer.color === "emerald"
                  ? "text-[13px] font-bold text-accent-emerald"
                  : "text-[13px] font-bold text-[#60A5FA]"
              }
            >
              {offer.metric}
            </span>
            <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
              {offer.category}
            </span>
          </div>
        ))}
      </div>

      {/* CSS keyframe — injected once at component boundary */}
      <style>{`
        @keyframes payn-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface ManifestoProps {
  locale: MarketplaceLocale;
  productCount: number;
  providerCount: number;
}

export function Manifesto({ locale, productCount, providerCount }: ManifestoProps) {
  const shouldReduce = !!useReducedMotion();

  const proof = [
    { value: `${milestone(productCount, 50)}+`, label: "products live" },
    { value: `${milestone(providerCount, 10)}+`, label: "providers tracked" },
    { value: "30", label: "European markets" },
    { value: "24h", label: "max rate refresh" },
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-[#0B2B1C] px-5 py-12 text-white shadow-floating sm:rounded-4xl sm:px-12 sm:py-20 lg:px-16">
      {/* Layered emerald glows — animated drift */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent-emerald/30 blur-[140px]"
        animate={shouldReduce ? undefined : {
          x: [0, 60, -30, 0],
          y: [0, -50, 70, 0],
          scale: [1, 1.22, 0.88, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#10B981]/18 blur-[160px]"
        animate={shouldReduce ? undefined : {
          x: [0, -50, 40, 0],
          y: [0, 50, -60, 0],
          scale: [1, 0.86, 1.18, 1],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent lg:block" />

      <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-16">

        {/* ── Left: manifesto headline + body + CTAs ── */}
        <div className="min-w-0">
          {/* Live compare widget — fills the visual gap above the eyebrow on desktop */}
          <LiveCompare shouldReduce={shouldReduce} />

          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-emerald-soft/80"
            initial={shouldReduce ? false : { opacity: 0 }}
            whileInView={shouldReduce ? {} : { opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {MANIFESTO.eyebrow}
          </motion.p>

          {/* Clip-reveal headline — each line rises from behind its own mask */}
          <h2
            className="mt-6 text-[1.75rem] font-extrabold tracking-tight-3 sm:text-[2.2rem] sm:leading-[1.02] md:text-[3rem] lg:text-[3.5rem]"
          >
            {MANIFESTO.lines.map((line, i) => (
              <ClipLine
                key={i}
                text={line.text}
                muted={line.muted}
                delay={0.08 + i * 0.11}
                shouldReduce={shouldReduce}
              />
            ))}
          </h2>

          <motion.p
            className="mt-8 max-w-prose-narrow text-[16px] leading-relaxed text-white/75 sm:text-[18px]"
            initial={shouldReduce ? false : { opacity: 0, y: 14 }}
            whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.55, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {MANIFESTO.body}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={shouldReduce ? false : { opacity: 0, y: 14 }}
            whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={localePath(locale, MANIFESTO.primaryCta.href)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#0B2B1C] shadow-[0_4px_12px_rgba(255,255,255,0.12),0_12px_24px_rgba(255,255,255,0.10)] transition-transform hover:-translate-y-0.5"
            >
              {MANIFESTO.primaryCta.label}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href={localePath(locale, MANIFESTO.secondaryCta.href)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-[14px] font-semibold text-white/85 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.08]"
            >
              {MANIFESTO.secondaryCta.label}
            </Link>
          </motion.div>
        </div>

        {/* ── Right: proof tile cluster with animated counters ── */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {proof.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={[
                  "relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md transition-colors hover:bg-white/[0.08] sm:p-5",
                  i === 0 ? "lg:translate-y-2" : "",
                  i === 1 ? "lg:-translate-y-2" : "",
                  i === 2 ? "lg:translate-y-2" : "",
                  i === 3 ? "lg:-translate-y-2" : "",
                ].join(" ")}
                initial={shouldReduce ? false : { opacity: 0, y: 20, scale: 0.96 }}
                whileInView={shouldReduce ? {} : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.52, delay: 0.3 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatedStat raw={stat.value} shouldReduce={shouldReduce} />
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  {stat.label}
                </p>
                {i === 0 && (
                  <span className="absolute inset-x-5 bottom-3 h-px bg-gradient-to-r from-accent-emerald via-accent-emerald/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live offer reel — infinite-scroll ticker spanning full section width ── */}
      <LiveOfferReel shouldReduce={shouldReduce} />
    </section>
  );
}
