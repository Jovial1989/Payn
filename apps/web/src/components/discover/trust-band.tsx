"use client";

import { motion, useReducedMotion } from "motion/react";
import { discoverCopy as t } from "@/copy/discover.en";

// Each pillar gets its own SVG glyph rather than an emoji or icon-library
// dependency — keeps the wordmark/icon weight consistent with the rest of the
// page and means no shifts when the icon font loads. All four are inline
// so the band ships zero extra requests.
const PILLAR_ICONS = [
  // Live data — pulse line
  (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12h4l2-6 4 12 2-6h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // No pay-to-win — scale / balance
  (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v16M6 8h12M5 13l1-5 1 5a2 2 0 11-2 0zm12 0l1-5 1 5a2 2 0 11-2 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Eligibility — filter funnel
  (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16l-6 8v6l-4-2v-4L4 5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Human help — speech bubble
  (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
] as const;

export function TrustBand() {
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-[#0B2B1C] via-[#0F3D2A] to-[#0B6D3B] px-6 py-10 text-white shadow-elevated sm:px-10 sm:py-12">
      {/* Dot-grid texture — gives the dark panel weight without a real
          background image. Mirrors the grid texture in the hero so the page
          reads as one design system, not stacked stock components. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-emerald/20 blur-3xl" />

      <div className="relative">
        <div className="mb-7 max-w-[44ch]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-emerald-soft/80">
            {t.trustBand.eyebrow}
          </p>
          <h2 className="mt-3 text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[2.1rem]">
            {t.trustBand.heading}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.trustBand.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={shouldReduce ? false : { opacity: 0, y: 12 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-[20px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.10]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-emerald-soft/15 text-accent-emerald-soft transition-transform group-hover:scale-110">
                <span className="block h-5 w-5">{PILLAR_ICONS[i]}</span>
              </div>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-soft/70">
                {pillar.kicker}
              </p>
              <p className="mt-1.5 text-[15px] font-bold leading-tight">{pillar.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
