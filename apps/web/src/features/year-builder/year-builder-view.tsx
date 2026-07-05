"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { MarketplaceOffer, MarketplaceLocale } from "@payn/types";
import { ScrambleNumber } from "@/features/home/scramble-number";
import { getProviderLogoPath } from "@/features/catalog/provider-logo";
import { getOfferHref } from "@/lib/marketplace";
import { localePath } from "@/lib/locale";
import { computeYear, type YearInputs } from "./year-math";

// ─── YearBuilderView ───────────────────────────────────────────────────────────
//
// The "killer feature" surface. A short, conversational flow with five
// inputs that turns into a single financial scenario for the user:
// "given your year, here's what switching to a Payn-recommended kit
// actually saves you."
//
// State machine: 6 steps (5 inputs + result). Forward and back buttons
// only — no skipping. We deliberately keep the experience linear so
// every step's answer changes the math meaningfully.
//
// The result screen visualises a 12-month delta between the user's
// current bank-default situation and a Payn-optimised setup, alongside
// the three product recommendations the math picked.

interface YearBuilderViewProps {
  countryMarket: MarketplaceOffer[];
  country: string;
  locale: MarketplaceLocale;
  countryLabel: string;
}

type StepKey = "intro" | "spend" | "abroad" | "balance" | "loan" | "result";

const STEP_ORDER: StepKey[] = ["intro", "spend", "abroad", "balance", "loan", "result"];

