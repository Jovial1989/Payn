"use client";

import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLogo } from "@/components/provider-logo";
import {
  AppStoreButton,
  GooglePlayButton,
  HeroPhoneMockup,
  WaitlistBadge,
} from "@/components/hero-phone-mockup";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { countOffersByCategory } from "@/lib/marketplace-engine";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getOfferDecisionBadge } from "@/lib/offer-badges";
import {
  getOfferHref,
  marketDefinitions,
  marketplaceCategories,
  matchesOfferMarket,
  normalizeDisplayText,
  roundOfferCount,
} from "@/lib/marketplace";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { HeroMarketPanel, type HeroMarketOffer } from "@/features/home/hero-market-panel";

const categoryIcons: Record<MarketplaceCategory, React.ReactNode> = {
  loans: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  cards: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  transfers: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  exchange: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
  insurance: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  investments: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

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

export function HomePage() {
  const preferences = useMarketplacePreferences();
  const { locale, market } = preferences;
  const dictionary = getDictionary(locale);
  const whyPaynCards = whyPaynCardsByLocale[locale] ?? whyPaynCardsByLocale.en;
  const categoryCounts = countOffersByCategory(marketplaceOffers, market);
  const topResults = marketplaceOffers
    .filter((offer) => matchesOfferMarket(offer, market))
    .sort((left, right) => right.affiliatePriorityScore - left.affiliatePriorityScore)
    .slice(0, 3)
    .map((offer, index) => {
      const decisionBadge = getOfferDecisionBadge(offer, index + 1);

      return {
        offer,
        rank: index + 1,
        provider: offer.providerName,
        title: normalizeDisplayText(offer.title),
        category: dictionary.categories[offer.category],
        metric: normalizeDisplayText(offer.metrics[0]?.value ?? ""),
        badgeTone:
          decisionBadge === "noFees"
            ? "noFees"
            : decisionBadge === "fastest"
              ? "flexible"
              : "bestValue",
        tag: (() => {
          if (decisionBadge === "fastest") {
            return dictionary.home.tagFastest;
          }

          if (decisionBadge === "noFees") {
            return dictionary.home.tagNoFees;
          }

          return dictionary.home.tagBestValue;
        })(),
      } satisfies HeroMarketOffer & { title: string; category: string };
    });
  const totalOffers = marketplaceOffers.filter((o) => matchesOfferMarket(o, market)).length;
  const uniqueProviders = new Set(
    marketplaceOffers.filter((o) => matchesOfferMarket(o, market)).map((o) => o.providerName),
  ).size;
  const quickActionCategories: MarketplaceCategory[] = [
    "loans",
    "transfers",
    "cards",
    "exchange",
  ];

  return (
    <div className="grid gap-8 lg:gap-10">
      <section className="overflow-hidden rounded-[32px] border border-line bg-white">
        <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-center">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.home.heroEyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl text-display text-ink">{dictionary.home.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary sm:text-lg">
              {dictionary.home.heroSubtitle}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={localePath(locale, "/explore")}
                className={buttonStyles({ variant: "primary", size: "lg" })}
              >
                {dictionary.home.heroCta}
              </Link>
              <Link
                href="#top-offers"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                {dictionary.home.heroCtaSecondary}
              </Link>
            </div>
          </div>

          <HeroMarketPanel
            locale={locale}
            marketLabel={dictionary.markets[market]}
            offers={topResults}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: `${totalOffers}`, label: "Offers compared" },
          { value: `${uniqueProviders}`, label: "Providers" },
          { value: `${Object.keys(categoryCounts).length}`, label: "Categories" },
          { value: `${Object.keys(marketDefinitions).length}`, label: "Markets" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-line bg-white px-4 py-4 text-center"
          >
            <p className="text-2xl font-bold tracking-tight text-ink">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-ink-tertiary">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-h3 text-ink">{dictionary.home.needsTitle}</h2>
          </div>
          <Link
            href={localePath(locale, "/explore")}
            className="text-sm font-semibold text-ink-tertiary transition-colors hover:text-ink"
          >
            {dictionary.home.seeAll}
          </Link>
        </div>

        <div className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {dictionary.home.needsActions.map((label, index) => {
            const category = quickActionCategories[index] ?? "loans";

            return (
              <Link
                key={label}
                href={localePath(locale, `/${market}/${category}`)}
                className="group flex items-center justify-between rounded-[22px] border border-line bg-bg-surface px-4 py-4 text-left transition-colors hover:border-black/10 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-ink">
                    {categoryIcons[category]}
                  </span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-ink-tertiary transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    d="M3.5 8h9m0 0L9 4.5M12.5 8L9 11.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="top-offers" className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.home.topRanked}
              </p>
              <h2 className="mt-2 text-h3 text-ink">{dictionary.home.topRankedSubtitle}</h2>
            </div>
            <Link
              href={localePath(locale, "/explore")}
              className="text-xs font-semibold text-ink-tertiary transition-colors hover:text-ink"
            >
              {dictionary.home.seeAll}
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {topResults.map((item) => (
              <Link
                key={item.offer.id}
                href={localePath(locale, getOfferHref(item.offer))}
                className="group rounded-[20px] border border-black/5 bg-bg-surface px-4 py-4 transition-colors hover:border-line-strong hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <ProviderLogo
                      providerName={item.provider}
                      websiteUrl={item.offer.providerWebsiteUrl}
                      size="sm"
                      muted={false}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold text-white">
                          #{item.rank}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-tertiary">
                          {dictionary.offerCard.updated}
                        </span>
                        <span className="rounded-full bg-accent-green px-2.5 py-1 text-[10px] font-semibold text-accent-green-text">
                          {item.tag}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-ink">{item.provider}</p>
                      <p className="mt-1 text-base font-bold tracking-tight text-ink">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-secondary">{item.category}</p>
                    </div>
                  </div>

                    <span className="rounded-[14px] bg-white px-3 py-2 text-sm font-bold tabular-nums text-ink">
                      {item.metric}
                    </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[28px] border border-line bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {dictionary.home.browseByCategory}
          </p>
          <div className="mt-5 flex flex-1 flex-col gap-3">
            {marketplaceCategories.map((category) => {
              const count = categoryCounts[category];

              return (
                <Link
                  key={category}
                  href={localePath(locale, `/${market}/${category}`)}
                  className="group flex w-full items-center justify-between rounded-[20px] border border-transparent bg-bg-surface px-4 py-4 text-left text-ink-secondary transition-colors hover:border-black/10 hover:bg-white hover:text-ink"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-ink">
                      {categoryIcons[category]}
                    </span>
                    <p className="min-w-0 text-sm font-semibold text-ink">
                      {dictionary.categories[category]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-tertiary transition-colors group-hover:text-ink">
                      {roundOfferCount(count)} {dictionary.home.products}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 text-ink-tertiary transition-all group-hover:translate-x-0.5 group-hover:text-ink"
                    >
                      <path
                        d="M3.5 8h9m0 0L9 4.5M12.5 8L9 11.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.home.whyPaynEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{dictionary.home.whyPaynTitle}</h2>
            <Link
              href={localePath(locale, "/ranking")}
              className="mt-4 inline-block text-sm font-semibold text-ink-tertiary transition-colors hover:text-ink"
            >
              How we rank offers &rarr;
            </Link>
          </div>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {whyPaynCards.map((point, index) => (
              <div
                key={point.title}
                className="flex h-full flex-col rounded-[18px] border border-line bg-[#F6F7F8] px-4 py-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-ink">
                  {whyPaynIcons[index] ?? whyPaynIcons[0]}
                </div>
                <p className="mt-4 text-sm font-semibold text-ink">{point.title}</p>
                <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-ink-secondary">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.home.howItWorksEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{dictionary.home.howItWorksTitle}</h2>
          </div>
          <Link
            href={localePath(locale, "/explore")}
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            {dictionary.home.openExplore}
          </Link>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {dictionary.home.steps.map((step, index) => (
            <div key={step} className="rounded-[18px] border border-line bg-bg-surface px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {dictionary.home.step} {index + 1}
              </p>
              <p className="mt-3 text-base font-semibold leading-relaxed text-ink">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-line bg-white">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
            <WaitlistBadge locale={locale} />

            <h2 className="mt-5 max-w-lg text-h2 text-ink lg:text-h1">
              {dictionary.home.appHeadline}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-secondary sm:text-base">
              {dictionary.home.appSubtitle}
            </p>

            <div className="mt-5 grid gap-3">
              {dictionary.home.appBullets.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-green text-accent-green-text">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l4 4 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-ink-secondary">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="rounded-[18px] bg-[#0d1110] p-1">
                <AppStoreButton locale={locale} />
              </div>
              <div className="rounded-[18px] bg-[#0d1110] p-1">
                <GooglePlayButton locale={locale} />
              </div>
            </div>

            <p className="mt-4 text-[12px] text-ink-tertiary">{dictionary.home.appWaitlistNote}</p>
          </div>

          <div className="relative hidden bg-[radial-gradient(circle_at_50%_40%,_rgba(15,23,42,0.06),_transparent_62%)] lg:flex lg:items-center lg:justify-center">
            <div className="relative py-10">
              <HeroPhoneMockup locale={locale} />
            </div>
          </div>

          <div className="flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,_rgba(15,23,42,0.06),_transparent_62%)] px-6 pb-10 lg:hidden">
            <div className="scale-90">
              <HeroPhoneMockup locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
