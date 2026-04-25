"use client";

import type { MarketplaceLocale } from "@payn/types";
import Link from "next/link";
import { useState } from "react";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { buttonStyles } from "@/components/button";
import { ProductEntryActionLabel } from "@/components/product-entry-action";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import { HeroPhoneMockup, WaitlistBadge } from "@/components/hero-phone-mockup";
import { MotionReveal } from "@/components/motion-reveal";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { HeroProductShowcase } from "@/features/home/hero-product-showcase";
import { TrustedProviderGrid } from "@/features/home/trusted-provider-grid";

const whyPaynIcons = [
  (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h12" />
      <path d="M17 18h4" />
    </svg>
  ),
  (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12.5L11 14l4-4" />
    </svg>
  ),
  (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="7" height="16" rx="2" />
      <rect x="14" y="8" width="7" height="12" rx="2" />
      <path d="M7 8h0M18 12h0" />
    </svg>
  ),
  (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v18" />
      <path d="M8.5 7.5a3.5 3.5 0 017 0c0 4.5-7 3-7 7a3.5 3.5 0 007 0" />
    </svg>
  ),
];

const whyPaynCardsByLocale: Record<
  MarketplaceLocale,
  Array<{ title: string; description: string }>
> = {
  en: [
    {
      title: "Transparent pricing",
      description: "Rates, fees, and tradeoffs stay visible before you leave Payn.",
    },
    {
      title: "No hidden fees",
      description: "Cost signals stay upfront instead of getting buried inside provider flows.",
    },
    {
      title: "Decision-first UX",
      description: "Compare quickly and move only when a result is worth your time.",
    },
    {
      title: "No credit impact",
      description: "Checking options on Payn does not affect your credit score.",
    },
  ],
  de: [
    {
      title: "Transparente Preise",
      description: "Zinsen, Gebühren und Zielkonflikte bleiben sichtbar, bevor Sie weiterklicken.",
    },
    {
      title: "Keine versteckten Gebühren",
      description: "Wichtige Kostensignale bleiben vorne statt im Anbieterprozess verborgen.",
    },
    {
      title: "Entscheidungsorientiert",
      description: "Schnell vergleichen und nur weitergehen, wenn das Ergebnis überzeugt.",
    },
    {
      title: "Ohne Score-Effekt",
      description: "Das Prüfen von Optionen auf Payn beeinflusst Ihre Bonität nicht.",
    },
  ],
  es: [
    {
      title: "Precios transparentes",
      description: "Tipos, comisiones y compromisos siguen visibles antes de salir de Payn.",
    },
    {
      title: "Sin comisiones ocultas",
      description: "Las señales de coste quedan al frente y no escondidas en el flujo del proveedor.",
    },
    {
      title: "UX para decidir",
      description: "Compara rápido y avanza solo cuando una opción merece tu tiempo.",
    },
    {
      title: "Sin impacto crediticio",
      description: "Consultar opciones en Payn no afecta tu puntuación crediticia.",
    },
  ],
  fr: [
    {
      title: "Tarification claire",
      description: "Taux, frais et compromis restent visibles avant de quitter Payn.",
    },
    {
      title: "Pas de frais cachés",
      description: "Les signaux de coût restent en surface au lieu d'être noyés dans le parcours du partenaire.",
    },
    {
      title: "Pensé pour décider",
      description: "Comparez vite et n'avancez que lorsqu'une offre mérite votre temps.",
    },
    {
      title: "Sans impact crédit",
      description: "Consulter des options sur Payn n'affecte pas votre score de crédit.",
    },
  ],
  it: [
    {
      title: "Prezzi trasparenti",
      description: "Tassi, costi e compromessi restano visibili prima di uscire da Payn.",
    },
    {
      title: "Nessun costo nascosto",
      description: "I segnali di costo restano in primo piano invece di sparire nel flusso del provider.",
    },
    {
      title: "UX orientata alla scelta",
      description: "Confronta rapidamente e vai avanti solo quando un risultato vale il tuo tempo.",
    },
    {
      title: "Nessun impatto sul credito",
      description: "Controllare le opzioni su Payn non influisce sul tuo punteggio creditizio.",
    },
  ],
  pt: [
    {
      title: "Preços transparentes",
      description: "Taxas, comissões e compromissos mantêm-se visíveis antes de sair da Payn.",
    },
    {
      title: "Sem comissões ocultas",
      description: "Os sinais de custo ficam à frente em vez de desaparecerem no fluxo do fornecedor.",
    },
    {
      title: "UX para decidir",
      description: "Compare depressa e avance apenas quando a opção merece o seu tempo.",
    },
    {
      title: "Sem impacto no crédito",
      description: "Ver opções na Payn não afeta a sua pontuação de crédito.",
    },
  ],
};

