"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import Link from "next/link";
import type { MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";
import { ScrambleNumber } from "@/features/home/scramble-number";

// Three concrete money examples — these are the questions visitors actually
// ask themselves. Numbers reference real provider terms; they're conservative
// (we don't claim the worst-case high-street bank rates), so the comparison
// reads as honest, not as marketing spin.
interface Scenario {
  readonly id: string;
  readonly icon: "transfer" | "card" | "savings";
  readonly setup: string;
  readonly bankLabel: string;
  readonly bankCost: number;
  readonly paynLabel: string;
  readonly paynCost: number;
  readonly saved: number;
  /** When true the delta is interest earned (savings scenario), not fees
   *  saved — copy flips from "Save" to "Earn". */
  readonly earnedNotSaved: boolean;
  readonly href: string;
  readonly pillCopy: string;
}

const SCENARIOS: readonly Scenario[] = [
  {
    id: "transfer",
    icon: "transfer",
    setup: "Sending €10,000 a year abroad",
    bankLabel: "High-street bank",
    bankCost: 320, // ~3.2% all-in
    paynLabel: "Cheapest on Payn",
    paynCost: 41,  // Wise typical
    saved: 279,
    earnedNotSaved: false,
    href: "/transfers",
    pillCopy: "Transfers",
  },
  {
    id: "card",
    icon: "card",
    setup: "Spending €5,000 abroad on holiday",
    bankLabel: "Standard debit card",
    bankCost: 165, // ~3.3% FX + fees
    paynLabel: "Top travel card",
    paynCost: 0,
    saved: 165,
    earnedNotSaved: false,
    href: "/travel",
    pillCopy: "Travel cards",
  },
  {
    id: "savings",
    icon: "savings",
    setup: "Holding €25,000 in savings for a year",
    bankLabel: "Big-bank current account",
    bankCost: -25, // earns near-zero
    paynLabel: "Top easy-access in EU",
    paynCost: -950, // 3.8% p.a.
    saved: 925, // difference in interest earned
    earnedNotSaved: true, // changes copy from "saved" to "earned"
    href: "/savings",
    pillCopy: "Savings",
  },
];

function eur(value: number) {
  return value.toLocaleString("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function IconFor({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "transfer") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path d="M4 8h13l-3-3M20 16H7l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "card") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
      <path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

interface SavingsSpotlightProps {
  locale: MarketplaceLocale;
}

export function SavingsSpotlight({ locale }: SavingsSpotlightProps) {
  const shouldReduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];
  const verb = active.earnedNotSaved ? "earned" : "saved";

  // Right column shows the math: bank cost - payn cost = saved. Visually we
  // express it as a red bar (bank) above a green bar (payn) so the size
  // difference is the proof, then a big number for the delta.
  // Cost values are absolute; for savings we treat negative as "interest you
  // gain", flipping the visual so longer = better.

  const bankAbs = Math.abs(active.bankCost);
  const paynAbs = Math.abs(active.paynCost);
  const maxAbs = Math.max(bankAbs, paynAbs, 1);
  const bankWidth = (bankAbs / maxAbs) * 100;
  const paynWidth = (paynAbs / maxAbs) * 100;

  return (
    <section className="relative overflow-hidden rounded-4xl border border-line bg-white px-6 py-12 shadow-card sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent-emerald/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#10B981]/8 blur-3xl" />

      <div className="relative">
        <div className="mb-8 max-w-prose-wide">
          <p className="eyebrow-cap" data-tone="emerald">
            See the real cost
          </p>
          <h2 className="display-lead mt-3">
            What banks quietly charge you — and what you'd pay through Payn.
          </h2>
          <p className="mt-3 max-w-prose-base text-[15px] leading-relaxed text-ink-secondary">
            Same product, different provider. The difference is what you don't see on your statement.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12">
          {/* ── Left: scenario picker ── */}
          <div className="grid gap-2.5">
            {SCENARIOS.map((scenario) => {
              const isActive = scenario.id === activeId;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setActiveId(scenario.id)}
                  className={[
                    "group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                    isActive
                      ? "border-accent-emerald/40 bg-accent-emerald-soft shadow-subtle"
                      : "border-line bg-white hover:-translate-y-px hover:border-accent-emerald/25 hover:shadow-subtle",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-accent-emerald text-white"
                        : "bg-bg-surface text-ink-secondary group-hover:bg-accent-emerald-soft group-hover:text-accent-emerald-strong",
                    ].join(" ")}
                  >
                    <IconFor name={scenario.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                      {scenario.pillCopy}
                    </p>
                    <p className={[
                      "mt-1 truncate text-[14px] font-semibold leading-tight",
                      isActive ? "text-ink" : "text-ink-secondary",
                    ].join(" ")}>
                      {scenario.setup}
                    </p>
                  </div>
                  {/* Two-tier number: verb label sits at 9px tracked
                      uppercase like a unit, the actual € amount is the loud
                      tabular-num. Fixes the "Save €279 reads as one weight"
                      flatness the user called out. */}
                  <span className="flex shrink-0 flex-col items-end leading-none">
                    <span
                      className={[
                        "text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors",
                        isActive ? "text-accent-emerald-strong/80" : "text-ink-tertiary",
                      ].join(" ")}
                    >
                      {verbForScenario(scenario)}
                    </span>
                    <span
                      className={[
                        "mt-1 text-[18px] font-extrabold tabular-nums tracking-tight-1 transition-colors",
                        isActive ? "text-accent-emerald-strong" : "text-ink",
                      ].join(" ")}
                    >
                      {eur(scenario.saved)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Right: math visual ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={shouldReduce ? false : { opacity: 0, y: 8 }}
              animate={shouldReduce ? false : { opacity: 1, y: 0 }}
              exit={shouldReduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-line bg-bg-surface p-6 sm:p-8"
            >
              <p className="eyebrow-cap">Annual cost</p>

              {/* Bank cost bar */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-semibold text-ink-secondary">{active.bankLabel}</span>
                  <span className="font-bold tabular-nums text-ink">{eur(bankAbs)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #EF4444 0%, #F97316 100%)",
                    }}
                    initial={shouldReduce ? false : { width: 0 }}
                    animate={{ width: `${bankWidth}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Payn cost bar */}
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-semibold text-accent-emerald-strong">{active.paynLabel}</span>
                  <span className="font-bold tabular-nums text-ink">{eur(paynAbs)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #0F8A4B 0%, #10B981 100%)",
                    }}
                    initial={shouldReduce ? false : { width: 0 }}
                    animate={{ width: `${paynWidth}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Delta */}
              <div className="mt-7 rounded-2xl border border-accent-emerald/25 bg-white p-5">
                <p className="eyebrow-cap" data-tone="emerald">
                  You {verb} per year
                </p>
                <p className="display-lead mt-1 tabular-nums">
                  <ScrambleNumber
                    value={active.saved}
                    decimals={0}
                    suffix=""
                    cacheKey={`spotlight-${active.id}`}
                  />
                  <span className="ml-1 text-[1.6rem] text-accent-emerald-strong">€</span>
                </p>
                <Link
                  href={localePath(locale, active.href)}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-emerald-strong transition-colors hover:text-accent-emerald"
                >
                  See {active.pillCopy.toLowerCase()} on Payn
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-ink-tertiary">
          Illustrative annual costs based on published provider terms. Your actual amounts depend on eligibility, market, and usage.
        </p>
      </div>
    </section>
  );
}

function verbForScenario(scenario: Scenario) {
  return scenario.earnedNotSaved ? "Earn" : "Save";
}
