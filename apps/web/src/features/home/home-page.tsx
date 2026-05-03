"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { useState } from "react";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { buttonStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { MotionReveal } from "@/components/motion-reveal";
import { WaitlistBadge } from "@/components/waitlist-badge";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { TrustedProviderGrid } from "@/features/home/trusted-provider-grid";

// ─── Hero preview data (static, presentational) ───────────────────────────────
const HERO_CARDS = [
  {
    key: "wise",
    provider: "Wise",
    initials: "W",
    bg: "#164B3E",
    category: "International Transfer",
    metricLabel: "FX Spread",
    metricValue: "0.41%",
    badge: "Best Value",
    badgeStyle: { background: "rgba(16,185,129,0.18)", color: "#34d399" } as React.CSSProperties,
    dotColor: "bg-emerald-400",
    floatClass: "floating-layer",
    posClass: "left-0 top-0",
    motionDelay: "60ms",
  },
  {
    key: "revolut",
    provider: "Revolut",
    initials: "R",
    bg: "#2D1B69",
    category: "Premium Card",
    metricLabel: "Cashback",
    metricValue: "1%",
    badge: "Travel Pick",
    badgeStyle: { background: "rgba(99,102,241,0.18)", color: "#a5b4fc" } as React.CSSProperties,
    dotColor: "bg-indigo-400",
    floatClass: "floating-layer-delayed",
    posClass: "right-0 top-[96px]",
    motionDelay: "180ms",
  },
  {
    key: "tr",
    provider: "Trade Republic",
    initials: "TR",
    bg: "#0B2B1C",
    category: "Investment",
    metricLabel: "Annual rate",
    metricValue: "4.00%",
    badge: "Top Return",
    badgeStyle: { background: "rgba(16,185,129,0.18)", color: "#34d399" } as React.CSSProperties,
    dotColor: "bg-emerald-400",
    floatClass: "floating-layer",
    posClass: "left-[16px] bottom-0",
    motionDelay: "300ms",
  },
] as const;

// ─── Intent categories ─────────────────────────────────────────────────────────
type IntentEntry = {
  category: MarketplaceCategory;
  headline: string;
  descriptions: Record<string, string>;
};

const INTENT_CATEGORIES: IntentEntry[] = [
  { category: "transfers", headline: "Send Money", descriptions: { en: "Best FX rates · lowest fees", de: "Beste Kurse · niedrigste Gebühren", es: "Mejores tipos · menores tarifas", fr: "Meilleurs taux · frais réduits", it: "Tariffe migliori · commissioni basse", pt: "Melhores taxas · menores tarifas" } },
  { category: "loans",    headline: "Get a Loan",  descriptions: { en: "From 3.9% APR · fast approval", de: "Ab 3,9% APR · schnelle Genehmigung", es: "Desde 3,9% TAE · aprobación rápida", fr: "Dès 3,9% APR · approbation rapide", it: "Da 3,9% APR · approvazione rapida", pt: "A partir de 3,9% APR · aprovação rápida" } },
  { category: "cards",    headline: "Get a Card",  descriptions: { en: "Cashback, travel & no-fee cards", de: "Cashback, Reise & gebührenfreie Karten", es: "Cashback, viaje y sin comisiones", fr: "Cashback, voyage & sans frais", it: "Cashback, viaggi & senza commissioni", pt: "Cashback, viagem & sem taxas" } },
  { category: "exchange", headline: "Exchange Currency", descriptions: { en: "Real rates · no hidden markup", de: "Echte Kurse · keine versteckten Aufschläge", es: "Tipos reales · sin margen oculto", fr: "Vrais taux · sans marge cachée", it: "Tassi reali · nessun markup nascosto", pt: "Taxas reais · sem margem oculta" } },
  { category: "insurance", headline: "Get Insurance", descriptions: { en: "Travel, health & life coverage", de: "Reise-, Kranken- & Lebensversicherung", es: "Cobertura de viaje, salud y vida", fr: "Voyage, santé & vie", it: "Viaggio, salute & vita", pt: "Viagem, saúde & vida" } },
  { category: "investments", headline: "Invest", descriptions: { en: "Stocks, ETFs, crypto & more", de: "Aktien, ETFs, Krypto & mehr", es: "Acciones, ETFs, criptomonedas & más", fr: "Actions, ETF, crypto & plus", it: "Azioni, ETF, crypto & altro", pt: "Ações, ETFs, cripto & mais" } },
];

// ─── Why Payn icons ────────────────────────────────────────────────────────────
const whyPaynIcons = [
  <svg key="sort" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h12" /><path d="M17 18h4" /></svg>,
  <svg key="shield" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9.5 12.5L11 14l4-4" /></svg>,
  <svg key="bars" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="7" height="16" rx="2" /><rect x="14" y="8" width="7" height="12" rx="2" /><path d="M7 8h0M18 12h0" /></svg>,
  <svg key="coin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M8.5 7.5a3.5 3.5 0 017 0c0 4.5-7 3-7 7a3.5 3.5 0 007 0" /></svg>,
];

