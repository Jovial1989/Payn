"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { MarketplaceOffer } from "@payn/types";
import { extractMetricNumber } from "@/features/marketplace/offer-ranking";

// ─── LoansCostEstimator ────────────────────────────────────────────────────────
//
// Interactive "what would this loan actually cost me" widget. Same family
// as CardsCostEstimator but with three different inputs and amortization
// math.
//
// Data sources, with graceful fallback:
//   • Amount range  → offer.attributes.minAmount / maxAmount (typed, 24 offers)
//                     OR parsed from "Amount" metric value as a range
//                     ("EUR 1,000 - 25,000") when typed missing
//   • Term range    → offer.attributes.minTermMonths / maxTermMonths (typed)
//                     OR parsed from "Term" metric value ("12 - 60 months")
//   • APR range     → parsed from "APR" metric value ("4.5% - 12.5%")
//                     We deliberately don't fall back to a default; if the
//                     offer doesn't expose APR, the calculator hides
//                     entirely rather than fabricating a number.
//
// Math: standard amortization formula. Monthly payment
//   M = P × (r / 12) × (1 + r/12)^n / ((1 + r/12)^n − 1)
// where r is the annual APR as a fraction (e.g. 0.075 for 7.5%) and n is
// the term in months. Total cost = M × n. Interest = total cost − P.

interface LoansCostEstimatorProps {
  offer: MarketplaceOffer;
}

