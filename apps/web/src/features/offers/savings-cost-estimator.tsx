"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { MarketplaceOffer } from "@payn/types";
import { extractMetricNumber } from "@/features/marketplace/offer-ranking";

// ─── SavingsCostEstimator ──────────────────────────────────────────────────────
//
// Different shape from the Cards/Loans/Transfers calculators: this one
// rewards you instead of charging you. Inputs are balance + duration,
// output is interest earned + delta against a "big-bank current account"
// baseline (which earns near zero — the framing here is "what you LOSE
// by parking money in a non-interest account").
//
// Data sources:
//   • Interest rate — parsed from any metric whose label contains
//     "rate", "p.a.", "apy", "interest" or "yield". Treated as annual
//     percentage. Range labels ("3.5% - 4.0%") use the midpoint.
//
// We deliberately use SIMPLE interest math (rate × balance × years)
// rather than compound — many EU savings products credit interest yearly
// and the user expectation here is "easy-access savings". Term deposits
// could be modelled with compounding later; for the MVP, simple interest
// is honest and intuitive.
//
// Baseline: zero-interest current account. The "you'd earn" headline
// compares against that baseline so the user sees the cost of inertia.
interface SavingsCostEstimatorProps {
  offer: MarketplaceOffer;
}

function eur(value: number) {
  return value.toLocaleString("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function findRate(offer: MarketplaceOffer): number | null {
  const rateMetric = offer.metrics.find((m) =>
    /(rate|p\.a\.|apy|interest|yield)/i.test(m.label),
  );
  if (!rateMetric) return null;
  // Range value ("3.5% - 4.0%") → midpoint. Otherwise first number.
  const lower = rateMetric.value.toLowerCase();
  const range = lower.match(/(-?\d+[\d,]*\.?\d*)\s*[-–]\s*(-?\d+[\d,]*\.?\d*)/);
  if (range) {
    const a = parseFloat(range[1].replace(/,/g, ""));
    const b = parseFloat(range[2].replace(/,/g, ""));
    if (Number.isFinite(a) && Number.isFinite(b)) return (a + b) / 2;
  }
  const n = extractMetricNumber(rateMetric.value);
  return n !== null && n > 0 && n < 25 ? n : null; // sanity-bound 0-25%
}

export function SavingsCostEstimator({ offer }: SavingsCostEstimatorProps) {
  const rate = findRate(offer);
  if (rate === null) return null;

  const [balance, setBalance] = useState(10000);
  const [years, setYears] = useState(3);

  const result = useMemo(() => {
    const interestPerYear = (balance * rate) / 100;
    const totalInterest = interestPerYear * years;
    const totalAtEnd = balance + totalInterest;
    return {
      interestPerYear,
      totalInterest,
      totalAtEnd,
    };
  }, [balance, rate, years]);

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 max-w-prose-base">
        <p className="eyebrow-cap" data-tone="emerald">
          Your real return
        </p>
        <h2 className="display-lead mt-2 text-[1.75rem] sm:text-[2rem]">
          What this would actually earn you.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Move the sliders. We apply {offer.providerName}'s headline rate of{" "}
          <strong className="font-semibold text-ink">{rate.toFixed(2)}%</strong>{" "}
          to whatever you'd park here — and show the gap against a 0% current
          account.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        {/* ── Inputs ────────────────────────────────────────────── */}
        <div className="grid gap-5">
          <SliderRow
            label="Balance"
            value={balance}
            onChange={setBalance}
            min={500}
            max={100000}
            step={500}
            format={(v) => eur(v)}
          />
          <SliderRow
            label="How long you'd hold it"
            value={years}
            onChange={setYears}
            min={1}
            max={10}
            step={1}
            format={(v) => `${v} ${v === 1 ? "year" : "years"}`}
          />
          <p className="text-[11px] leading-relaxed text-ink-tertiary">
            Simple-interest math at {offer.providerName}'s published rate.
            Tax on interest and any account fees may apply — check the full
            terms before opening.
          </p>
        </div>

        {/* ── Result panel ───────────────────────────────────────── */}
        <motion.div
          layout
          className="rounded-3xl border border-accent-emerald/25 bg-bg-surface p-6 sm:p-7"
        >
          <p className="eyebrow-cap" data-tone="emerald">
            You'd earn over {years} {years === 1 ? "year" : "years"}
          </p>
          <p className="display-lead mt-2 tabular-nums">
            +{eur(result.totalInterest)}
          </p>
          <p className="mt-2 text-[12px] text-ink-tertiary">
            On a {eur(balance)} balance at {rate.toFixed(2)}% per year.
          </p>

          <div className="mt-6 grid gap-3 border-t border-line pt-5 text-[13px]">
            <LineItem label="Per year" value={result.interestPerYear} tone="gain" />
            <LineItem
              label={`After ${years} ${years === 1 ? "year" : "years"}`}
              value={result.totalInterest}
              tone="gain"
            />
            <LineItem
              label="Account total at end"
              value={result.totalAtEnd}
              kind="total"
            />
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
            <strong className="font-semibold">Cost of doing nothing.</strong>{" "}
            Leaving the same balance in a 0% current account costs you{" "}
            <span className="font-bold">{eur(result.totalInterest)}</span> over{" "}
            {years} {years === 1 ? "year" : "years"} of foregone interest.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Shared subcomponents ─────────────────────────────────────────────────────
function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
          {label}
        </span>
        <span className="text-[15px] font-extrabold tabular-nums tracking-tight-2 text-ink">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full"
        style={{
          background: `linear-gradient(to right, #0F8A4B 0%, #0F8A4B ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`,
        }}
      />
    </label>
  );
}

function LineItem({
  label,
  value,
  kind = "cost",
  tone = "neutral",
}: {
  label: string;
  value: number;
  kind?: "cost" | "total";
  tone?: "gain" | "neutral";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={
          kind === "total"
            ? "text-[13px] font-semibold text-ink"
            : "text-ink-secondary"
        }
      >
        {label}
      </span>
      <span
        className={[
          "shrink-0 tabular-nums",
          kind === "total"
            ? "text-[15px] font-extrabold text-ink"
            : tone === "gain"
              ? "font-semibold text-accent-emerald-strong"
              : "font-semibold text-ink",
        ].join(" ")}
      >
        {tone === "gain" && kind !== "total" ? "+" : ""}
        {eur(value)}
      </span>
    </div>
  );
}