// ─── Intent chip icon ──────────────────────────────────────────────────────────
function IntentIcon({ category }: { category: MarketplaceCategory }) {
  if (category === "loans") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 7h14M5 10.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  if (category === "cards") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6.5h14M4 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  if (category === "transfers") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11 2l3 3-3 3M2 5h12M5 14l-3-3 3-3M14 11H2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (category === "exchange") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  if (category === "insurance") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline points="1 10 4.5 6.5 7 9 11 4 15 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Waitlist modal (unchanged) ────────────────────────────────────────────────
type WaitlistModalStrings = {
  badge: string;
  title: string;
  subtitle: string;
  placeholder: string;
  submit: string;
  submitting: string;
  successMessage: string;
  errorFallback: string;
  noSpam: string;
};

function AppWaitlistModal({ onClose, strings }: { onClose: () => void; strings: WaitlistModalStrings }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform: "both", source: "homepage-promo" }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        setStatus("error");
        setMessage(payload?.error ?? strings.errorFallback);
        return;
      }
      setStatus("success");
      setMessage(strings.successMessage);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(strings.errorFallback);
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[28px] border border-[#EAEAEA] bg-white p-7 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F5] text-ink-tertiary transition-colors hover:bg-[#E8E8EA] hover:text-ink" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{strings.badge}
        </span>
        <h3 className="mt-4 text-[1.2rem] font-bold tracking-[-0.025em] text-[#0D0D0D]">{strings.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#5F6368]">{strings.subtitle}</p>
        {status === "success" ? (
          <div className="mt-6 rounded-[16px] bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800">{message}</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
            <input type="email" required autoComplete="email" placeholder={strings.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} disabled={status === "loading"} className="h-[52px] w-full rounded-[16px] border border-[#EAEAEA] bg-white px-4 text-sm font-medium text-[#0D0D0D] outline-none transition-all duration-200 placeholder:text-[#9AA0A6] focus:border-black/20 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] disabled:opacity-60" />
            {message && status === "error" && <p className="text-xs text-red-600">{message}</p>}
            <button type="submit" disabled={status === "loading"} className="h-[52px] w-full rounded-[16px] bg-black text-sm font-semibold text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40">
              {status === "loading" ? strings.submitting : strings.submit}
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-xs text-[#9AA0A6]">{strings.noSpam}</p>
      </div>
    </div>
  );
}

const impactSiteVerificationText = "Impact-Site-Verification: 947cb54d-d0de-4e29-b31f-5560a22cba3c";

// ─── Main component ────────────────────────────────────────────────────────────
export function HomePage() {
  const preferences = useMarketplacePreferences();
  const { user, loading } = useAuth();
  const { locale } = preferences;
  const [appPromoOpen, setAppPromoOpen] = useState(false);
  const dictionary = getDictionary(locale);
  const whyPaynCards = dictionary.home.whyPaynCards;
  const discoverHref = localePath(locale, "/discover");
  const authHref = localePath(locale, "/signup");

  return (
    <div className="grid gap-8 lg:gap-10">
      <AnalyticsPageView
        eventName={AnalyticsEvent.LandingViewed}
        dedupeKey="landing"
        properties={buildWebAnalyticsProperties({ country: preferences.country, language: locale, loggedIn: Boolean(user) })}
        ready={!loading}
      />
      <p className="sr-only" lang="en">{impactSiteVerificationText}</p>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <MotionReveal
        as="section"
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-zinc-950 px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:px-8 sm:py-12 lg:px-12 lg:py-16"
      >
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.16),transparent_36%),radial-gradient(ellipse_at_80%_0%,rgba(34,211,238,0.10),transparent_28%),linear-gradient(180deg,rgba(9,9,11,0.97),rgba(9,9,11,0.92))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">

          {/* ── Left: copy ── */}
          <div className="relative z-10 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {dictionary.home.heroEyebrowShort}
            </div>

            {/* Headline */}
            <h1 className="mt-6 max-w-[16ch] text-[2.6rem] font-extrabold leading-[0.9] tracking-[-0.06em] text-slate-50 sm:text-[3.6rem] lg:text-[4.4rem]">
              {dictionary.home.heroHeadline.split("You won't.").length > 1 ? (
                <>
                  {dictionary.home.heroHeadline.split("You won't.")[0]}
                  <span className="text-emerald-400">You won&apos;t.</span>
                </>
              ) : dictionary.home.heroHeadline}
            </h1>

            {/* Subheadline */}
            <p className="mt-5 max-w-[36ch] text-[16px] leading-7 text-slate-400 sm:text-[18px]">
              {dictionary.home.heroSubtitleShort}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={discoverHref}
                className={`${buttonStyles({ variant: "primary", size: "lg" })} hero-primary-cta gap-2`}
              >
                {dictionary.home.heroCta}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href={authHref}
                className={`${buttonStyles({ variant: "ghost", size: "lg" })} border border-white/10 text-slate-300 hover:bg-white/[0.04] hover:text-white`}
              >
                {dictionary.home.heroCtaSecondary}
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {[
                { text: dictionary.home.heroPillProviders, icon: "✦" },
                { text: dictionary.home.heroPillCategories, icon: null },
                { text: dictionary.home.heroPillNoSignup, icon: null },
              ].map((pill) => (
                <span
                  key={pill.text}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500"
                >
                  {pill.icon && <span className="text-[10px] text-emerald-400">{pill.icon}</span>}
                  {pill.text}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: floating offer preview cards ── */}
          <div className="relative z-10 hidden min-h-[400px] lg:block">
            {/* Background glows */}
            <div className="pointer-events-none absolute right-6 top-12 h-56 w-56 rounded-full bg-emerald-500/8 blur-3xl" />
            <div className="pointer-events-none absolute left-2 bottom-6 h-40 w-40 rounded-full bg-cyan-400/8 blur-3xl" />

            {HERO_CARDS.map((card) => (
              <div
                key={card.key}
                className={`${card.floatClass} motion-card absolute w-[204px] rounded-[22px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_22px_54px_rgba(0,0,0,0.5)] backdrop-blur-md ${card.posClass}`}
                style={{ ["--motion-delay" as string]: card.motionDelay }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: card.bg }}
                  >
                    {card.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] text-slate-500">{card.category}</p>
                    <p className="truncate text-[13px] font-bold leading-tight text-slate-50">{card.provider}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {card.metricLabel}
                  </p>
                  <p className="mt-0.5 text-[2rem] font-extrabold leading-none tracking-[-0.07em] tabular-nums text-slate-50">
                    {card.metricValue}
                  </p>
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={card.badgeStyle}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${card.dotColor}`} />
                  {card.badge}
                </div>
              </div>
            ))}

            {/* Live signal pill */}
            <div className="absolute right-0 bottom-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-semibold text-slate-400 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live rates · updated daily
            </div>
          </div>
        </div>
      </MotionReveal>

      {/* ══════════════════════════════════════════════════════════
          TRUST — provider logos + stat counters
      ══════════════════════════════════════════════════════════ */}
      <MotionReveal delay={80}>
        <TrustedProviderGrid locale={locale} />
      </MotionReveal>

      {/* ══════════════════════════════════════════════════════════
          INTENT SELECTOR + WHY PAYN
      ══════════════════════════════════════════════════════════ */}
      <MotionReveal
        as="section"
        delay={120}
        className="section-shell border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md sm:p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-slate-500">
              {dictionary.home.howItWorksEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-slate-50">{dictionary.home.howItWorksTitle}</h2>
            <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-slate-400">
              Pick a category and we&apos;ll show you the best options for your country.
            </p>
          </div>
          <Link href={discoverHref} className={`${buttonStyles({ variant: "secondary", size: "md" })} shrink-0`}>
            {dictionary.home.openExplore}
          </Link>
        </div>

        {/* 2×3 intent chip grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INTENT_CATEGORIES.map((item) => (
            <Link
              key={item.category}
              href={localePath(locale, `/${item.category}`)}
              className="group flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:border-emerald-500/25 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.08] text-slate-400 transition-colors duration-200 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/10 group-hover:text-emerald-400">
                <IntentIcon category={item.category} />
              </div>
              <div>
                <p className="text-[14px] font-bold leading-tight tracking-[-0.02em] text-slate-50">
                  {item.headline}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {item.descriptions[locale] ?? item.descriptions.en}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Compare
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* 3-step UX flow */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {["Pick a category", "Your country auto-applied", "See best offer"].map((label, i) => (
            <span key={label} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-slate-700">→</span>}
              <span className="flex items-center gap-1.5 text-[12px] text-slate-600">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-500"}`}>
                  {i + 1}
                </span>
                {label}
              </span>
            </span>
          ))}
          <span className="ml-auto text-[12px] text-slate-600">{dictionary.home.noAccountRequired}</span>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/10" />

        {/* Why Payn */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-slate-500">
              {dictionary.home.whyPaynEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-slate-50">{dictionary.home.whyPaynTitle}</h2>
          </div>
          <Link
            href={localePath(locale, "/ranking")}
            className="shrink-0 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-100"
          >
            {dictionary.home.howWeRankOffers} &rarr;
          </Link>
        </div>

        <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {whyPaynCards.slice(0, 3).map((point, index) => (
            <div
              key={point.title}
              className="flex h-full flex-col rounded-[26px] border border-white/10 bg-white/[0.04] px-5 py-5 backdrop-blur-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.08] text-slate-100">
                {whyPaynIcons[index] ?? whyPaynIcons[0]}
              </div>
              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-slate-100">{point.title}</p>
              <p className="mt-2 text-[13px] leading-6 text-slate-400">{point.description}</p>
            </div>
          ))}
        </div>
      </MotionReveal>

      {/* ══════════════════════════════════════════════════════════
          MOBILE APP PROMO
      ══════════════════════════════════════════════════════════ */}
      <MotionReveal as="section" delay={180} className="overflow-hidden rounded-[32px] bg-[#0A0D0C]">
        <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
            <WaitlistBadge badge={dictionary.home.mobile.badge} />
            <h2 className="mt-5 text-[1.65rem] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[2rem]">
              {dictionary.home.mobile.heading}
            </h2>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-white/50">
              {dictionary.home.mobile.subtitle}
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/40">
                <svg width="10" height="12" viewBox="0 0 22 26" fill="white" className="opacity-60">
                  <path d="M18.128 13.784c-.029-3.223 2.639-4.791 2.761-4.864-1.511-2.203-3.853-2.504-4.676-2.528-1.967-.207-3.875 1.177-4.877 1.177-1.016 0-2.543-1.157-4.199-1.123-2.121.034-4.112 1.263-5.199 3.188-2.255 3.886-.576 9.6 1.584 12.757 1.086 1.553 2.355 3.287 4.012 3.226 1.625-.067 2.232-1.036 4.193-1.036 1.943 0 2.513 1.036 4.207.997 1.744-.028 2.842-1.56 3.89-3.127 1.255-1.78 1.759-3.533 1.779-3.623-.041-.014-3.387-1.291-3.424-5.149zM14.928 3.306C15.819 2.207 16.424.756 16.26-.001c-1.244.052-2.79.852-3.684 1.907-.793.935-1.505 2.468-1.319 3.907 1.403.108 2.849-.7 3.671-2.507z" />
                </svg>
                iOS
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/40">
                <svg width="10" height="11" viewBox="0 0 20 22" fill="none" className="opacity-60">
                  <path d="M1.22.345C.96.625.81 1.065.81 1.635v18.73c0 .57.15 1.01.41 1.29l.07.065 10.5-10.5v-.24L1.29.28l-.07.065z" fill="white" />
                  <path d="M15.3 14.72l-3.51-3.5v-.24l3.51-3.5.08.045 4.16 2.36c1.19.675 1.19 1.78 0 2.46l-4.16 2.36-.08.02z" fill="white" />
                  <path d="M15.38 14.7L11.79 11.11 1.22 21.655c.39.415 1.04.465 1.77.05l12.39-7.005z" fill="white" />
                  <path d="M15.38 7.52L2.99.515C2.26.1 1.61.145 1.22.56L11.79 11.11l3.59-3.59z" fill="white" />
                </svg>
                Android
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAppPromoOpen(true)}
                className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[13px] font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                {dictionary.home.mobile.joinWishlist}
              </button>
              <Link
                href={localePath(locale, "/waitlist")}
                className="inline-flex h-11 items-center rounded-full border border-white/[0.14] px-6 text-[13px] font-semibold text-white/60 transition-all hover:border-white/25 hover:text-white/90"
              >
                {dictionary.home.mobile.learnMore}
              </Link>
            </div>
          </div>

          <div className="flex items-end justify-center overflow-hidden px-6 pb-0 pt-8 lg:items-center lg:py-6 lg:pr-12">
            {/* Compact offer preview instead of blueprint */}
            <div className="w-full max-w-[320px] rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Your shortlist</p>
              <div className="mt-4 grid gap-3">
                {[
                  { name: "Wise", cat: "Transfer", val: "0.41%", tag: "Best FX" },
                  { name: "N26 Black", cat: "Card", val: "€9.90/mo", tag: "No FX fees" },
                  { name: "Trade Republic", cat: "Investment", val: "4.00%", tag: "Top rate" },
                ].map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.04] px-3.5 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/10 text-[10px] font-bold text-slate-300">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[12px] font-bold text-slate-100">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.cat}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold tabular-nums text-slate-50">{item.val}</p>
                      <p className="text-[10px] text-emerald-400">{item.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-600">Syncs to mobile automatically</p>
            </div>
          </div>
        </div>
      </MotionReveal>

      {/* Waitlist modal */}
      {appPromoOpen && (
        <AppWaitlistModal onClose={() => setAppPromoOpen(false)} strings={dictionary.home.waitlistModal} />
      )}
    </div>
  );
}