function eur(value: number) {
  return value.toLocaleString("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function YearBuilderView({
  countryMarket,
  country,
  locale,
  countryLabel,
}: YearBuilderViewProps) {
  const [step, setStep] = useState<StepKey>("intro");
  const [inputs, setInputs] = useState<YearInputs>({
    monthlySpend: 1500,
    abroadPct: 15,
    currentBalance: 8000,
    plannedLoan: 0,
    country,
  });
  const shouldReduce = useReducedMotion();

  const result = useMemo(
    () => (step === "result" ? computeYear(inputs, countryMarket) : null),
    [step, inputs, countryMarket],
  );

  const advance = () => {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)]);
  };
  const retreat = () => {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[Math.max(idx - 1, 0)]);
  };

  // Progress (0-1) for the slim top bar.
  const progress =
    (STEP_ORDER.indexOf(step) + 1) / STEP_ORDER.length;

  return (
    <div className="relative">
      {/* Top progress rail */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="eyebrow-cap" data-tone="emerald">
              Year Builder
            </span>
            <span className="text-[11px] text-ink-tertiary">
              {STEP_ORDER.indexOf(step) + 1} / {STEP_ORDER.length}
            </span>
          </div>
          {step !== "intro" && step !== "result" && (
            <button
              type="button"
              onClick={retreat}
              className="text-[12px] font-semibold text-ink-tertiary transition-colors hover:text-ink"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-emerald to-[#10B981]"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={shouldReduce ? false : { opacity: 0, y: 8 }}
          animate={shouldReduce ? false : { opacity: 1, y: 0 }}
          exit={shouldReduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === "intro" && (
            <StepIntro onNext={advance} countryLabel={countryLabel} />
          )}
          {step === "spend" && (
            <StepSlider
              eyebrow="Question 1 of 4"
              title="How much do you spend each month on cards?"
              subtitle="Groceries, subscriptions, holiday tickets — the lot. Estimate is fine."
              value={inputs.monthlySpend}
              onChange={(v) => setInputs((s) => ({ ...s, monthlySpend: v }))}
              min={100}
              max={10000}
              step={100}
              format={(v) => eur(v)}
              onNext={advance}
            />
          )}
          {step === "abroad" && (
            <StepSlider
              eyebrow="Question 2 of 4"
              title="How much of that is abroad?"
              subtitle="Trips, online stores in other currencies, that holiday in October."
              value={inputs.abroadPct}
              onChange={(v) => setInputs((s) => ({ ...s, abroadPct: v }))}
              min={0}
              max={100}
              step={5}
              format={(v) => `${v}%`}
              onNext={advance}
              hint={`That's ~${eur(Math.round((inputs.monthlySpend * inputs.abroadPct) / 100))} per month abroad.`}
            />
          )}
          {step === "balance" && (
            <StepSlider
              eyebrow="Question 3 of 4"
              title="What sits in your current account?"
              subtitle="Money that's not invested, just chilling. Honest estimate."
              value={inputs.currentBalance}
              onChange={(v) => setInputs((s) => ({ ...s, currentBalance: v }))}
              min={500}
              max={100000}
              step={500}
              format={(v) => eur(v)}
              onNext={advance}
            />
          )}
          {step === "loan" && (
            <StepLoan
              value={inputs.plannedLoan}
              onChange={(v) => setInputs((s) => ({ ...s, plannedLoan: v }))}
              onNext={advance}
            />
          )}
          {step === "result" && result && (
            <ResultScreen
              result={result}
              inputs={inputs}
              countryLabel={countryLabel}
              locale={locale}
              onRestart={() => setStep("intro")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Step screens ─────────────────────────────────────────────────────────────
function StepIntro({
  onNext,
  countryLabel,
}: {
  onNext: () => void;
  countryLabel: string;
}) {
  return (
    <div className="max-w-prose-wide">
      <p className="eyebrow-cap" data-tone="emerald">
        Show me the year
      </p>
      <h1 className="display-hero mt-4">
        Tell us four things. We'll show you the year you could have.
      </h1>
      <p className="mt-5 max-w-prose-base text-[16px] leading-relaxed text-ink-secondary">
        Most comparison sites stop at "here's a product." We finish with{" "}
        <strong className="font-semibold text-ink">your year</strong>: a
        single 12-month picture of what switching to a Payn-recommended kit
        would save (or earn) you in {countryLabel}.
      </p>
      <p className="mt-3 max-w-prose-base text-[13px] leading-relaxed text-ink-tertiary">
        Takes 30 seconds. No email needed. You can re-run the math any time.
      </p>
      <button
        type="button"
        onClick={onNext}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#14D474] to-[#0A7A40] px-7 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(15,138,75,0.28)] transition-all hover:brightness-110 hover:shadow-[0_10px_26px_rgba(15,138,75,0.40)] active:scale-[0.98]"
      >
        Start
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function StepSlider({
  eyebrow,
  title,
  subtitle,
  value,
  onChange,
  min,
  max,
  step,
  format,
  onNext,
  hint,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onNext: () => void;
  hint?: string;
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="max-w-prose-wide">
      <p className="eyebrow-cap" data-tone="emerald">
        {eyebrow}
      </p>
      <h2 className="display-lead mt-3">{title}</h2>
      <p className="mt-3 max-w-prose-base text-[15px] leading-relaxed text-ink-secondary">
        {subtitle}
      </p>

      <div className="mt-10">
        <p className="text-[3.5rem] font-extrabold leading-none tracking-tight-3 tabular-nums text-ink sm:text-[4.5rem]">
          {format(value)}
        </p>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-6 w-full"
          style={{
            background: `linear-gradient(to right, #0F8A4B 0%, #0F8A4B ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-[11px] text-ink-tertiary">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>

        {hint && (
          <p className="mt-4 text-[13px] text-ink-secondary">{hint}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-10 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-[14px] font-semibold text-white shadow-card transition-all hover:bg-ink-secondary active:scale-[0.98]"
      >
        Continue
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function StepLoan({
  value,
  onChange,
  onNext,
}: {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  const hasLoan = value > 0;
  return (
    <div className="max-w-prose-wide">
      <p className="eyebrow-cap" data-tone="emerald">
        Question 4 of 4
      </p>
      <h2 className="display-lead mt-3">
        Planning to borrow this year?
      </h2>
      <p className="mt-3 max-w-prose-base text-[15px] leading-relaxed text-ink-secondary">
        Big purchase, home improvement, consolidation. We'll compare a Payn-
        recommended loan against an average high-street rate.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(0)}
          className={[
            "flex flex-col items-start rounded-2xl border p-5 text-left transition-all",
            !hasLoan
              ? "border-accent-emerald bg-accent-emerald-soft shadow-subtle"
              : "border-line bg-white hover:-translate-y-px hover:border-accent-emerald/30",
          ].join(" ")}
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-tertiary">
            No
          </span>
          <span className="mt-2 text-[15px] font-bold text-ink">
            Not borrowing this year
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!hasLoan) onChange(10000);
          }}
          className={[
            "flex flex-col items-start rounded-2xl border p-5 text-left transition-all",
            hasLoan
              ? "border-accent-emerald bg-accent-emerald-soft shadow-subtle"
              : "border-line bg-white hover:-translate-y-px hover:border-accent-emerald/30",
          ].join(" ")}
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-ink-tertiary">
            Yes
          </span>
          <span className="mt-2 text-[15px] font-bold text-ink">
            I might take a loan
          </span>
        </button>
      </div>

      {hasLoan && (
        <div className="mt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            How much?
          </p>
          <p className="mt-2 text-[2.5rem] font-extrabold leading-none tracking-tight-3 tabular-nums text-ink">
            {eur(value)}
          </p>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="mt-4 w-full"
            style={{
              background: `linear-gradient(to right, #0F8A4B 0%, #0F8A4B ${((value - 1000) / (100000 - 1000)) * 100}%, #E5E7EB ${((value - 1000) / (100000 - 1000)) * 100}%, #E5E7EB 100%)`,
            }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="mt-10 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-[14px] font-semibold text-white shadow-card transition-all hover:bg-ink-secondary active:scale-[0.98]"
      >
        Show me my year
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({
  result,
  inputs,
  countryLabel,
  locale,
  onRestart,
}: {
  result: ReturnType<typeof computeYear>;
  inputs: YearInputs;
  countryLabel: string;
  locale: MarketplaceLocale;
  onRestart: () => void;
}) {
  const earning = result.totalSaved >= 0;
  return (
    <div>
      {/* Hero result */}
      <div className="rounded-4xl border border-accent-emerald/25 bg-gradient-to-br from-accent-emerald-soft/60 via-white to-white p-6 shadow-card sm:p-8 lg:p-10">
        <p className="eyebrow-cap" data-tone="emerald">
          Your year in {countryLabel}
        </p>
        <h2 className="display-lead mt-3 max-w-prose-wide">
          {earning
            ? "Switching could leave you better off by"
            : "Switching would cost you about"}
        </h2>
        <p className="display-hero mt-4 tabular-nums text-accent-emerald-strong">
          {earning ? "+" : ""}
          <ScrambleNumber
            value={Math.round(Math.abs(result.totalSaved))}
            decimals={0}
            suffix=""
            cacheKey={`year-${Math.round(result.totalSaved)}`}
          />
          <span className="ml-2 text-[2rem] text-accent-emerald-strong">€</span>
          <span className="ml-2 text-[1rem] font-semibold text-ink-tertiary">
            per year
          </span>
        </p>

        {/* Breakdown chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {result.breakdown.abroadFeeSaved > 0 && (
            <BreakdownChip
              label="Saved on FX"
              value={`+${eur(Math.round(result.breakdown.abroadFeeSaved))}`}
            />
          )}
          {result.breakdown.interestEarned > 0 && (
            <BreakdownChip
              label="Earned on savings"
              value={`+${eur(Math.round(result.breakdown.interestEarned))}`}
            />
          )}
          {result.breakdown.loanInterestSaved > 0 && (
            <BreakdownChip
              label="Saved on loan interest"
              value={`+${eur(Math.round(result.breakdown.loanInterestSaved))}`}
            />
          )}
        </div>
      </div>

      {/* 12-month timeline chart */}
      <div className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
        <p className="eyebrow-cap">12-month picture</p>
        <h3 className="display-lead mt-2 text-[1.25rem] sm:text-[1.5rem]">
          Where you'd be by December.
        </h3>
        <TimelineChart timeline={result.timeline} />

        <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
          <Legend dotClass="bg-amber-400" label="Bank baseline (cost)" />
          <Legend dotClass="bg-accent-emerald" label="Payn kit (cost — lower is better)" />
        </div>
      </div>

      {/* Product recommendations */}
      <div className="mt-6">
        <p className="eyebrow-cap" data-tone="emerald">
          Your Payn kit
        </p>
        <h3 className="display-lead mt-2 text-[1.5rem] sm:text-[1.75rem]">
          {result.recommendations.length === 1
            ? "One product carries this year"
            : `${result.recommendations.length} products make this year work`}
          .
        </h3>
        <div className="mt-5 grid gap-3">
          {result.recommendations.map((r) => (
            <RecommendationCard key={r.offer.id} recommendation={r} locale={locale} />
          ))}
        </div>
      </div>

      {/* Footnote + restart */}
      <div className="mt-8 rounded-2xl border border-line bg-bg-surface p-5 text-[12px] leading-relaxed text-ink-tertiary">
        <p>
          <strong className="font-semibold text-ink-secondary">Assumptions: </strong>
          Bank FX {result.assumptions.bankFxPct}%, bank loan APR{" "}
          {result.assumptions.bankLoanApr}%, Payn savings rate{" "}
          {result.assumptions.paynSavingsRate.toFixed(2)}%, Payn loan APR{" "}
          {result.assumptions.paynLoanApr.toFixed(2)}%. Numbers are simple-
          interest annualised — your final amounts depend on credit profile,
          rate movements, and provider eligibility.
        </p>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 text-[13px] font-semibold text-ink-tertiary transition-colors hover:text-ink"
      >
        ← Re-run my year
      </button>
    </div>
  );
}

function BreakdownChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/25 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink">
      <span className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
        {label}
      </span>
      <span className="tabular-nums text-accent-emerald-strong">{value}</span>
    </span>
  );
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-secondary">
      <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function TimelineChart({ timeline }: { timeline: Array<{ month: number; bank: number; payn: number }> }) {
  // Both series can be negative (payn often is). Use absolute extremes to
  // normalise the y-axis.
  const max = Math.max(
    ...timeline.flatMap((t) => [Math.abs(t.bank), Math.abs(t.payn)]),
    1,
  );
  const width = 100;
  const height = 100;
  const stepW = width / (timeline.length - 1);

  // Build polyline points. Y origin at the bottom — negative values flip
  // upward (gain), positive values stay below (cost).
  const pointsFor = (key: "bank" | "payn") =>
    timeline
      .map((t, i) => {
        const v = t[key];
        const y = height / 2 - (v / max) * (height / 2);
        return `${i * stepW},${y}`;
      })
      .join(" ");

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-bg-surface p-4 sm:p-5">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-[180px] w-full">
        {/* Mid-line at zero */}
        <line
          x1="0"
          x2={width}
          y1={height / 2}
          y2={height / 2}
          stroke="rgba(17, 24, 39, 0.1)"
          strokeDasharray="1.5,1.5"
          strokeWidth="0.5"
        />
        <motion.polyline
          points={pointsFor("bank")}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
        <motion.polyline
          points={pointsFor("payn")}
          fill="none"
          stroke="#0F8A4B"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
        <span>Jan</span>
        <span>Apr</span>
        <span>Jul</span>
        <span>Oct</span>
        <span>Dec</span>
      </div>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  locale,
}: {
  recommendation: ReturnType<typeof computeYear>["recommendations"][number];
  locale: MarketplaceLocale;
}) {
  const { offer, reasoning, slot } = recommendation;
  const logoPath = getProviderLogoPath(offer.providerName);
  const href = localePath(locale, getOfferHref(offer));
  const headline = offer.metrics[0];

  return (
    <Link
      href={href}
      className="group flex items-stretch gap-4 rounded-2xl border border-line bg-white p-4 shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/30 hover:shadow-card sm:p-5"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-emerald-soft">
        {logoPath ? (
          <Image
            src={logoPath}
            alt={offer.providerName}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        ) : (
          <span className="text-[12px] font-extrabold text-accent-emerald-strong">
            {offer.providerMark.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
            {slot}
          </span>
          <p className="truncate text-[12px] text-ink-tertiary">{offer.providerName}</p>
        </div>
        <p className="mt-1 truncate text-[15px] font-bold text-ink">
          {offer.title}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink-secondary">
          {reasoning}
        </p>
      </div>

      {headline && (
        <div className="flex shrink-0 flex-col items-end justify-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {headline.label}
          </p>
          <p className="mt-1 text-[18px] font-extrabold tabular-nums tracking-tight-2 text-accent-emerald-strong">
            {headline.value}
          </p>
        </div>
      )}
    </Link>
  );
}
