"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { OfferCardAtlas } from "@/features/explore/offer-card-atlas";
import { DashboardEmptyState } from "@/components/dashboard-primitives";
import {
  ProductCompareTable,
  type ProductCompareEntry,
} from "@/components/product-compare-table";
import { Tag } from "@/components/tag";
import { getMetricLabel, translateUiToken } from "@/lib/i18n";
import {
  getMetricValue,
  normalizeDisplayText,
  parseMetricRange,
} from "@/lib/marketplace";
import {
  readPersistedProductWorkspaceState,
  writePersistedProductWorkspaceState,
} from "@/lib/product-workspace-state";

type DecisionResultMetric = { label: string; value: string };
type DecisionResultTag = { label: string; tone?: "neutral" | "accent" | "muted" | "success" | "blue" | "purple" | "orange" };

type CardTypeFilter = "all" | "credit" | "debit";

type RankedCardResult = {
  offer: MarketplaceOffer;
  score: number;
  relevance: number;
  estimatedYearlyCost: number;
  primaryValue: string;
  summary: string;
  why: string;
  metrics: DecisionResultMetric[];
  tags: DecisionResultTag[];
  cashback: number;
  fxFee: number;
  annualFee: number;
  atmLimit: number;
};

type CardWorkspaceDraft = {
  search: string;
  cardType: CardTypeFilter;
  travelMode: boolean;
  cryptoMode: boolean;
  cashbackFloor: string;
  maxAnnualFee: string;
  maxFxFee: string;
  minAtmLimit: string;
  monthlySpend: string;
  compareSelection: string[];
};

function parsePercent(value?: string | null, direction: "min" | "max" = "max") {
  if (!value) {
    return Number.NaN;
  }

  const range = parseMetricRange(value);
  if (direction === "min") {
    return range.min ?? Number.NaN;
  }

  return range.max ?? range.min ?? Number.NaN;
}

function parseCurrencyAmount(value?: string | null) {
  if (!value) {
    return Number.NaN;
  }

  const range = parseMetricRange(value);
  return range.max ?? range.min ?? Number.NaN;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatCurrency(locale: MarketplaceLocale, value: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}

function cardText(offer: MarketplaceOffer) {
  return `${offer.providerName} ${offer.title} ${offer.subtitle} ${offer.bestFor.join(" ")} ${offer.metrics
    .map((metric) => `${metric.label} ${metric.value}`)
    .join(" ")} ${offer.attributes?.searchTags?.join(" ") ?? ""}`.toLowerCase();
}

function getAnnualFee(offer: MarketplaceOffer) {
  const explicit = offer.attributes?.annualFeeAmount;
  if (typeof explicit === "number") {
    return explicit;
  }

  return parseCurrencyAmount(getMetricValue(offer, ["Annual fee", "Monthly fee"])) || 0;
}

function getFxFee(offer: MarketplaceOffer) {
  const explicit = offer.attributes?.fxFeePercent;
  if (typeof explicit === "number") {
    return explicit;
  }

  return parsePercent(getMetricValue(offer, ["FX Fee", "FX fee"]), "min") || 0;
}

function getCashback(offer: MarketplaceOffer) {
  const explicit = offer.attributes?.cashbackPercent;
  if (typeof explicit === "number") {
    return explicit;
  }

  return parsePercent(getMetricValue(offer, ["Cashback"]), "max") || 0;
}

function getAtmLimit(offer: MarketplaceOffer) {
  const explicit = offer.attributes?.atmFreeLimit;
  if (typeof explicit === "number") {
    return explicit;
  }

  const metric = getMetricValue(offer, ["ATM", "ATM limit", "ATM withdrawals"]);
  const text = `${metric ?? ""} ${offer.subtitle}`.toLowerCase();

  if (text.includes("free worldwide")) {
    return 1000;
  }

  if (text.includes("up to limit")) {
    return 200;
  }

  return parseCurrencyAmount(metric) || 0;
}

function inferCardType(offer: MarketplaceOffer): Exclude<CardTypeFilter, "all"> {
  if (offer.attributes?.cardType) {
    return offer.attributes.cardType === "credit" ? "credit" : "debit";
  }

  const text = cardText(offer);
  if (text.includes("credit")) {
    return "credit";
  }

  return "debit";
}

function supportsCrypto(offer: MarketplaceOffer) {
  if (typeof offer.attributes?.cryptoSupport === "boolean") {
    return offer.attributes.cryptoSupport;
  }

  const text = cardText(offer);
  return (
    text.includes("crypto") ||
    offer.providerName === "Revolut" ||
    offer.providerName === "Curve"
  );
}

function InputField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{label}</span>
      {children}
    </label>
  );
}

