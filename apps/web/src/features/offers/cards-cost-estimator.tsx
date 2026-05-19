"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { MarketplaceOffer } from "@payn/types";

// ─── CardsCostEstimator ───────────────────────────────────────────────────────
//
// Interactive "what would this card actually cost me" widget. Replaces the
// blank space below the hero with a tool that turns the static pricing table
// into a personal-finance answer.
//
// Inputs: monthly spend, % spent abroad, monthly ATM withdrawals.
// Output: annual fee + FX cost + ATM-excess cost − cashback = net annual €.
//
// Renders nothing when the offer is missing typed fee attributes — falling
// back to "estimate from public terms" here would be misleading because we
// don't have enough signal to compute a credible number.
//
// All typed fields it needs live on offer.attributes:
//   - annualFeeAmount (€/yr) — required
//   - fxFeePercent (%) — required
//   - cashbackPercent (%) — optional (0 if missing)
//   - atmFreeLimit (€/month free withdrawals) — optional (0 if missing)
//
// We deliberately don't try to model ATM excess fees per provider — they
// vary by country, ATM operator, and card tier. Instead we surface the
// free-withdrawal allowance and assume excess withdrawals carry a flat 2%
// fee (industry average). The calculator's footnote tells the user what
// we assumed so the math is auditable.
interface CardsCostEstimatorProps {
  offer: MarketplaceOffer;
}

const ATM_EXCESS_FEE_PCT = 0.02; // 2% assumed for over-allowance withdrawals

function eur(value: number) {
  return value.toLocaleString("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function CardsCostEstimator({ offer }: CardsCostEstimatorProps) {
  const attrs = offer.attributes;
  const annualFee = attrs?.annualFeeAmount;
  const fxPct = attrs?.fxFeePercent;
  const cashbackPct = attrs?.cashbackPercent ?? 0;
  const atmFree = attrs?.atmFreeLimit ?? 0;

  // Hard requirement: we need at least the two fee fields to give a
  // truthful answer. Missing → skip the estimator (PDP renders without it).
  if (annualFee == null || fxPct == null) return null;

  const [monthlySpend, setMonthlySpend] = useState(1500);
  const [abroadPct, setAbroadPct] = useState(20);
  const [monthlyAtm, setMonthlyAtm] = useState(200);

  const result = useMemo(() => {
    const annualSpend = monthlySpend * 12;
    const annualAbroadSpend = annualSpend * (abroadPct / 100);
    const fxCost = annualAbroadSpend * (fxPct / 100);
    const cashbackEarned = annualSpend * (cashbackPct / 100);
    const atmExcessMonthly = Math.max(0, monthlyAtm - atmFree);
    const atmCostAnnual = atmExcessMonthly * 12 * ATM_EXCESS_FEE_PCT;

    const grossAnnualCost = annualFee + fxCost + atmCostAnnual;
    const netAnnualCost = grossAnnualCost - cashbackEarned;

    return {
      annualFee,
      fxCost,
      atmCostAnnual,
      cashbackEarned,
      grossAnnualCost,
      netAnnualCost,
    };
  }, [annualFee, fxPct, cashbackPct, atmFree, monthlySpend, abroadPct, monthlyAtm]);

  // Net cost can go negative when cashback exceeds the fee+FX combo —
  // we surface that as "you'd EARN €X" rather than a negative number.
  const earning = result.netAnnualCost < 0;
  const absoluteValue = Math.abs(Math.round(result.netAnnualCost));

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 max-w-prose-base">
        <p className="eyebrow-cap" data-tone="emerald">
          Your real cost
        </p>
        <h2 className="display-lead mt-2 text-[1.75rem] sm:text-[2rem]">
          What this card would actually cost you.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Move the sliders. We'll do the maths from {offer.providerName}'s
          published terms — annual fee, FX rate, ATM allowance and cashback.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        {/* ── Inputs ─────────────────────────────────────────────── */}
        <div className="grid gap-5">
          <SliderRow
            label="Monthly spend"
            value={monthlySpend}
            onChange={setMonthlySpend}
            min={100}
            max={5000}
            step={50}
            format={(v) => eur(v)}
          />
          <SliderRow
            label="Share spent abroad"
            value={abroadPct}
            onChange={setAbroadPct}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}%`}
          />
          <SliderRow
            label="ATM withdrawals / month"
            value={monthlyAtm}
            onChange={setMonthlyAtm}
            min={0}
            max={500}
            step={20}
            format={(v) => eur(v)}
          />
        </div>

        {/* ── Result panel ───────────────────────────────────────── */}
        <motion.div
          layout
          className="rounded-3xl border border-accent-emerald/25 bg-bg-surface p-6 sm:p-7"
        >
          <p className="eyebrow-cap" data-tone="emerald">
            {earning ? "You'd earn per year" : "You'd pay per year"}
          </p>
          <p className="display-lead mt-2 tabular-nums">
            {earning ? "+" : ""}
            {eur(absoluteValue)}
          </p>
          <p className="mt-2 text-[12px] text-ink-tertiary">
            Net of cashback. Based on {offer.providerName}'s published terms.
          </p>

          <div className="mt-6 grid gap-2 border-t border-line pt-5 text-[13px]">
            <LineItem label="Annual fee" value={result.annualFee} cost />
            <LineItem label="FX cost on spending abroad" value={result.fxCost} cost />
            {atmFree < monthlyAtm && (
              <LineItem
                label={`ATM excess (over €${atmFree}/mo free)`}
                value={result.atmCostAnnual}
                cost
              />
            )}
            {cashbackPct > 0 && (
              <LineItem
                label={`Cashback @ ${cashbackPct}%`}
                value={-result.cashbackEarned}
                cost
              />
            )}
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-ink-tertiary">
            Assumes 2% fee on ATM withdrawals above the free monthly
            allowance. Actual provider terms may vary by country and card
            tier — check eligibility before applying.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────
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
  // Custom progress fill — native range input is the slider, the gradient
  // background simulates the "filled" portion using a linear-gradient
  // computed from the current value. Works without polyfills, no JS for
  // the visual.
  const percent = ((value - min) / (max - min)) * 100;
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
  cost,
}: {
  label: string;
  value: number;
  cost?: boolean;
}) {
  const isNegative = value < 0;
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-ink-secondary">{label}</span>
      <span
        className={[
          "shrink-0 font-semibold tabular-nums",
          isNegative ? "text-accent-emerald-strong" : "text-ink",
        ].join(" ")}
      >
        {isNegative ? "−" : ""}
        {eur(Math.abs(value))}
        {cost && !isNegative && <span className="ml-1 text-ink-tertiary">/yr</span>}
        {isNegative && <span className="ml-1 text-accent-emerald-strong">/yr</span>}
      </span>
    </div>
  );
}
