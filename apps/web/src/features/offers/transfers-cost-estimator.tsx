"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { MarketplaceOffer } from "@payn/types";
import { extractMetricNumber } from "@/features/marketplace/offer-ranking";

// ─── TransfersCostEstimator ────────────────────────────────────────────────────
//
// Same calculator family as Cards/Loans — one slider for send amount,
// outputs the real all-in cost (fee + FX margin) and what the recipient
// actually receives in source-currency terms.
//
// Data we read from the offer:
//   • Transfer fee — flat €/fixed amount per send, from a metric labelled
//                    "Transfer fee" / "Fee" / "SEPA fee". When the value
//                    parses as a percentage (e.g. "0.4%") we treat it as
//                    a percentage of the amount; when it parses as a flat
//                    number with a currency symbol or "EUR" we treat it
//                    as a flat fee. "Free" / "0%" → 0.
//   • Spread / FX  — percentage from a metric labelled "Spread" / "FX
//                    spread" / "FX fee" / "Conversion". Treated as a
//                    percentage of the amount.
//
// Output:
//   • What you pay = amount + flatFee + amount × spreadPct
//   • Recipient gets ≈ amount − totalCost (shown in source currency for
//     clarity — actual destination amount depends on the live mid-market
//     rate which isn't in the static catalogue)
//   • "Hidden cost" — the spread you don't see on your statement
//
// The widget hides entirely when no fee or spread metric exists — we'd
// rather show nothing than fabricate a number.
interface TransfersCostEstimatorProps {
  offer: MarketplaceOffer;
}

function eur(value: number) {
  return value.toLocaleString("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });
}

interface FeeShape {
  flat: number;
  pct: number;
}

// Inspect a metric's raw value and decide whether it's flat-fee or % of
// amount. Tolerant of the catalogue's mixed phrasings.
function parseFeeMetric(rawValue: string): FeeShape {
  if (!rawValue) return { flat: 0, pct: 0 };
  const lower = rawValue.toLowerCase().trim();
  if (/^(free|none|no\s*fee|n\/?a|0)/.test(lower)) return { flat: 0, pct: 0 };
  const n = extractMetricNumber(rawValue);
  if (n === null) return { flat: 0, pct: 0 };
  // Percentage indicators
  if (lower.includes("%")) return { flat: 0, pct: n };
  return { flat: n, pct: 0 };
}

function pickMetric(offer: MarketplaceOffer, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const hit = offer.metrics.find((m) => pattern.test(m.label));
    if (hit) return hit;
  }
  return null;
}

export function TransfersCostEstimator({ offer }: TransfersCostEstimatorProps) {
  const feeMetric = pickMetric(offer, [/transfer\s*fee/i, /sepa\s*fee/i, /(^|\s)fee\b/i]);
  const spreadMetric = pickMetric(offer, [/spread/i, /(^|\s)fx\b/i, /conversion/i, /foreign/i]);

  // No usable data — graceful exit.
  if (!feeMetric && !spreadMetric) return null;

  const feeShape: FeeShape = feeMetric ? parseFeeMetric(feeMetric.value) : { flat: 0, pct: 0 };
  const spreadShape: FeeShape = spreadMetric ? parseFeeMetric(spreadMetric.value) : { flat: 0, pct: 0 };

  // The "spread" metric is almost always a percentage. If it parsed as
  // flat (no % sign), coerce to pct so the math doesn't multiply by a
  // large flat fee.
  if (spreadShape.flat > 0 && spreadShape.pct === 0) {
    spreadShape.pct = spreadShape.flat;
    spreadShape.flat = 0;
  }

  const [amount, setAmount] = useState(1000);

  const result = useMemo(() => {
    if (amount <= 0) {
      return { flatFee: 0, spreadCost: 0, totalCost: 0, recipientGets: 0 };
    }
    const flatFee = feeShape.flat + (amount * feeShape.pct) / 100;
    const spreadCost = (amount * spreadShape.pct) / 100;
    const totalCost = flatFee + spreadCost;
    const recipientGets = Math.max(0, amount - totalCost);
    return { flatFee, spreadCost, totalCost, recipientGets };
  }, [amount, feeShape.flat, feeShape.pct, spreadShape.pct]);

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 max-w-prose-base">
        <p className="eyebrow-cap" data-tone="emerald">
          Your real cost
        </p>
        <h2 className="display-lead mt-2 text-[1.75rem] sm:text-[2rem]">
          What this transfer would actually cost you.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Move the slider. The math uses {offer.providerName}'s published
          fee and FX spread — the difference between the headline rate and
          what you actually pay.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        {/* ── Input ────────────────────────────────────────────── */}
        <div className="grid gap-5">
          <SliderRow
            label="Amount to send"
            value={amount}
            onChange={setAmount}
            min={100}
            max={20000}
            step={100}
            format={(v) => eur(v)}
          />

          <div className="rounded-2xl border border-line bg-bg-surface p-4 text-[13px] leading-relaxed text-ink-secondary">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Pulled from this offer
            </p>
            <div className="mt-2 grid gap-1.5">
              {feeMetric && (
                <p>
                  <strong className="font-semibold text-ink">{feeMetric.label}: </strong>
                  {feeMetric.value}
                </p>
              )}
              {spreadMetric && (
                <p>
                  <strong className="font-semibold text-ink">{spreadMetric.label}: </strong>
                  {spreadMetric.value}
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-ink-tertiary">
            Recipient amount is shown in source-currency terms for clarity.
            The exchange rate {offer.providerName} applies on the day
            determines the actual destination amount.
          </p>
        </div>

        {/* ── Result panel ───────────────────────────────────────── */}
        <motion.div
          layout
          className="rounded-3xl border border-accent-emerald/25 bg-bg-surface p-6 sm:p-7"
        >
          <p className="eyebrow-cap" data-tone="emerald">
            Recipient gets
          </p>
          <p className="display-lead mt-2 tabular-nums">{eur(result.recipientGets)}</p>
          <p className="mt-2 text-[12px] text-ink-tertiary">
            Out of {eur(amount)} sent. Of that, {eur(result.totalCost)} stays
            with {offer.providerName} as fee + spread.
          </p>

          <div className="mt-6 grid gap-3 border-t border-line pt-5 text-[13px]">
            {feeShape.flat > 0 || feeShape.pct > 0 ? (
              <LineItem label="Transfer fee" value={result.flatFee} />
            ) : null}
            {spreadShape.pct > 0 && (
              <LineItem
                label={`FX spread @ ${spreadShape.pct.toFixed(2)}%`}
                value={result.spreadCost}
              />
            )}
            <LineItem
              label="Total cost"
              value={result.totalCost}
              kind="total"
            />
          </div>

          {spreadShape.pct > 0 && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-800">
              <strong className="font-semibold">FX spread is the hidden one.</strong>{" "}
              It doesn't appear as a line item on your statement — it's baked
              into the exchange rate.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Shared subcomponents (same styling as the other estimators) ──────────────
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
}: {
  label: string;
  value: number;
  kind?: "cost" | "total";
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
            : "font-semibold text-amber-600",
        ].join(" ")}
      >
        {eur(value)}
      </span>
    </div>
  );
}