function fieldClassName() {
  return "h-12 rounded-[18px] border border-line bg-bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald/15 focus:bg-white";
}

function tagForResult(args: {
  locale: MarketplaceLocale;
  row: RankedCardResult;
  cheapestOfferId: string | null;
  lowestFxOfferId: string | null;
  cashbackOfferId: string | null;
}) {
  const tags: DecisionResultTag[] = [];

  if (args.row.offer.id === args.cheapestOfferId) {
    tags.push({ label: args.locale === "de" ? "Günstigste Option" : "Cheapest", tone: "success" });
  }

  if (args.row.offer.id === args.lowestFxOfferId) {
    tags.push({ label: args.locale === "de" ? "Reisefreundlich" : "Travel-friendly", tone: "blue" });
  }

  if (args.row.offer.id === args.cashbackOfferId) {
    tags.push({ label: args.locale === "de" ? "Stärkstes Cashback" : "Best cashback", tone: "purple" });
  }

  if (supportsCrypto(args.row.offer)) {
    tags.push({ label: args.locale === "de" ? "Krypto-Support" : "Crypto support", tone: "orange" });
  }

  return tags.slice(0, 3);
}

export function DashboardCardsWorkspace({
  locale,
  userId,
  marketLabel,
  offers,
  discoverHref,
}: {
  locale: MarketplaceLocale;
  userId?: string | null;
  marketLabel: string;
  offers: MarketplaceOffer[];
  discoverHref: string;
}) {
  const copy =
    locale === "de"
      ? {
          categoryEyebrow: "Karten",
          title: `Karten für ${marketLabel.toLowerCase()} vergleichen`,
          description:
            "Filtere nach Gebühren, Reiseeinsatz, Cashback, Bargeldzugang und Krypto-Support und prüfe dann eine einzige sortierte Liste.",
          backToDiscover: "Zurück zur Suche",
          search: "Suche",
          searchPlaceholder: "Produkte oder Anbieter suchen",
          monthlySpend: "Monatlicher Umsatz",
          maxAnnualFee: "Max. Jahresgebühr",
          maxFxFee: "Max. FX-Gebühr",
          cardType: "Kartentyp",
          cashback: "Rückvergütung",
          freeAtmNeed: "Bargeldbedarf",
          useCase: "Einsatz",
          travel: "Reise",
          crypto: "Krypto",
          on: "An",
          off: "Aus",
          all: "Alle",
          any: "Beliebig",
          credit: "Kreditkarte",
          debit: "Debitkarte",
          summaryBest: "Beste Gesamtwahl",
          summaryTravel: "Beste Reiseoption",
          summaryCashback: "Bestes Cashback-Profil",
          estimatedYearlyCost: "Geschätzte Jahreskosten",
          rankedResults: "Sortierte Ergebnisse",
          cardsRanked: (count: number) => `${count} ${count === 1 ? "Karte" : "Karten"} sortiert`,
          rankedDescription:
            "Sortiert nach Relevanz, realem Gebühreneffekt, Einfachheit, Reiseeinsatz und Popularität.",
          noCardsTitle: "Noch keine Karten für diese Filter",
          noCardsDescription: "Erweitere Gebühren- oder Cashback-Filter und Payn baut das Ranking sofort neu auf.",
          compareCardsTitle: "Kartenanbieter vergleichen",
          compareCardsDescription:
            "Behalte die Shortlist direkt in den Karten und vergleiche Gebühren, Reiseeignung, Rewards und Bargeldzugang nebeneinander.",
          instantSetup: "Sofort startklar",
          checkProvider: "Beim Anbieter prüfen",
          none: "Keine",
          standard: "Standard",
          compare: "Vergleichen",
          added: "Hinzugefügt",
        }
      : {
          categoryEyebrow: "Cards",
          title: `Browse card routes for ${marketLabel.toLowerCase()}`,
          description:
            "Cards work better as a browse-and-analytics flow. Filter by fees, travel fit, cashback, ATM access, and crypto support, then review one ranked list instead of duplicated card blocks.",
          backToDiscover: "Back to Discover",
          search: "Search",
          searchPlaceholder: "Search products or providers",
          monthlySpend: "Monthly spend",
          maxAnnualFee: "Max annual fee",
          maxFxFee: "Max FX fee",
          cardType: "Card type",
          cashback: "Cashback",
          freeAtmNeed: "Free ATM need",
          useCase: "Use case",
          travel: "Travel",
          crypto: "Crypto",
          on: "On",
          off: "Off",
          all: "All",
          any: "Any",
          credit: "Credit",
          debit: "Debit",
          summaryBest: "Best overall",
          summaryTravel: "Best travel fit",
          summaryCashback: "Best cashback angle",
          estimatedYearlyCost: "Estimated yearly cost",
          rankedResults: "Ranked results",
          cardsRanked: (count: number) => `${count} ${count === 1 ? "card" : "cards"} ranked`,
          rankedDescription:
            "Sorted by relevance, real fee outcome, simplicity, travel fit, and popularity. Cards stay in one ranked list, with no duplicated sections and no card grid.",
          noCardsTitle: "No cards match these filters yet",
          noCardsDescription: "Widen the fee or cashback filters and Payn will rebuild the ranking immediately.",
          compareCardsTitle: "Compare card providers",
          compareCardsDescription:
            "Keep the shortlist inside cards while fees, travel fit, rewards, and ATM access stay side by side.",
          instantSetup: "Instant setup",
          checkProvider: "Check provider",
          none: "None",
          standard: "Standard",
          compare: "Compare",
          added: "Added",
        };

  const workspaceStateKey = "product-cards";
  const defaultWorkspaceState: CardWorkspaceDraft = {
    search: "",
    cardType: "all",
    travelMode: true,
    cryptoMode: false,
    cashbackFloor: "0",
    maxAnnualFee: "250",
    maxFxFee: "2",
    minAtmLimit: "0",
    monthlySpend: "1800",
    compareSelection: [],
  };
  const [workspaceStateLoaded, setWorkspaceStateLoaded] = useState(false);
  const [search, setSearch] = useState(defaultWorkspaceState.search);
  const [cardType, setCardType] = useState<CardTypeFilter>(defaultWorkspaceState.cardType);
  const [travelMode, setTravelMode] = useState(defaultWorkspaceState.travelMode);
  const [cryptoMode, setCryptoMode] = useState(defaultWorkspaceState.cryptoMode);
  const [cashbackFloor, setCashbackFloor] = useState(defaultWorkspaceState.cashbackFloor);
  const [maxAnnualFee, setMaxAnnualFee] = useState(defaultWorkspaceState.maxAnnualFee);
  const [maxFxFee, setMaxFxFee] = useState(defaultWorkspaceState.maxFxFee);
  const [minAtmLimit, setMinAtmLimit] = useState(defaultWorkspaceState.minAtmLimit);
  const [monthlySpend, setMonthlySpend] = useState(defaultWorkspaceState.monthlySpend);
  const [compareSelection, setCompareSelection] = useState<string[]>(defaultWorkspaceState.compareSelection);

  useEffect(() => {
    const persistedState = readPersistedProductWorkspaceState(
      workspaceStateKey,
      defaultWorkspaceState,
      userId,
    );

    setSearch(persistedState.search);
    setCardType(persistedState.cardType);
    setTravelMode(persistedState.travelMode);
    setCryptoMode(persistedState.cryptoMode);
    setCashbackFloor(persistedState.cashbackFloor);
    setMaxAnnualFee(persistedState.maxAnnualFee);
    setMaxFxFee(persistedState.maxFxFee);
    setMinAtmLimit(persistedState.minAtmLimit);
    setMonthlySpend(persistedState.monthlySpend);
    setCompareSelection(persistedState.compareSelection);
    setWorkspaceStateLoaded(true);
  }, [userId]);

  useEffect(() => {
    if (!workspaceStateLoaded) {
      return;
    }

    writePersistedProductWorkspaceState(
      workspaceStateKey,
      {
        search,
        cardType,
        travelMode,
        cryptoMode,
        cashbackFloor,
        maxAnnualFee,
        maxFxFee,
        minAtmLimit,
        monthlySpend,
        compareSelection,
      },
      userId,
    );
  }, [
    cardType,
    cashbackFloor,
    compareSelection,
    cryptoMode,
    maxAnnualFee,
    maxFxFee,
    minAtmLimit,
    monthlySpend,
    search,
    travelMode,
    userId,
    workspaceStateLoaded,
  ]);

  const searchValue = search.trim().toLowerCase();
  const cashbackFloorValue = Number.parseFloat(cashbackFloor) || 0;
  const maxAnnualFeeValue = Number.parseFloat(maxAnnualFee) || Number.POSITIVE_INFINITY;
  const maxFxFeeValue = Number.parseFloat(maxFxFee) || Number.POSITIVE_INFINITY;
  const minAtmLimitValue = Number.parseFloat(minAtmLimit) || 0;
  const monthlySpendValue = Number.parseFloat(monthlySpend) || 0;

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (searchValue && !cardText(offer).includes(searchValue)) {
        return false;
      }

      if (cardType !== "all" && inferCardType(offer) !== cardType) {
        return false;
      }

      if (getAnnualFee(offer) > maxAnnualFeeValue) {
        return false;
      }

      if (getFxFee(offer) > maxFxFeeValue) {
        return false;
      }

      if (getCashback(offer) < cashbackFloorValue) {
        return false;
      }

      if (getAtmLimit(offer) < minAtmLimitValue) {
        return false;
      }

      if (cryptoMode && !supportsCrypto(offer)) {
        return false;
      }

      return true;
    });
  }, [
    cashbackFloorValue,
    cardType,
    cryptoMode,
    maxAnnualFeeValue,
    maxFxFeeValue,
    minAtmLimitValue,
    offers,
    searchValue,
  ]);

  const rankedResults = useMemo(() => {
    const rows = filteredOffers.map((offer) => {
      const annualFee = getAnnualFee(offer);
      const fxFee = getFxFee(offer);
      const cashback = getCashback(offer);
      const atmLimit = getAtmLimit(offer);
      const yearlySpend = monthlySpendValue * 12;
      const foreignShare = travelMode ? 0.42 : 0.08;
      const foreignSpend = yearlySpend * foreignShare;
      const cashbackBenefit = yearlySpend * (cashback / 100) * 0.35;
      const estimatedYearlyCost = Math.max(
        0,
        annualFee + foreignSpend * (fxFee / 100) - cashbackBenefit,
      );
      const text = cardText(offer);
      const popularity = offer.affiliatePriorityScore * 100;
      const relevance = clampPercent(
        54 +
          (travelMode && (fxFee <= 0.2 || text.includes("travel")) ? 18 : 0) +
          (cryptoMode && supportsCrypto(offer) ? 10 : 0) +
          (cashback >= cashbackFloorValue ? 8 : 0) +
          (cardType !== "all" && inferCardType(offer) === cardType ? 6 : 0),
      );
      const outcome = clampPercent(100 - Math.min(estimatedYearlyCost / 4, 100));
      const diversityBoost = clampPercent(
        84 +
          ((offer.providerName.charCodeAt(0) + offer.id.length) % 8) -
          Math.max(0, filteredOffers.filter((item) => item.providerName === offer.providerName).length - 1) * 18,
      );
      const score =
        relevance * 0.5 +
        outcome * 0.2 +
        popularity * 0.2 +
        diversityBoost * 0.1;

      const primaryValue = formatCurrency(locale, estimatedYearlyCost);
      const why =
        travelMode && fxFee <= 0.2
          ? locale === "de"
            ? "Niedrigere FX-Kosten halten die Karte für Ausgaben in mehreren Währungen attraktiv."
            : "Lower FX drag keeps the card competitive for spending across currencies."
          : cashback > 0
            ? locale === "de"
              ? "Cashback und Gebührenprofil machen diese Route für den Alltag besonders stark."
              : "Cashback and fee tradeoffs make it one of the stronger everyday-value routes."
            : locale === "de"
              ? "Die Gebührenstruktur bleibt einfacher und hält das Kostenprofil wettbewerbsfähig."
              : "It stays simpler on fee structure while keeping the overall cost profile competitive.";

      return {
        offer,
        score,
        relevance,
        estimatedYearlyCost,
        primaryValue,
        summary: normalizeDisplayText(offer.subtitle),
        why,
        metrics: [
          {
            label: normalizeDisplayText(getMetricLabel(locale, "Annual fee")),
            value: normalizeDisplayText(getMetricValue(offer, ["Annual fee", "Monthly fee"]) ?? "EUR 0"),
          },
          {
            label: normalizeDisplayText(getMetricLabel(locale, "FX fee")),
            value: normalizeDisplayText(getMetricValue(offer, ["FX Fee", "FX fee"]) ?? "0%"),
          },
          {
            label: getMetricLabel(locale, "Cashback"),
            value: cashback > 0 ? `${cashback.toFixed(cashback >= 1 ? 0 : 2)}%` : copy.none,
          },
          {
            label: getMetricLabel(locale, "ATM"),
            value: normalizeDisplayText(getMetricValue(offer, ["ATM", "ATM limit", "ATM withdrawals"]) ?? copy.standard),
          },
        ],
        tags: [],
        cashback,
        fxFee,
        annualFee,
        atmLimit,
      } satisfies RankedCardResult;
    });

    const cheapestOfferId =
      [...rows].sort((left, right) => left.estimatedYearlyCost - right.estimatedYearlyCost)[0]?.offer.id ?? null;
    const lowestFxOfferId =
      [...rows].sort((left, right) => left.fxFee - right.fxFee)[0]?.offer.id ?? null;
    const cashbackOfferId =
      [...rows].sort((left, right) => right.cashback - left.cashback)[0]?.offer.id ?? null;

    const uniqueRows = rows
      .sort((left, right) => right.score - left.score)
      .filter((row, index, source) => source.findIndex((item) => item.offer.providerName === row.offer.providerName) === index);

    return uniqueRows.map((row) => ({
        ...row,
        tags: tagForResult({
          locale,
          row,
          cheapestOfferId,
          lowestFxOfferId,
          cashbackOfferId,
        }),
      }));
  }, [
    cashbackFloorValue,
    cardType,
    filteredOffers,
    locale,
    monthlySpendValue,
    travelMode,
    cryptoMode,
  ]);

  useEffect(() => {
    setCompareSelection((current) =>
      current.filter((offerId) => rankedResults.some((row) => row.offer.id === offerId)),
    );
  }, [rankedResults]);

  const topResults = rankedResults.slice(0, 3);
  const selectedCompareRows = rankedResults
    .filter((row) => compareSelection.includes(row.offer.id))
    .slice(0, 3);
  const compareEntries = useMemo<ProductCompareEntry[]>(
    () =>
      selectedCompareRows.map((row) => ({
        offer: row.offer,
        primaryMetricValue: row.primaryValue,
        fees: formatCurrency(locale, row.annualFee),
        speed:
          cardText(row.offer).includes("instant") || cardText(row.offer).includes("virtual")
            ? copy.instantSetup
            : copy.checkProvider,
        rateOrApr:
          row.cashback > 0
            ? `${row.fxFee.toFixed(row.fxFee >= 1 ? 0 : 1)}% FX / ${row.cashback.toFixed(row.cashback >= 1 ? 0 : 2)}% cashback`
            : `${row.fxFee.toFixed(row.fxFee >= 1 ? 0 : 1)}% FX fee`,
        keyBenefits: row.tags.map((tag) => tag.label).join(" · ") || row.offer.bestFor.slice(0, 2).join(" · "),
        bestFor: row.offer.bestFor.slice(0, 3).join(" · "),
      })),
    [locale, selectedCompareRows],
  );

  return (
    <div className="mx-auto grid max-w-[980px] gap-6">
      <section className="rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">{copy.categoryEyebrow}</p>
            <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
              {copy.description}
            </p>
          </div>
          <Link href={discoverHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
            {copy.backToDiscover}
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField label={copy.search}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={fieldClassName()}
              placeholder={copy.searchPlaceholder}
            />
          </InputField>
          <InputField label={copy.monthlySpend}>
            <input
              value={monthlySpend}
              onChange={(event) => setMonthlySpend(event.target.value)}
              className={fieldClassName()}
              inputMode="decimal"
            />
          </InputField>
          <InputField label={copy.maxAnnualFee}>
            <select value={maxAnnualFee} onChange={(event) => setMaxAnnualFee(event.target.value)} className={fieldClassName()}>
              <option value="0">€0 only</option>
              <option value="60">Up to €60</option>
              <option value="150">Up to €150</option>
              <option value="250">Any fee</option>
            </select>
          </InputField>
          <InputField label={copy.maxFxFee}>
            <select value={maxFxFee} onChange={(event) => setMaxFxFee(event.target.value)} className={fieldClassName()}>
              <option value="0">0%</option>
              <option value="0.5">Up to 0.5%</option>
              <option value="1">Up to 1%</option>
              <option value="2">Any FX fee</option>
            </select>
          </InputField>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField label={copy.cardType}>
            <div className="flex flex-wrap gap-2">
              {(["all", "credit", "debit"] as CardTypeFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCardType(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    cardType === item ? "bg-accent-emerald text-white" : "bg-[#F1F2F4] text-ink-secondary hover:text-ink"
                  }`}
                >
                  {item === "all" ? copy.all : item === "credit" ? copy.credit : copy.debit}
                </button>
              ))}
            </div>
          </InputField>
          <InputField label={copy.cashback}>
            <select value={cashbackFloor} onChange={(event) => setCashbackFloor(event.target.value)} className={fieldClassName()}>
              <option value="0">{copy.any}</option>
              <option value="0.25">0.25%+</option>
              <option value="0.5">0.5%+</option>
              <option value="1">1%+</option>
            </select>
          </InputField>
          <InputField label={copy.freeAtmNeed}>
            <select value={minAtmLimit} onChange={(event) => setMinAtmLimit(event.target.value)} className={fieldClassName()}>
              <option value="0">{copy.any}</option>
              <option value="200">€200+</option>
              <option value="500">€500+</option>
              <option value="800">€800+</option>
            </select>
          </InputField>
          <InputField label={copy.useCase}>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTravelMode((current) => !current)}
                className={`${fieldClassName()} flex items-center justify-between`}
              >
                <span>{copy.travel}</span>
                <Tag tone={travelMode ? "blue" : "muted"}>{travelMode ? copy.on : copy.off}</Tag>
              </button>
              <button
                type="button"
                onClick={() => setCryptoMode((current) => !current)}
                className={`${fieldClassName()} flex items-center justify-between`}
              >
                <span>{copy.crypto}</span>
                <Tag tone={cryptoMode ? "purple" : "muted"}>{cryptoMode ? copy.on : copy.off}</Tag>
              </button>
            </div>
          </InputField>
        </div>
      </section>

      <section className="rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topResults.map((row, index) => (
            <div key={row.offer.id} className="rounded-[18px] border border-line bg-bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {index === 0 ? copy.summaryBest : index === 1 ? copy.summaryTravel : copy.summaryCashback}
              </p>
              <p className="mt-2 text-sm font-bold text-ink">
                {row.offer.providerName} · {row.offer.title}
              </p>
              <p className="mt-2 text-sm text-ink-secondary">{row.primaryValue} {copy.estimatedYearlyCost.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-secondary">
            {rankedResults.length === 1
              ? `1 card in ${marketLabel}`
              : `${rankedResults.length} cards in ${marketLabel}`}
          </p>
        </div>

        {rankedResults.length === 0 ? (
          <DashboardEmptyState
            title={copy.noCardsTitle}
            description={copy.noCardsDescription}
            href={discoverHref}
            cta={copy.backToDiscover}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rankedResults.map((row) => (
              <OfferCardAtlas key={row.offer.id} offer={row.offer} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {compareEntries.length >= 2 ? (
        <ProductCompareTable
          locale={locale}
          entries={compareEntries}
          primaryMetricLabel={copy.estimatedYearlyCost}
          title={copy.compareCardsTitle}
          description={copy.compareCardsDescription}
          onRemove={(offerId) =>
            setCompareSelection((current) => current.filter((id) => id !== offerId))
          }
        />
      ) : null}
    </div>
  );
}
