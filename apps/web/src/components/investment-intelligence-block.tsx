"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { LightweightMarketChart } from "@/components/lightweight-market-chart";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { getMarketIntelligenceCopy } from "@/lib/market-intelligence-copy";
import {
  getInvestmentAccessMatches,
  marketIntelligenceAssetOptions,
  marketIntelligenceAssets,
  marketIntelligenceTimeframeOptions,
  normalizeMarketIntelligenceAsset,
  type InvestmentAccessMatch,
  type MarketIntelligenceAssetId,
  type MarketIntelligencePayload,
  type MarketIntelligenceTimeframe,
} from "@/lib/market-intelligence";

type ProviderTone = "accent" | "success" | "blue" | "purple" | "orange" | "muted";

type ProviderTag = {
  label: string;
  tone: ProviderTone;
};

type RankedProviderRow = {
  match: InvestmentAccessMatch;
  score: number;
  why: string;
  tags: ProviderTag[];
};

type InvestmentUiCopy = (typeof investmentUiCopy)[MarketplaceLocale];

const investmentUiCopy: Record<
  MarketplaceLocale,
  {
    chartTitle: string;
    chartSubtitle: string;
    pulse: string;
    trend: string;
    volatility: string;
    summary: string;
    providersTitle: string;
    providersBody: string;
    availableVia: string;
    lowestCost: string;
    bestRecurring: string;
    recurringAvailable: string;
    recurringUnavailable: string;
    accessType: string;
    fees: string;
    minDeposit: string;
    assets: string;
    bestFor: string;
    whyProvider: string;
    noProvidersTitle: string;
    noProvidersBody: string;
    unavailableTitle: string;
    unavailableBody: string;
    providerCta: string;
  }