function eur(value: number) {
  return value.toLocaleString("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

// Tolerant range parser. Accepts:
//   "4.5% - 12.5%"   → { min: 4.5, max: 12.5 }
//   "EUR 1,000 - 25,000" → { min: 1000, max: 25000 }
//   "12 - 60 months" → { min: 12, max: 60 }
//   "From 3.9%"      → { min: 3.9, max: 3.9 }
//   "Up to 50,000"   → { min: 0,   max: 50000 }
// Returns null when no numbers can be parsed.
function parseRange(value: string): { min: number; max: number } | null {
  const lower = value.toLowerCase();
  const dash = lower.match(/(-?\d+[\d,]*\.?\d*)\s*[-–]\s*(-?\d+[\d,]*\.?\d*)/);
  if (dash) {
    const a = parseFloat(dash[1].replace(/,/g, ""));
    const b = parseFloat(dash[2].replace(/,/g, ""));
    if (Number.isFinite(a) && Number.isFinite(b)) {
      return { min: Math.min(a, b), max: Math.max(a, b) };
    }
  }
  if (/up\s*to/i.test(lower)) {
    const n = extractMetricNumber(value);
    return n !== null ? { min: 0, max: n } : null;
  }
  const single = extractMetricNumber(value);
  return single !== null ? { min: single, max: single } : null;
}

export function LoansCostEstimator({ offer }: LoansCostEstimatorProps) {
  // ── Resolve ranges from typed attrs first, metric strings second ──────
  const aprMetric = offer.metrics.find((m) => /apr|interest/i.test(m.label));
  const aprRange = aprMetric ? parseRange(aprMetric.value) : null;
  if (!aprRange) return null;

  const attrs = offer.attributes;
  const amountMin =
    attrs?.minAmount ??
    parseRange(offer.metrics.find((m) => /amount/i.test(m.label))?.value ?? "")?.min ??
    1000;
  const amountMax =
    attrs?.maxAmount ??
    parseRange(offer.metrics.find((m) => /amount/i.test(m.label))?.value ?? "")?.max ??
    25000;
  const termMin =
    attrs?.minTermMonths ??
    parseRange(offer.metrics.find((m) => /term/i.test(m.label))?.value ?? "")?.min ??
    12;
  const termMax =
    attrs?.maxTermMonths ??
    parseRange(offer.metrics.find((m) => /term/i.test(m.label))?.value ?? "")?.max ??
    60;

  // Defensive: if any computed range collapses to zero or negative, drop
  // the estimator — math will be nonsense.
  if (amountMax <= 0 || termMax <= 0 || aprRange.max <= 0) return null;

  // Initial values — sit at the midpoint of each range so the slider feels
  // honest (you see the typical case before nudging toward best/worst).
  const initialAmount = Math.round((amountMin + amountMax) / 2);
  const initialTerm = Math.round((termMin + termMax) / 2);
  const initialApr = Math.round(((aprRange.min + aprRange.max) / 2) * 10) / 10;

  const [amount, setAmount] = useState(initialAmount);
  const [termMonths, setTermMonths] = useState(initialTerm);
  const [apr, setApr] = useState(initialApr);

  const result = useMemo(() => {
    if (amount <= 0 || termMonths <= 0) {
      return { monthlyPayment: 0, totalCost: 0, interest: 0 };
    }
    if (apr === 0) {
      const m = amount / termMonths;
      return { monthlyPayment: m, totalCost: amount, interest: 0 };
    }
    const r = apr / 100 / 12;
    const factor = Math.pow(1 + r, termMonths);
    const monthly = (amount * r * factor) / (factor - 1);
    const total = monthly * termMonths;
    return {
      monthlyPayment: monthly,
      totalCost: total,
      interest: total - amount,
    };
  }, [amount, termMonths, apr]);

  // For the bar visual: split the total into principal vs interest. We
  // render two stacked bars whose widths reflect the proportion of the
  // total cost going to interest, making the cost-of-borrowing immediately
  // visible.
  const interestShare = result.totalCost > 0 ? (result.interest / result.totalCost) * 100 : 0;
  const principalShare = 100 - interestShare;

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 max-w-prose-base">
        <p className="eyebrow-cap" data-tone="emerald">
          Your real cost
        </p>
        <h2 className="display-lead mt-2 text-[1.75rem] sm:text-[2rem]">
          What this loan would actually cost you.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Move the sliders — the math uses {offer.providerName}'s published
          APR range. Your real rate depends on your credit profile.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        {/* ── Inputs ────────────────────────────────────────────── */}
        <div className="grid gap-5">
          <SliderRow
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            min={Math.max(500, Math.floor(amountMin / 500) * 500)}
            max={Math.ceil(amountMax / 500) * 500}
            step={500}
            format={(v) => eur(v)}
          />
          <SliderRow
            label="Term"
            value={termMonths}
            onChange={setTermMonths}
            min={Math.max(6, termMin)}
            max={termMax}
            step={6}
            format={(v) => `${v} months`}
          />
          <SliderRow
            label="APR"
            value={apr}
            onChange={setApr}
            min={Math.round(aprRange.min * 10) / 10}
            max={Math.round(aprRange.max * 10) / 10}
            step={0.1}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <p className="text-[11px] leading-relaxed text-ink-tertiary">
            APR range published by {offer.providerName}:{" "}
            <span className="font-semibold text-ink-secondary">
              {aprRange.min.toFixed(1)}% – {aprRange.max.toFixed(1)}%
            </span>
            . Final rate depends on eligibility.
          </p>
        </div>

        {/* ── Result panel ───────────────────────────────────────── */}
        <motion.div
          layout
          className="rounded-3xl border border-accent-emerald/25 bg-bg-surface p-6 sm:p-7"
        >
          <p className="eyebrow-cap" data-tone="emerald">
            Monthly payment
          </p>
          <p className="display-lead mt-2 tabular-nums">
            {eur(Math.round(result.monthlyPayment))}
            <span className="ml-1 text-[1rem] text-ink-tertiary">/mo</span>
          </p>
          <p className="mt-2 text-[12px] text-ink-tertiary">
            Over {termMonths} months at {apr.toFixed(1)}% APR.
          </p>

          <div className="mt-6 grid gap-3 border-t border-line pt-5 text-[13px]">
            <LineItem label="You borrow" value={amount} kind="neutral" />
            <LineItem
              label="Interest you pay"
              value={Math.round(result.interest)}
              kind="cost"
            />
            <LineItem
              label="Total cost"
              value={Math.round(result.totalCost)}
              kind="total"
            />
          </div>

          {/* Principal vs interest visual bar */}
          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Where your money goes
            </p>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full border border-line">
              <motion.div
                className="bg-accent-emerald"
                initial={{ width: 0 }}
                animate={{ width: `${principalShare}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${interestShare}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-ink-tertiary">
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent-emerald" />
                Principal {Math.round(principalShare)}%
              </span>
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
                Interest {Math.round(interestShare)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Subcomponents (mirror CardsCostEstimator styling) ─────────────────────────
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
  kind,
}: {
  label: string;
  value: number;
  kind: "cost" | "neutral" | "total";
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
            : kind === "cost"
              ? "font-semibold text-amber-600"
              : "font-semibold text-ink",
        ].join(" ")}
      >
        {eur(value)}
      </span>
    </div>
  );
}
