"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";

// Manifesto — sits between the AtlasGrid (functional nav) and WhatsNew
// (timely signal). Its job is to tell the visitor who Payn actually is, in
// the brand's voice, with typography that earns the screen real estate.
//
// Copy is intentionally English-only and inlined here rather than threaded
// through the 6-locale dictionary because:
//   1. It's brand-statement prose, not UI plumbing — translating it
//      well needs a copywriter per locale, not Google Translate.
//   2. Keeping it isolated means a non-EN visitor still sees the section
//      while we wait on locale-ready copy.
// When we ship localised manifestos, lift this into i18n.ts.
const MANIFESTO = {
  eyebrow: "This is Payn",
  // 4 short lines stacked — each emphasised differently so the eye climbs.
  // The verbs are chosen to be active: rebuilt, refused, refused, refused.
  lines: [
    { text: "We rebuilt", muted: true },
    { text: "financial comparison", muted: false },
    { text: "for people who", muted: true },
    { text: "actually do the maths.", muted: false },
  ],
  body:
    "Every other site sorts by who pays them most. We sort by what the product actually costs you — fees, FX spreads, APRs, all in. Then we tell you which links pay us anyway.",
  proof: [
    { value: "350+", label: "products live" },
    { value: "80+", label: "providers tracked" },
    { value: "30", label: "European markets" },
    { value: "24h", label: "max rate refresh" },
  ],
  primaryCta: { label: "How we rank", href: "/how-we-rank" },
  secondaryCta: { label: "How we make money", href: "/how-we-make-money" },
};

interface ManifestoProps {
  locale: MarketplaceLocale;
}

export function Manifesto({ locale }: ManifestoProps) {
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden rounded-4xl bg-[#0B2B1C] px-6 py-14 text-white shadow-floating sm:px-12 sm:py-20 lg:px-16">
      {/* Layered emerald glows + dot grid for depth. The glows are positioned
          so the eye reads top-left → bottom-right diagonally, which is the
          natural reading flow. */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent-emerald/30 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#10B981]/18 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent lg:block" />

      <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        {/* ── Left: manifesto headline + body + CTAs ── */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-emerald-soft/80">
            {MANIFESTO.eyebrow}
          </p>

          {/* Big stacked headline. The "muted" lines use white/45 so the
              emphasised lines pop. Word-by-word blur-in keeps it from feeling
              like a static block on entry. */}
          <h2 className="mt-6 text-[2.2rem] font-extrabold leading-[1.02] tracking-tight-3 sm:text-[3rem] lg:text-[3.5rem]">
            {MANIFESTO.lines.map((line, i) => (
              <motion.span
                key={i}
                className="block"
                style={{ color: line.muted ? "rgba(255,255,255,0.45)" : "#ffffff" }}
                initial={shouldReduce ? false : { opacity: 0, y: 12 }}
                whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {line.text}
              </motion.span>
            ))}
          </h2>

          <motion.p
            className="mt-8 max-w-prose-narrow text-[16px] leading-relaxed text-white/75 sm:text-[18px]"
            initial={shouldReduce ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {MANIFESTO.body}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={shouldReduce ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
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

        {/* ── Right: proof tile cluster ──
            Four big-number tiles. Two-column stack on lg+, single column
            below. We render them in a slight staircase by giving every tile
            its own initial offset so the cluster has visual rhythm rather
            than a strict grid. */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-3">
            {MANIFESTO.proof.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={[
                  "relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md transition-colors hover:bg-white/[0.08]",
                  i === 0 ? "lg:translate-y-2" : "",
                  i === 1 ? "lg:-translate-y-2" : "",
                  i === 2 ? "lg:translate-y-2" : "",
                  i === 3 ? "lg:-translate-y-2" : "",
                ].join(" ")}
                initial={shouldReduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
                whileInView={shouldReduce ? {} : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[2.4rem] font-extrabold leading-none tracking-[-0.06em] text-white sm:text-[2.7rem]">
                  {stat.value}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  {stat.label}
                </p>
                {/* Subtle bottom emerald highlight just under each number,
                    only on the top-left tile (the anchor) — keeps the cluster
                    from feeling flat. */}
                {i === 0 && (
                  <span className="absolute inset-x-5 bottom-3 h-px bg-gradient-to-r from-accent-emerald via-accent-emerald/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