> = {
  en: {
    chartTitle: "Market context first",
    chartSubtitle: "Change asset or timeframe and the market pulse, trend, and provider ranking update together.",
    pulse: "Market pulse",
    trend: "Trend",
    volatility: "Volatility",
    summary: "Summary",
    providersTitle: "Providers for this asset",
    providersBody: "Rows below reflect the selected asset first, then rank providers by cost, usability, and route fit.",
    availableVia: "Available via",
    lowestCost: "Lowest estimated cost",
    bestRecurring: "Best recurring route",
    recurringAvailable: "Savings plan",
    recurringUnavailable: "No recurring focus",
    accessType: "Access",
    fees: "Fees",
    minDeposit: "Min deposit",
    assets: "Assets",
    bestFor: "Best for",
    whyProvider: "Why this provider",
    noProvidersTitle: "No provider routes for this asset",
    noProvidersBody: "Switch asset to compare another access route.",
    unavailableTitle: "Market data unavailable",
    unavailableBody: "Payn only shows the chart when it has a real market dataset for the selected asset and timeframe.",
    providerCta: "View provider",
  },
  de: {
    chartTitle: "Zuerst Marktüberblick",
    chartSubtitle: "Wenn du Asset oder Zeitraum änderst, aktualisieren sich Marktimpuls, Trend und Anbieterranking gemeinsam.",
    pulse: "Marktimpuls",
    trend: "Trend",
    volatility: "Volatilität",
    summary: "Zusammenfassung",
    providersTitle: "Anbieter für dieses Asset",
    providersBody: "Die Reihen unten folgen zuerst dem gewählten Asset und ranken dann nach Kosten, Nutzbarkeit und Zugangsfit.",
    availableVia: "Verfügbar über",
    lowestCost: "Niedrigste Kostenschätzung",
    bestRecurring: "Bester Sparplan",
    recurringAvailable: "Sparplan",
    recurringUnavailable: "Kein Sparplan-Fokus",
    accessType: "Zugang",
    fees: "Gebühren",
    minDeposit: "Mindesteinzahlung",
    assets: "Assets",
    bestFor: "Am besten für",
    whyProvider: "Warum dieser Anbieter",
    noProvidersTitle: "Keine Routen für dieses Asset",
    noProvidersBody: "Wechsle das Asset, um eine andere Zugangsroute zu vergleichen.",
    unavailableTitle: "Marktdaten nicht verfügbar",
    unavailableBody: "Payn zeigt den Chart nur, wenn für Asset und Zeitraum ein echtes Marktdataset verfügbar ist.",
    providerCta: "Anbieter ansehen",
  },
  es: {
    chartTitle: "Primero el contexto de mercado",
    chartSubtitle: "Al cambiar activo o periodo, el pulso, la tendencia y el ranking de proveedores se actualizan juntos.",
    pulse: "Pulso",
    trend: "Tendencia",
    volatility: "Volatilidad",
    summary: "Resumen",
    providersTitle: "Proveedores para este activo",
    providersBody: "Las filas dependen primero del activo elegido y luego se ordenan por coste, facilidad y ajuste de acceso.",
    availableVia: "Disponible en",
    lowestCost: "Menor coste estimado",
    bestRecurring: "Mejor plan periódico",
    recurringAvailable: "Ahorro periódico",
    recurringUnavailable: "Sin enfoque periódico",
    accessType: "Acceso",
    fees: "Comisiones",
    minDeposit: "Depósito mínimo",
    assets: "Activos",
    bestFor: "Mejor para",
    whyProvider: "Por qué este proveedor",
    noProvidersTitle: "No hay rutas para este activo",
    noProvidersBody: "Cambia el activo para comparar otra ruta de acceso.",
    unavailableTitle: "Datos de mercado no disponibles",
    unavailableBody: "Payn solo muestra el gráfico cuando tiene un dataset real para el activo y periodo elegidos.",
    providerCta: "Ver proveedor",
  },
  fr: {
    chartTitle: "Commencer par le marché",
    chartSubtitle: "Si vous changez l’actif ou la période, le pulse, la tendance et le classement des plateformes changent ensemble.",
    pulse: "Pulse",
    trend: "Tendance",
    volatility: "Volatilité",
    summary: "Résumé",
    providersTitle: "Plateformes pour cet actif",
    providersBody: "Les lignes ci-dessous suivent d’abord l’actif choisi, puis classent les plateformes selon coût, simplicité et adéquation.",
    availableVia: "Disponible via",
    lowestCost: "Coût estimé le plus bas",
    bestRecurring: "Meilleur plan programmé",
    recurringAvailable: "Plan programmé",
    recurringUnavailable: "Sans focus programmé",
    accessType: "Accès",
    fees: "Frais",
    minDeposit: "Dépôt minimum",
    assets: "Actifs",
    bestFor: "Le plus adapté à",
    whyProvider: "Pourquoi cette plateforme",
    noProvidersTitle: "Aucune route pour cet actif",
    noProvidersBody: "Changez d’actif pour comparer une autre route d’accès.",
    unavailableTitle: "Données de marché indisponibles",
    unavailableBody: "Payn n’affiche le graphique que lorsqu’un dataset réel est disponible pour l’actif et la période sélectionnés.",
    providerCta: "Voir la plateforme",
  },
  it: {
    chartTitle: "Prima il contesto di mercato",
    chartSubtitle: "Quando cambi asset o periodo, impulso, trend e ranking dei provider si aggiornano insieme.",
    pulse: "Impulso",
    trend: "Trend",
    volatility: "Volatilità",
    summary: "Sintesi",
    providersTitle: "Provider per questo asset",
    providersBody: "Le righe sotto seguono prima l’asset selezionato e poi ordinano i provider per costo, usabilità e aderenza.",
    availableVia: "Disponibile tramite",
    lowestCost: "Costo stimato più basso",
    bestRecurring: "Miglior piano ricorrente",
    recurringAvailable: "Piano ricorrente",
    recurringUnavailable: "Nessun focus ricorrente",
    accessType: "Accesso",
    fees: "Costi",
    minDeposit: "Deposito minimo",
    assets: "Asset",
    bestFor: "Ideale per",
    whyProvider: "Perché questo provider",
    noProvidersTitle: "Nessuna route per questo asset",
    noProvidersBody: "Cambia asset per confrontare un’altra route di accesso.",
    unavailableTitle: "Dati di mercato non disponibili",
    unavailableBody: "Payn mostra il grafico solo quando dispone di un dataset reale per asset e periodo selezionati.",
    providerCta: "Vedi provider",
  },
  pt: {
    chartTitle: "Primeiro o contexto de mercado",
    chartSubtitle: "Quando muda o ativo ou o período, pulso, tendência e ranking dos provedores mudam juntos.",
    pulse: "Pulso",
    trend: "Tendência",
    volatility: "Volatilidade",
    summary: "Resumo",
    providersTitle: "Provedores para este ativo",
    providersBody: "As linhas abaixo seguem primeiro o ativo escolhido e depois ordenam os provedores por custo, usabilidade e adequação.",
    availableVia: "Disponível via",
    lowestCost: "Menor custo estimado",
    bestRecurring: "Melhor plano recorrente",
    recurringAvailable: "Plano recorrente",
    recurringUnavailable: "Sem foco recorrente",
    accessType: "Acesso",
    fees: "Custos",
    minDeposit: "Depósito mínimo",
    assets: "Ativos",
    bestFor: "Melhor para",
    whyProvider: "Por que este provedor",
    noProvidersTitle: "Sem rotas para este ativo",
    noProvidersBody: "Mude o ativo para comparar outra rota de acesso.",
    unavailableTitle: "Dados de mercado indisponíveis",
    unavailableBody: "A Payn só mostra o gráfico quando tem um dataset real para o ativo e o período selecionados.",
    providerCta: "Ver provedor",
  },
};