function AppWaitlistModal({ onClose }: { onClose: () => void }) {
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
        setMessage(payload?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("You're on the list! We'll notify you when the app launches.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[28px] border border-[#EAEAEA] bg-white p-7 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F5] text-ink-tertiary transition-colors hover:bg-[#E8E8EA] hover:text-ink"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        {/* Early access badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Early access
        </span>

        <h3 className="mt-4 text-[1.2rem] font-bold tracking-[-0.025em] text-[#0D0D0D]">
          Get notified at launch
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#5F6368]">
          Enter your email and we'll reach out as soon as Payn is live on iOS and Android.
        </p>

        {status === "success" ? (
          <div className="mt-6 rounded-[16px] bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="h-[52px] w-full rounded-[16px] border border-[#EAEAEA] bg-white px-4 text-sm font-medium text-[#0D0D0D] outline-none transition-all duration-200 placeholder:text-[#9AA0A6] focus:border-black/20 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] disabled:opacity-60"
            />
            {message && status === "error" && (
              <p className="text-xs text-red-600">{message}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-[52px] w-full rounded-[16px] bg-black text-sm font-semibold text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "loading" ? "Saving…" : "Notify me"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-[#9AA0A6]">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

const impactSiteVerificationText =
  "Impact-Site-Verification: 947cb54d-d0de-4e29-b31f-5560a22cba3c";

export function HomePage() {
  const preferences = useMarketplacePreferences();
  const { user, loading } = useAuth();
  const { locale } = preferences;
  const [appPromoOpen, setAppPromoOpen] = useState(false);
  const dictionary = getDictionary(locale);
  const whyPaynCards = whyPaynCardsByLocale[locale] ?? whyPaynCardsByLocale.en;
  const discoverHref = localePath(locale, "/discover");

  return (
    <div className="grid gap-8 lg:gap-10">
      <AnalyticsPageView
        eventName={AnalyticsEvent.LandingViewed}
        dedupeKey="landing"
        properties={buildWebAnalyticsProperties({
          country: preferences.country,
          language: locale,
          loggedIn: Boolean(user),
        })}
        ready={!loading}
      />
      <p className="sr-only" lang="en">
        {impactSiteVerificationText}
      </p>

      <MotionReveal as="section" className="overflow-hidden rounded-[36px] border border-line bg-white shadow-[0_24px_60px_rgba(15,23,32,0.06)]">
        <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-10 lg:px-12 lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-emerald">
              Best options for your money
            </p>
            <h1 className="mt-4 max-w-2xl text-[2.3rem] font-extrabold leading-[0.98] tracking-[-0.05em] text-ink sm:text-[3.4rem] lg:text-[4.25rem]">
              {dictionary.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-ink-secondary sm:text-[17px]">
              {dictionary.home.heroSubtitle}
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href={discoverHref}
                className={`${buttonStyles({ variant: "primary", size: "lg" })} w-full sm:w-auto`}
              >
                <ProductEntryActionLabel locale={locale} />
              </Link>
              <Link
                href={discoverHref}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:text-ink"
              >
                {dictionary.home.heroCtaSecondary}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-[#F7F9F7] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Ranked offers
                </p>
                <p className="mt-2 text-[1.7rem] font-extrabold tracking-[-0.05em] text-ink">
                  40+
                </p>
              </div>
              <div className="rounded-[22px] bg-[#F7F9F7] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Markets
                </p>
                <p className="mt-2 text-[1.7rem] font-extrabold tracking-[-0.05em] text-ink">
                  EU
                </p>
              </div>
              <div className="rounded-[22px] bg-[#F7F9F7] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Clarity first
                </p>
                <p className="mt-2 text-[1.7rem] font-extrabold tracking-[-0.05em] text-ink">
                  1 tap
                </p>
              </div>
            </div>
          </div>

          <HeroProductShowcase
            locale={locale}
            countryName={preferences.countryLabel}
          />
        </div>
      </MotionReveal>

      <MotionReveal delay={80}>
        <TrustedProviderGrid locale={locale} />
      </MotionReveal>

      <MotionReveal
        as="section"
        delay={120}
        className="rounded-[32px] border border-line bg-white p-5 shadow-[0_18px_44px_rgba(15,23,32,0.04)] sm:p-6 lg:p-8"
      >
        {/* How it works */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.home.howItWorksEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{dictionary.home.howItWorksTitle}</h2>
          </div>
          <Link
            href={localePath(locale, "/discover")}
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            {dictionary.home.openExplore}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {dictionary.home.steps.map((step, index) => (
            <div key={step} className="relative flex flex-col rounded-[24px] border border-line bg-[#F7F9F7] px-5 py-5">
              <span className="font-mono text-[3rem] font-extrabold leading-none tracking-[-0.05em] text-ink-tertiary/25 select-none">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ink shadow-subtle">
                {index === 0 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7" /><circle cx="19" cy="18" r="3" /><path d="M19 16v2l1 1" /></svg>
                )}
                {index === 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="7" height="14" rx="2" /><rect x="14" y="9" width="7" height="10" rx="2" /></svg>
                )}
                {index === 2 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                )}
              </div>
              <p className="mt-4 text-[15px] font-semibold leading-relaxed tracking-[-0.02em] text-ink">{step}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-ink-tertiary">
          No account required to compare.
        </p>

        {/* Divider */}
        <div className="my-8 border-t border-line" />

        {/* Why Payn */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.home.whyPaynEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{dictionary.home.whyPaynTitle}</h2>
          </div>
          <Link
            href={localePath(locale, "/ranking")}
            className="shrink-0 text-sm font-semibold text-ink-tertiary transition-colors hover:text-ink"
          >
            {dictionary.home.howWeRankOffers} &rarr;
          </Link>
        </div>

        <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {whyPaynCards.slice(0, 3).map((point, index) => (
            <div
              key={point.title}
              className="flex h-full flex-col rounded-[24px] border border-line bg-[#F7F9F7] px-5 py-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-ink">
                {whyPaynIcons[index] ?? whyPaynIcons[0]}
              </div>
              <p className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-ink">{point.title}</p>
              <p className="mt-2 text-[13px] leading-6 text-ink-secondary">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </MotionReveal>

      <MotionReveal
        as="section"
        delay={180}
        className="overflow-hidden rounded-[32px] bg-[#0A0D0C]"
      >
        <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Text side */}
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

          {/* Phone mockup */}
          <div className="flex items-end justify-center overflow-hidden px-6 pb-0 pt-8 lg:items-center lg:py-6 lg:pr-12">
            <div className="w-[240px] lg:w-[260px]">
              <HeroPhoneMockup locale={locale} />
            </div>
          </div>
        </div>
      </MotionReveal>

      {/* ── Waitlist modal ── */}
      {appPromoOpen && (
        <AppWaitlistModal onClose={() => setAppPromoOpen(false)} />
      )}
    </div>
  );
}