function formatPrice(value: number, locale: MarketplaceLocale, currency: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: value > 10 ? 2 : 4,
    }).format(value);
  } catch {
    // Fallback for unrecognised currency codes (e.g. custom symbols)
    return `${currency} ${new Intl.NumberFormat(locale, {
      maximumFractionDigits: value > 10 ? 2 : 4,
    }).format(value)}`;
  }
}

function formatAbsoluteChange(locale: MarketplaceLocale, value: number, currency: string) {
  const formatted = formatPrice(Math.abs(value), locale, currency);
  return `${value >= 0 ? "+" : "-"} ${formatted}`;
}

function formatChange(locale: MarketplaceLocale, value: number) {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));

  return `${value >= 0 ? "+" : "-"}${formatted}%`;
}

function getTimeframeFocus(timeframe: MarketIntelligenceTimeframe) {
  if (timeframe === "1D" || timeframe === "1W") {
    return {
      cost: 0.44,
      ease: 0.16,
      recurring: 0.08,
      pro: 0.18,
      access: 0.14,
      label: "short-term market access",
    };
  }

  if (timeframe === "1M") {
    return {
      cost: 0.38,
      ease: 0.2,
      recurring: 0.18,
      pro: 0.1,
      access: 0.14,
      label: "medium-term allocation",
    };
  }

  return {
    cost: 0.3,
    ease: 0.24,
    recurring: 0.24,
    pro: 0.08,
    access: 0.14,
    label: "long-term allocation",
  };
}

function getLocalizedTimeframeFocus(locale: MarketplaceLocale, timeframe: MarketIntelligenceTimeframe) {
  const focus = getTimeframeFocus(timeframe);

  if (locale === "de") {
    if (timeframe === "1D" || timeframe === "1W") {
      return { ...focus, label: "kurzfristigen Marktzugang" };
    }

    if (timeframe === "1M") {
      return { ...focus, label: "mittelfristige Allokation" };
    }

    return { ...focus, label: "langfristige Allokation" };
  }

  return focus;
}

function getEaseScore(match: InvestmentAccessMatch) {
  const ux = match.offer.attributes?.platformUxLevel?.toLowerCase() ?? "";

  if (ux.includes("beginner")) return 96;
  if (ux.includes("simple")) return 88;
  if (ux.includes("intermediate")) return 68;
  if (ux.includes("pro")) return 48;
  return 60;
}

function getProToolsScore(match: InvestmentAccessMatch) {
  const ux = match.offer.attributes?.platformUxLevel?.toLowerCase() ?? "";

  if (ux.includes("pro")) return 96;
  if (ux.includes("intermediate")) return 76;
  if (ux.includes("beginner")) return 36;
  return 52;
}

function getAccessFitScore(match: InvestmentAccessMatch, assetId: MarketIntelligenceAssetId) {
  const access = match.accessType.toLowerCase();

  if ((assetId === "btc" || assetId === "eth") && access.includes("spot crypto")) return 100;
  if ((assetId === "spy" || assetId === "qqq" || assetId === "eustocks") && access.includes("etf")) return 100;
  if (assetId === "gold" && access.includes("commodity")) return 100;
  if (assetId === "eurusd" && access.includes("fx")) return 100;
  if (access.includes("multi-asset")) return 74;
  return 58;
}

// TASK-317 — Was a 3-branch template that only varied on
// timeframe + recurring-flag + bestFor, so two providers with the same
// flag set produced the same sentence ("For short-term market access,
// this route keeps access tighter while staying relevant for BTC.").
// The audit flagged it as a leaked template; the chartOnly flag on
// /explore/investing already hid the whole provider list, but the
// dashboard + legacy marketplace-explorer surfaces still render it.
//
// New logic prefers per-offer copy:
//   1. `match.notes` — hand-written per-offer line in the access-
//      profile data (already specific, e.g. "A cleaner fit if you want
//      scheduled crypto accumulation in EUR rather than active
//      execution"). Used as-is when present.
//   2. Combined `bestFor` + `feeModel` — both are per-offer fields, so
//      "Best for In-app crypto access — Plan-based spread pricing" is
//      distinct per row. Fee model gets sentence-cased so the line
//      reads naturally.
//   3. Final fallback: a single localised sentence that at least names
//      the offer's bestFor — no timeframe filler.
//
// Parameters timeframe + assetId are still accepted for backwards
// compatibility with the call site, but no longer drive the copy —
// timeframe context was confusing in the "why this provider" subtitle
// (users read it as "this provider only works at this timeframe").
function getDynamicProviderWhy(
  locale: MarketplaceLocale,
  match: InvestmentAccessMatch,
  _timeframe: MarketIntelligenceTimeframe,
  _assetId: MarketIntelligenceAssetId,
) {
  const trimmed = match.notes.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }

  const best = match.bestFor.trim();
  const fee = match.feeModel.trim();
  if (best && fee) {
    if (locale === "de") return `Stärke: ${best}. ${fee}.`;
    return `Best for ${best.toLowerCase()} — ${fee.toLowerCase()}.`;
  }
  if (best) {
    if (locale === "de") return `Stärke: ${best}.`;
    return `Best for ${best.toLowerCase()}.`;
  }

  if (locale === "de") return "Eine weitere Zugangsroute für dieses Asset.";
  return "Another access route for this asset.";
}

function getSignalByIndex(payload: MarketIntelligencePayload | null, index: number) {
  return payload?.signals[index] ?? null;
}

function buildProviderRows(
  locale: MarketplaceLocale,
  matches: InvestmentAccessMatch[],
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
) {
  const weights = getLocalizedTimeframeFocus(locale, timeframe);

  const ranked = matches
    .map((match) => {
      const costScore = Math.max(0, 100 - match.estimatedCostScore * 45);
      const recurringScore = match.recurringSupported ? 100 : 28;
      const easeScore = getEaseScore(match);
      const proToolsScore = getProToolsScore(match);
      const accessFitScore = getAccessFitScore(match, assetId);

      const score =
        costScore * weights.cost +
        easeScore * weights.ease +
        recurringScore * weights.recurring +
        proToolsScore * weights.pro +
        accessFitScore * weights.access;

      return {
        match,
        score,
        why: getDynamicProviderWhy(locale, match, timeframe, assetId),
        tags: [] as ProviderTag[],
      } satisfies RankedProviderRow;
    })
    .sort((left, right) => right.score - left.score);

  const cheapest = [...ranked].sort(
    (left, right) => left.match.estimatedCostScore - right.match.estimatedCostScore,
  )[0]?.match.offer.id;
  const easiest = [...ranked].sort(
    (left, right) => getEaseScore(right.match) - getEaseScore(left.match),
  )[0]?.match.offer.id;
  const proTools = [...ranked].sort(
    (left, right) => getProToolsScore(right.match) - getProToolsScore(left.match),
  )[0]?.match.offer.id;
  const recurring = [...ranked].find((item) => item.match.recurringSupported)?.match.offer.id;

  return ranked.map((row, index) => {
    const tags: ProviderTag[] = [];

    if (row.match.offer.id === cheapest) tags.push({ label: locale === "de" ? "Niedrigste Gebühren" : "Lowest fees", tone: "success" });
    if (row.match.offer.id === easiest) tags.push({ label: locale === "de" ? "Am einfachsten" : "Easiest", tone: "blue" });
    if (row.match.offer.id === proTools) tags.push({ label: locale === "de" ? "Profi-Tools" : "Pro tools", tone: "purple" });
    if (row.match.offer.id === recurring) tags.push({ label: locale === "de" ? "Sparplan" : "Savings plan", tone: "orange" });
    if (index === 0) tags.push({ label: locale === "de" ? "Beste Wahl" : "Best match", tone: "accent" });

    return {
      ...row,
      tags: tags.slice(0, 3),
    };
  });
}

function InvestmentProviderRow({
  row,
  blockCopy,
}: {
  row: RankedProviderRow;
  blockCopy: InvestmentUiCopy;
}) {
  const minimumDeposit =
    row.match.offer.attributes?.minDeposit ??
    row.match.minimumOrder ??
    (blockCopy.providerCta === "Anbieter ansehen" ? "Abhängig von der Route" : "Route dependent");
  const availableAssets =
    row.match.offer.attributes?.assetsAvailableLabel ??
    (blockCopy.providerCta === "Anbieter ansehen" ? "Multi-Asset-Zugang" : "Multi-asset access");

  return (
    <article className="grid gap-4 rounded-[24px] border border-[#ECEDEF] bg-[#FCFCFD] px-4 py-5 shadow-[0_1px_0_rgba(17,24,39,0.02)] sm:px-5 xl:min-h-[188px] xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.95fr)_168px] xl:items-start xl:gap-6">
      <div className="grid min-w-0 gap-4">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
          <ProviderLogo providerName={row.match.offer.providerName} size="md" muted={false} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{row.match.offer.providerName}</p>
            <p className="mt-1 line-clamp-2 text-base font-bold tracking-[-0.02em] text-ink">
              {row.match.offer.title}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
              <span className="font-semibold text-ink">{blockCopy.whyProvider}:</span> {row.why}
            </p>
          </div>
        </div>

        <div className="flex min-h-[32px] flex-wrap items-start gap-2">
          {row.tags.map((tag) => (
            <Tag key={`${row.match.offer.id}-${tag.label}`} tone={tag.tone} className="shrink-0">
              {tag.label}
            </Tag>
          ))}
        </div>
      </div>

      <dl className="grid content-start gap-x-6 gap-y-3 border-[#ECEDEF] xl:min-h-[148px] xl:border-l xl:pl-6 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {blockCopy.accessType}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{row.match.accessType}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {blockCopy.fees}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{row.match.estimatedCostLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {blockCopy.minDeposit}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{minimumDeposit}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {blockCopy.assets}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{availableAssets}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            {blockCopy.bestFor}
          </dt>
          <dd className="mt-1 line-clamp-2 text-sm text-ink-secondary">{row.match.bestFor}</dd>
        </div>
      </dl>

      <div className="flex xl:min-h-[148px] xl:items-start xl:justify-end">
        <div className="w-full xl:flex xl:justify-end">
          <ProviderLinkButton
            offer={row.match.offer}
            label={blockCopy.providerCta}
            fullWidth
            className="xl:w-auto"
          />
        </div>
      </div>
    </article>
  );
}

const countryCurrencyMap: Record<string, string> = {
  GB: "GBP",
  CH: "CHF",
  US: "USD",
};

function getCountryCurrency(country: string): string {
  return countryCurrencyMap[country.toUpperCase()] ?? "EUR";
}

export function InvestmentIntelligenceBlock({
  locale,
  assetId,
  onAssetChange,
  providerMatches,
  marketLabel,
  offers,
  chartOnly = false,
}: {
  locale: MarketplaceLocale;
  assetId?: MarketIntelligenceAssetId;
  onAssetChange?: (assetId: MarketIntelligenceAssetId) => void;
  providerMatches?: InvestmentAccessMatch[];
  marketLabel?: string;
  offers?: MarketplaceOffer[];
  /** When true, render only the chart + market-pulse section. Hides the
   *  "Compare access routes for <asset>" provider list below. Used on
   *  `/explore/investing` where the BucketWorkspace already renders the
   *  full offer list right under the chart — the duplicate provider
   *  table just pushed the real offers off-screen. */
  chartOnly?: boolean;
}) {
  const preferences = useMarketplacePreferences();
  const userCurrency = getCountryCurrency(preferences.country);

  const [internalAssetId, setInternalAssetId] = useState<MarketIntelligenceAssetId>(
    normalizeMarketIntelligenceAsset(assetId),
  );
  const [timeframe, setTimeframe] = useState<MarketIntelligenceTimeframe>("1W");
  const [payload, setPayload] = useState<MarketIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [fxRate, setFxRate] = useState<number | null>(null);

  const copy = getMarketIntelligenceCopy(locale);
  const blockCopy = investmentUiCopy[locale];
  const resolvedAssetId = assetId ?? internalAssetId;
  const investmentOffers = offers ?? marketplaceOffers.filter((offer) => offer.category === "investments");
  const resolvedProviderMatches = useMemo(
    () => providerMatches ?? getInvestmentAccessMatches(investmentOffers, resolvedAssetId),
    [investmentOffers, providerMatches, resolvedAssetId],
  );
  const providerRows = useMemo(
    () => buildProviderRows(locale, resolvedProviderMatches, resolvedAssetId, timeframe),
    [locale, resolvedAssetId, resolvedProviderMatches, timeframe],
  );

  const topRecurringProvider =
    providerRows.find((row) => row.match.recurringSupported)?.match.offer.providerName ??
    blockCopy.recurringUnavailable;
  const momentumSignal = getSignalByIndex(payload, 0);
  const volatilitySignal = getSignalByIndex(payload, 1);
  const trendSignal = getSignalByIndex(payload, 2);
  const summarySignal = getSignalByIndex(payload, 3);
  const periodStartPrice = payload?.points[0]?.value ?? payload?.latestPrice ?? 0;
  const absoluteChange = payload ? payload.latestPrice - periodStartPrice : 0;
  const pulseDirection = payload?.direction === "up" ? "↑" : payload?.direction === "down" ? "↓" : "→";

  // Derived display values with optional FX conversion
  const isEurUsd = resolvedAssetId === "eurusd";
  const displayCurrency = fxRate ? userCurrency : (payload?.currency ?? "USD");
  const displayPrice = fxRate && payload ? payload.latestPrice * fxRate : payload?.latestPrice ?? 0;
  const displayChange = fxRate ? absoluteChange * fxRate : absoluteChange;
  const showNativeSecondary = Boolean(fxRate && payload && payload.currency !== userCurrency);
  const summaryCards = [
    { label: blockCopy.availableVia, value: locale === "de" ? `${providerRows.length} Anbieter` : `${providerRows.length} providers` },
    { label: blockCopy.lowestCost, value: providerRows[0]?.match.estimatedCostLabel ?? "—" },
    { label: blockCopy.bestRecurring, value: topRecurringProvider },
    { label: blockCopy.summary, value: getLocalizedTimeframeFocus(locale, timeframe).label },
  ];

  useEffect(() => {
    if (assetId) {
      setInternalAssetId(normalizeMarketIntelligenceAsset(assetId));
    }
  }, [assetId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          asset: resolvedAssetId,
          timeframe,
          locale,
        });

        const response = await fetch(`/api/v1/market-intelligence?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const nextPayload = (await response.json()) as MarketIntelligencePayload;

        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch {
        if (!cancelled) {
          setPayload(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [locale, resolvedAssetId, timeframe]);

  // Fetch FX rate to convert USD prices to user's currency. One-retry-with-backoff
  // because a single transient network blip would otherwise pin the price to the
  // asset's native currency for the whole session (silent catch → no recovery).
  useEffect(() => {
    if (resolvedAssetId === "eurusd") {
      setFxRate(null);
      return;
    }
    const assetCurrency = payload?.currency ?? "USD";
    if (!payload || assetCurrency === userCurrency) {
      setFxRate(null);
      return;
    }

    let cancelled = false;
    const load = async (attempt = 0): Promise<void> => {
      try {
        const params = new URLSearchParams({ from: assetCurrency, to: userCurrency });
        const response = await fetch(`/api/v1/fx-quote?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`fx-quote ${response.status}`);
        const data = (await response.json()) as { rate: number; unavailable?: boolean };
        if (cancelled) return;
        if (data.unavailable || typeof data.rate !== "number") {
          throw new Error("fx-quote unavailable");
        }
        setFxRate(data.rate);
      } catch (err) {
        if (cancelled) return;
        if (attempt < 1) {
          await new Promise((r) => setTimeout(r, 800));
          if (!cancelled) await load(attempt + 1);
          return;
        }
        console.warn("[InvestmentIntelligenceBlock] FX rate fetch failed, falling back to native currency", err);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [payload, userCurrency, resolvedAssetId]);

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[28px] border border-[#EAEAEA] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#ECEDEF] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                {blockCopy.chartTitle}
              </p>
              <h2 className="mt-3 text-[30px] font-bold tracking-[-0.05em] text-ink sm:text-[36px]">
                {marketIntelligenceAssets[resolvedAssetId].label}
                <span className="ml-2 align-middle text-[14px] font-medium uppercase tracking-[0.2em] text-ink-tertiary sm:text-[16px]">
                  · live market
                </span>
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
                {blockCopy.chartSubtitle}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {marketIntelligenceAssetOptions.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setInternalAssetId(asset.id);
                      onAssetChange?.(asset.id);
                    }}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      resolvedAssetId === asset.id
                        ? "border-accent-emerald bg-accent-emerald text-white"
                        : "border-[#E7E7E9] bg-[#F7F7F8] text-ink-secondary hover:border-accent-emerald/20 hover:text-ink",
                    )}
                  >
                    {asset.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                {marketIntelligenceTimeframeOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeframe(item.id)}
                    className={clsx(
                      "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                      timeframe === item.id
                        ? "bg-accent-emerald text-white"
                        : "bg-[#F5F5F7] text-ink-secondary hover:text-ink",
                    )}
                  >
                    {item.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="border-b border-[#ECEDEF] px-5 py-5 xl:border-b-0 xl:border-r xl:px-6 xl:py-6">
            {loading && !payload ? (
              <div className="grid h-[360px] place-items-center rounded-[24px] bg-[#F7F7F8] text-sm text-ink-secondary">
                {copy.loading}
              </div>
            ) : payload && !payload.unavailable && payload.points.length > 1 ? (
              <>
                <LightweightMarketChart points={payload.points} direction={payload.direction} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-[#F8F8F9] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone={payload.stale ? "muted" : "success"}>{payload.statusLabel}</Tag>
                    <span className="text-ink-secondary">{payload.sourceLabel}</span>
                    <span className="text-ink-tertiary">· {timeframe}</span>
                  </div>
                  <span className="text-xs text-ink-tertiary">
                    {new Intl.DateTimeFormat(locale, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(payload.updatedAt))}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-tertiary">
                  <span>{payload.attributionNotice}</span>
                  <a
                    href={payload.attributionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink"
                  >
                    {payload.attributionLabel}
                  </a>
                </div>
              </>
            ) : payload ? (
              <div className="grid h-[360px] place-items-center rounded-[24px] bg-[#F7F7F8] px-6 text-center">
                <div>
                  <p className="text-base font-semibold text-ink">{blockCopy.unavailableTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {blockCopy.unavailableBody}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid h-[360px] place-items-center rounded-[24px] bg-[#F7F7F8] text-sm text-ink-secondary">
                {copy.retrying}
              </div>
            )}
          </div>

          {payload && !payload.unavailable ? (
            <aside className="grid gap-3 px-5 py-5 sm:grid-cols-2 xl:grid-cols-1 xl:px-6 xl:py-6">
              <div className="rounded-[22px] border border-[#ECECEC] bg-[#F8F8F9] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  {blockCopy.pulse}
                </p>
                {isEurUsd ? (
                  /* EUR/USD is itself a rate — show as "1 EUR = X.XXXX USD" */
                  <div className="mt-2">
                    <p className="text-[22px] font-bold tracking-[-0.04em] text-ink">
                      1 EUR = {payload.latestPrice.toFixed(4)} USD
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-[28px] font-bold tracking-[-0.05em] text-ink">
                      {payload.latestPrice
                        ? formatPrice(displayPrice, locale, displayCurrency)
                        : copy.unavailable}
                    </p>
                    <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary">
                      {displayCurrency}
                    </span>
                  </div>
                )}
                {showNativeSecondary && !isEurUsd ? (
                  <p className="mt-0.5 text-[12px] text-ink-tertiary">
                    {formatPrice(payload.latestPrice, locale, payload.currency)} {payload.currency}
                  </p>
                ) : null}
                <p
                  key={`${resolvedAssetId}:${timeframe}:${payload.updatedAt}`}
                  className={clsx(
                    "mt-2 flex items-center gap-2 text-sm font-semibold transition-all duration-300",
                    payload.direction === "up"
                      ? "text-emerald-600"
                      : payload.direction === "down"
                        ? "text-red-600"
                        : "text-ink-secondary",
                  )}
                >
                  {!isEurUsd ? (
                    <>
                      <span className="text-base">{pulseDirection}</span>
                      <span>{formatAbsoluteChange(locale, displayChange, displayCurrency)}</span>
                      <span>({formatChange(locale, payload.changePct)})</span>
                    </>
                  ) : (
                    <span>({formatChange(locale, payload.changePct)})</span>
                  )}
                </p>
                <p className="mt-2 text-xs text-ink-tertiary">
                  {locale === "de"
                    ? `${timeframe} Veränderung seit Beginn des gewählten Zeitraums`
                    : `${timeframe} change from the start of the selected period`}
                </p>
              </div>

              {momentumSignal ? (
                <div className="rounded-[22px] border border-[#ECECEC] bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {blockCopy.trend}
                  </p>
                  <p className="mt-2 text-base font-semibold text-ink">{momentumSignal.value}</p>
                </div>
              ) : null}

              {volatilitySignal ? (
                <div className="rounded-[22px] border border-[#ECECEC] bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {blockCopy.volatility}
                  </p>
                  <p className="mt-2 text-base font-semibold text-ink">{volatilitySignal.value}</p>
                </div>
              ) : null}

              {(trendSignal || summarySignal) ? (
                <div className="rounded-[22px] border border-[#ECECEC] bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {blockCopy.summary}
                  </p>
                  {trendSignal ? (
                    <p className="mt-2 text-sm font-semibold text-ink">{trendSignal.value}</p>
                  ) : null}
                  {summarySignal ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{summarySignal.value}</p>
                  ) : null}
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      </section>

      {!chartOnly && providerRows.length > 0 ? (
        <section className="rounded-[28px] border border-[#EAEAEA] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {blockCopy.providersTitle}
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">
                {locale === "de"
                  ? `Zugangswege für ${marketIntelligenceAssets[resolvedAssetId].label} vergleichen`
                  : `Compare access routes for ${marketIntelligenceAssets[resolvedAssetId].label}`}
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
                {blockCopy.providersBody}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((item) => (
                <div key={item.label} className="rounded-[20px] bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {providerRows.map((row) => (
              <InvestmentProviderRow
                key={`${row.match.offer.id}-${row.match.assetId}`}
                row={row}
                blockCopy={blockCopy}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
