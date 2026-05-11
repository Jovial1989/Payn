"use client";

import type {
  MarketplaceCategory,
  MarketplaceInsuranceType,
  MarketplaceLocale,
  MarketplaceOffer,
} from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buttonStyles } from "@/components/button";
import { CategoryIcon } from "@/components/category-icon";
import { DashboardSectionCard } from "@/components/dashboard-primitives";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import type { FxQuotePayload } from "@/lib/fx-quote";
import { supportedFxCurrencies } from "@/lib/fx-quote";
import { getDictionary, getMetricLabel, translateUiToken } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import {
  getMetricValue,
  getOfferHref,
  normalizeDisplayText,
  parseMetricRange,
} from "@/lib/marketplace";
import {
  getInvestmentAccessMatches,
  marketIntelligenceAssets,
  type MarketIntelligenceAssetId,
} from "@/lib/market-intelligence";
import {
  getCalculatorSpeedLabel,
  getOfferCalculatorProfile,
  getOfferCalculatorResult,
} from "@/lib/offer-calculator";
import {
  readPersistedProductWorkspaceState,
  writePersistedProductWorkspaceState,
} from "@/lib/product-workspace-state";
import {
  getCountrySelectorOptions,
  matchesOfferCountrySelection,
  normalizeCountrySelection,
} from "@/lib/countries";
import type { UserProfile } from "@/lib/types";

type GoalId = MarketplaceCategory;
type CardFocus = "travel" | "cashback" | "atm" | "fx";

type PreviewRow = {
  key: string;
  providerName: string;
  title: string;
  primaryLabel: string;
  primaryValue: string;
  secondary: string;
  tags: string[];
  href: string;
};

type DiscoverWorkspaceDraft = {
  selectedGoal: GoalId;
  loanAmount: string;
  loanDuration: string;
  loanCountry: string;
  loanPurpose: string;
  transferAmount: string;
  transferFromCurrency: string;
  transferToCurrency: string;
  transferCountry: string;
  exchangeAmount: string;
  exchangeFromCurrency: string;
  exchangeToCurrency: string;
  exchangeCountry: string;
  insuranceType: MarketplaceInsuranceType;
  insuranceDuration: string;
  insuranceRegion: "all" | "eu" | "regional" | "worldwide";
  cardMonthlySpend: string;
  cardFocus: CardFocus;
  investmentsAsset: MarketIntelligenceAssetId;
};

const goalOptions: GoalId[] = [
  "transfers",
  "loans",
  "cards",
  "exchange",
  "insurance",
  "investments",
];

function getGoalLabel(locale: MarketplaceLocale, goal: GoalId) {
  const labels: Record<GoalId, string> =
    locale === "de"
      ? {
          transfers: "Geld ins Ausland senden",
          loans: "Kredit finden",
          cards: "Beste Karte finden",
          banking: "Konto eröffnen",
          exchange: "Währung tauschen",
          insurance: "Versicherung finden",
          investments: "Geld anlegen",
          crypto: "Krypto kaufen",
          business: "Geschäftskonto",
          budgeting: "Ausgaben verfolgen",
          kids: "Für Kinder",
        }
      : {
          transfers: "Send money abroad",
          loans: "Get a loan",
          cards: "Find best card",
          banking: "Open an account",
          exchange: "Exchange currency",
          insurance: "Get insured",
          investments: "Invest money",
          crypto: "Buy crypto",
          business: "Business account",
          budgeting: "Track spending",
          kids: "For kids",
        };

  return labels[goal];
}

function getGoalDescription(locale: MarketplaceLocale, goal: GoalId) {
  const descriptions: Record<GoalId, string> =
    locale === "de"
      ? {
          transfers: "Vergleiche, was nach Gebühren wirklich beim Empfänger ankommt.",
          loans: "Vergleiche Monatsrate, Zusagegeschwindigkeit und Kredit-Fit.",
          cards: "Wähle zuerst den Kartenzweck und vergleiche dann die echte Wirtschaftlichkeit.",
          banking: "Kostenlose Konten und Neobanken mit hohen Zinsen vergleichen.",
          exchange: "Vergleiche den gelieferten Wechselkurs statt nur Werbeversprechen.",
          insurance: "Starte mit der passenden Schutzart und verfeinere dann die Route.",
          investments: "Prüfe erst den Markt-Kontext und vergleiche dann die Plattformen.",
          crypto: "Vergleiche Krypto-Plattformen nach Gebühren und Asset-Auswahl.",
          business: "Geschäftskonten nach Funktionen, Währungen und Kosten vergleichen.",
          budgeting: "Ausgaben analysieren und Sparziele mit Open-Banking-Tools setzen.",
          kids: "Taschengeld-Apps mit elterlicher Kontrolle und Lernmodus vergleichen.",
        }
      : {
          transfers: "Compare what the recipient actually gets after fees.",
          loans: "Compare monthly cost, approval speed, and borrowing fit.",
          cards: "Choose the card angle first, then compare actual economics.",
          banking: "Compare free accounts and neobanks with high-yield options.",
          exchange: "Compare delivered conversion, not just headline rates.",
          insurance: "Start with the protection type, then narrow the route.",
          investments: "Review market context first, then compare platforms.",
          crypto: "Compare crypto platforms by fees, assets, and security model.",
          business: "Compare business accounts by features, currencies, and cost.",
          budgeting: "Analyse spending and set savings goals with open banking tools.",
          kids: "Compare pocket money apps with parental controls and learning modes.",
        };

  return descriptions[goal];
}

function formatCurrency(locale: MarketplaceLocale, value: number, currency = "EUR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

function fieldClassName() {
  return "h-12 rounded-[18px] border border-[#EAEAEA] bg-white px-4 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(17,24,39,0.04)] outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-accent-emerald/15 focus:bg-[#FCFCFD] focus:shadow-[0_14px_30px_rgba(17,24,39,0.08)] sm:h-14 sm:rounded-[20px]";
}

function amountFieldClassName() {
  return "h-12 rounded-[18px] border border-[#EAEAEA] bg-white px-4 text-[22px] font-bold tracking-[-0.05em] text-ink shadow-[0_8px_24px_rgba(17,24,39,0.04)] outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-accent-emerald/15 focus:bg-[#FCFCFD] focus:shadow-[0_14px_30px_rgba(17,24,39,0.08)] sm:h-14 sm:rounded-[20px] sm:text-[26px]";
}

function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
        {label}
      </span>
      {children}
    </label>
  );
}

function getCurrencyFlag(code: string) {
  switch (code) {
    case "EUR":
      return "EU";
    case "USD":
      return "US";
    case "GBP":
      return "UK";
    case "CHF":
      return "CH";
    default:
      return code.slice(0, 2).toUpperCase();
  }
}

function getPreviewTagTone(tag: string) {
  const normalized = tag.toLowerCase();

  if (
    normalized.includes("cheapest") ||
    normalized.includes("günst") ||
    normalized.includes("niedrig")
  ) {
    return "success" as const;
  }

  if (
    normalized.includes("fast") ||
    normalized.includes("schnell")
  ) {
    return "blue" as const;
  }

  if (
    normalized.includes("fit") ||
    normalized.includes("passend")
  ) {
    return "accent" as const;
  }

  return "muted" as const;
}

function CurrencySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2F4F7] text-[10px] font-bold tracking-[0.08em] text-ink-tertiary">
        {getCurrencyFlag(value)}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClassName()} pl-12`}
      >
        {supportedFxCurrencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
}

function countryMatchesOffer(offer: MarketplaceOffer, country: string) {
  if (!country) {
    return true;
  }

  return matchesOfferCountrySelection(offer, country);
}

function getCountryOptions(locale: MarketplaceLocale) {
  return getCountrySelectorOptions({ locale }).map((option) => ({
    value: option.value,
    label: option.label,
  }));
}

function normalizeCountryValue(value?: string | null) {
  return normalizeCountrySelection(value ?? null);
}

function getLoanMonthlyPayment(amount: number, aprPercent: number, months: number) {
  if (amount <= 0 || months <= 0) {
    return 0;
  }

  const monthlyRate = aprPercent / 100 / 12;
  if (monthlyRate <= 0) {
    return amount / months;
  }

  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function getLoanApr(offer: MarketplaceOffer) {
  return parseMetricRange(getMetricValue(offer, ["APR"])).min ?? 9.5;
}

function inferApprovalLabel(offer: MarketplaceOffer, locale: MarketplaceLocale) {
  const haystack = `${offer.title} ${offer.subtitle} ${offer.bestFor.join(" ")} ${offer.metrics
    .map((metric) => metric.value)
    .join(" ")}`.toLowerCase();

  if (haystack.includes("5 min")) return "~5 min";
  if (haystack.includes("10 min")) return "~10 min";
  if (haystack.includes("instant")) return locale === "de" ? "Sofort" : "Instant";
  if (haystack.includes("same day")) return locale === "de" ? "Am selben Tag" : "Same day";
  if (haystack.includes("24")) return "24h";
  return locale === "de" ? "1-2 Tage" : "1-2 days";
}

function getLoanPurposeBoost(offer: MarketplaceOffer, purpose: string) {
  const text = `${offer.title} ${offer.subtitle} ${offer.bestFor.join(" ")} ${(offer.attributes?.searchTags ?? []).join(" ")}`.toLowerCase();

  if (purpose === "general") return 0;
  if (purpose === "personal" && text.includes("personal")) return 16;
  if (purpose === "car" && (text.includes("car") || text.includes("vehicle"))) return 18;
  if (purpose === "device" && (text.includes("device") || text.includes("electronics"))) return 18;
  return 0;
}

function getInsuranceTypeLabel(type: MarketplaceInsuranceType, locale: MarketplaceLocale) {
  switch (type) {
    case "travel":
      return locale === "de" ? "Reise" : "Travel";
    case "health":
      return locale === "de" ? "Gesundheit" : "Health";
    case "life":
      return locale === "de" ? "Leben" : "Life";
    case "auto":
      return locale === "de" ? "Auto" : "Auto";
    case "nomad":
      return locale === "de" ? "Nomaden" : "Nomad";
    case "device":
      return locale === "de" ? "Gerät" : "Device";
    default:
      return normalizeDisplayText(type);
  }
}

export function DashboardDiscoverWorkspace({
  locale,
  userId,
  initialIntent,
  marketLabel,
  preferredCountry,
  profile,
  offers,
  recentOffers,
  savedOffers,
  dashboardHref,
  settingsHref,
  categoryHref,
  onCountryChange,
}: {
  locale: MarketplaceLocale;
  userId?: string | null;
  initialIntent?: MarketplaceCategory;
  marketLabel: string;
  preferredCountry?: string | null;
  profile?: UserProfile | null;
  offers: MarketplaceOffer[];
  recentOffers?: MarketplaceOffer[];
  savedOffers?: MarketplaceOffer[];
  dashboardHref?: string;
  settingsHref?: string;
  categoryHref: (category: MarketplaceCategory) => string;
  onCountryChange?: (country: string) => void;
}) {
  const dictionary = getDictionary(locale);
  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const copy =
    locale === "de"
      ? {
          signedInEyebrow: "Angemeldete Ebene",
          signedInTitle: "Behalte deinen Vergleichspfad über Sitzungen hinweg",
          signedInDescription:
            "Die Discover-Engine ist für alle gleich. Angemeldete Sitzungen ergänzen gemerkte Eingaben, gespeicherte Angebote und einen schnelleren Rückweg in die letzte Entscheidung.",
          continueDashboard: "Dashboard",
          continueSettings: "Einstellungen",
          continueTitle: "Dort weitermachen, wo du aufgehört hast",
          continueButton: "Fortsetzen",
          rememberTitle: "Discover-Eingaben bleiben jetzt mit deinem Konto verknüpft",
          rememberDescription:
            "Nutze unten ein Ziel und Payn merkt sich die letzten strukturierten Eingaben, gespeicherten Angebote und den aktuellen Markt-Kontext für deinen nächsten Besuch.",
          savedOffers: "Gespeicherte Angebote",
          savedOffersHint:
            "Vorgemerkte Anbieter bleiben in Discover und auf den vollständigen Kategorieseiten verfügbar.",
          profileContext: "Profilkontext",
          discoverMarket: "Discover-Markt",
          profileContextHint:
            "Empfehlungen nutzen dein gespeichertes Land und deine Profileinstellungen, wenn sie verfügbar sind.",
          step1Eyebrow: "Schritt 1",
          step1Title: "Wähle zuerst das Ziel",
          step1Description:
            `Starte mit einem Ziel und Payn zeigt die stärksten Routen für ${marketLabel.toLowerCase()}, bevor du die vollständige Vergleichsansicht öffnest.`,
          step2Eyebrow: "Schritt 2",
          step2Title: "Gib die minimale strukturierte Eingabe an",
          step2Description:
            "Jedes Ziel fragt nur die Informationen ab, die nötig sind, um vor dem Öffnen der vollständigen Seite echte Arbeit zu leisten.",
          step3Eyebrow: "Schritt 3",
          step3Title: "Top 3 Routen im Moment",
          step3Description:
            "Das ist die Sofortvorschau. Öffne die vollständige Seite, wenn du tiefere Ranking-Logik, gespeicherte Vergleiche und den kompletten Filtersatz willst.",
          openFullPrefix: "Vollständige Ansicht öffnen",
          updatingQuote: "Die Live-Kurs-Vorschau wird aktualisiert…",
          marketUnavailable:
            "Marktdaten sind vorübergehend nicht verfügbar. Ändere das Währungspaar oder versuche es gleich erneut.",
          emptyPreview:
            "Füge ein paar Eingaben hinzu und Payn zeigt hier sofort die stärksten Routen an.",
          checkDetails: "Details ansehen",
          chooseCountry: "Land wählen",
          amount: "Betrag",
          from: "Von",
          to: "Nach",
          destinationCountry: "Zielland",
          durationMonths: "Laufzeit (Monate)",
          country: "Land",
          purpose: "Zweck",
          monthlySpend: "Monatlicher Umsatz",
          cardGoal: "Kartenziel",
          marketCountry: "Marktland",
          protectionType: "Schutzart",
          termLength: "Laufzeit",
          duration: "Dauer",
          region: "Region",
          anyRegion: "Beliebige Region",
          asset: "Asset",
          recipientGets: "Empfänger erhält",
          youGet: "Du erhältst",
          monthly: "Monatlich",
          yearlyCashbackValue: "Jährlicher Cashback-Wert",
          atmLimit: "Gebührenfreier Bargeldrahmen",
          fxCostProfile: "FX-Kostenprofil",
          travelValue: "Reisewert",
          estimatedTripPrice: "Geschätzter Reisepreis",
          monthlyPremium: "Monatlicher Beitrag",
          coverRoute: "Schutzprofil",
          estimatedCost: "Geschätzte Kosten",
          routeDependent: "Abhängig von der Route",
          coverageAvailable: "Deckung verfügbar",
          checkRegion: "Region prüfen",
        }
      : {
          signedInEyebrow: "Signed-in layer",
          signedInTitle: "Keep your discover trail across sessions",
          signedInDescription:
            "The discover engine is the same for everyone. Signed-in sessions add remembered inputs, saved offers, and a faster way back into the last decision.",
          continueDashboard: "Dashboard",
          continueSettings: "Settings",
          continueTitle: "Continue where you left off",
          continueButton: "Resume",
          rememberTitle: "Discover inputs will now stay with your account",
          rememberDescription:
            "Use any goal below and Payn will remember the last structured inputs, saved offers, and the current market context for your next visit.",
          savedOffers: "Saved offers",
          savedOffersHint:
            "Shortlisted providers stay available across discover and the full category pages.",
          profileContext: "Profile context",
          discoverMarket: "Discover market",
          profileContextHint:
            "Recommendations use your saved country and profile settings when they are available.",
          step1Eyebrow: "Step 1",
          step1Title: "Choose the intent first",
          step1Description:
            `Start with one goal and Payn previews the strongest routes for ${marketLabel.toLowerCase()} before you open the full comparison flow.`,
          step2Eyebrow: "Step 2",
          step2Title: "Add the minimum structured input",
          step2Description:
            "Each goal asks for just enough information to do real work before the full page opens.",
          step3Eyebrow: "Step 3",
          step3Title: "Top 3 routes right now",
          step3Description:
            "This is the immediate preview. Open the full page when you want deeper ranking logic, compare persistence, and the full filter set.",
          openFullPrefix: "Open full",
          updatingQuote: "Updating the live quote preview…",
          marketUnavailable:
            "Market data temporarily unavailable. Change the pair or try again shortly.",
          emptyPreview:
            "Add a few inputs and Payn will preview the strongest routes here.",
          checkDetails: "Check details",
          chooseCountry: "Choose country",
          amount: "Amount",
          from: "From",
          to: "To",
          destinationCountry: "Destination country",
          durationMonths: "Duration (months)",
          country: "Country",
          purpose: "Purpose",
          monthlySpend: "Monthly spend",
          cardGoal: "Card goal",
          marketCountry: "Market country",
          protectionType: "Protection type",
          termLength: "Term length",
          duration: "Duration",
          region: "Region",
          anyRegion: "Any region",
          asset: "Asset",
          recipientGets: "Recipient gets",
          youGet: "You get",
          monthly: "Monthly",
          yearlyCashbackValue: "Yearly cashback value",
          atmLimit: "ATM fee-free limit",
          fxCostProfile: "FX cost profile",
          travelValue: "Travel value",
          estimatedTripPrice: "Estimated trip price",
          monthlyPremium: "Monthly premium",
          coverRoute: "Cover route",
          estimatedCost: "Estimated cost",
          routeDependent: "Route dependent",
          coverageAvailable: "Coverage available",
          checkRegion: "Check region",
        };
  const workspaceStateKey = "product-discover";
  const defaultCountry = useMemo(() => normalizeCountryValue(preferredCountry ?? profile?.home_country), [preferredCountry, profile?.home_country]);
  const defaultWorkspaceState = useMemo<DiscoverWorkspaceDraft>(
    () => ({
      selectedGoal: "transfers",
      loanAmount: "5000",
      loanDuration: "24",
      loanCountry: defaultCountry,
      loanPurpose: "general",
      transferAmount: "1000",
      transferFromCurrency: "EUR",
      transferToCurrency: "GBP",
      transferCountry: defaultCountry,
      exchangeAmount: "1000",
      exchangeFromCurrency: "EUR",
      exchangeToCurrency: "USD",
      exchangeCountry: defaultCountry,
      insuranceType: "travel",
      insuranceDuration: "30",
      insuranceRegion: "worldwide",
      cardMonthlySpend: "1500",
      cardFocus: "travel",
      investmentsAsset: "spy",
    }),
    [defaultCountry],
  );
  const [workspaceStateLoaded, setWorkspaceStateLoaded] = useState(false);
  const lastAppliedIntentRef = useRef<GoalId | null>(null);
  const lastPreferredCountryRef = useRef(defaultCountry);
  const [selectedGoal, setSelectedGoal] = useState<GoalId>(defaultWorkspaceState.selectedGoal);
  const [loanAmount, setLoanAmount] = useState(defaultWorkspaceState.loanAmount);
  const [loanDuration, setLoanDuration] = useState(defaultWorkspaceState.loanDuration);
  const [loanCountry, setLoanCountry] = useState(defaultWorkspaceState.loanCountry);
  const [loanPurpose, setLoanPurpose] = useState(defaultWorkspaceState.loanPurpose);
  const [transferAmount, setTransferAmount] = useState(defaultWorkspaceState.transferAmount);
  const [transferFromCurrency, setTransferFromCurrency] = useState(defaultWorkspaceState.transferFromCurrency);
  const [transferToCurrency, setTransferToCurrency] = useState(defaultWorkspaceState.transferToCurrency);
  const [transferCountry, setTransferCountry] = useState(defaultWorkspaceState.transferCountry);
  const [exchangeAmount, setExchangeAmount] = useState(defaultWorkspaceState.exchangeAmount);
  const [exchangeFromCurrency, setExchangeFromCurrency] = useState(defaultWorkspaceState.exchangeFromCurrency);
  const [exchangeToCurrency, setExchangeToCurrency] = useState(defaultWorkspaceState.exchangeToCurrency);
  const [exchangeCountry, setExchangeCountry] = useState(defaultWorkspaceState.exchangeCountry);
  const [insuranceType, setInsuranceType] = useState<MarketplaceInsuranceType>(defaultWorkspaceState.insuranceType);
  const [insuranceDuration, setInsuranceDuration] = useState(defaultWorkspaceState.insuranceDuration);
  const [insuranceRegion, setInsuranceRegion] = useState(defaultWorkspaceState.insuranceRegion);
  const [cardMonthlySpend, setCardMonthlySpend] = useState(defaultWorkspaceState.cardMonthlySpend);
  const [cardFocus, setCardFocus] = useState<CardFocus>(defaultWorkspaceState.cardFocus);
  const [investmentsAsset, setInvestmentsAsset] = useState<MarketIntelligenceAssetId>(defaultWorkspaceState.investmentsAsset);
  const [quote, setQuote] = useState<FxQuotePayload | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    const persistedState = readPersistedProductWorkspaceState(
      workspaceStateKey,
      defaultWorkspaceState,
      userId,
    );

    setSelectedGoal(persistedState.selectedGoal as GoalId);
    setLoanAmount(persistedState.loanAmount);
    setLoanDuration(persistedState.loanDuration);
    setLoanCountry(persistedState.loanCountry);
    setLoanPurpose(persistedState.loanPurpose);
    setTransferAmount(persistedState.transferAmount);
    setTransferFromCurrency(persistedState.transferFromCurrency);
    setTransferToCurrency(persistedState.transferToCurrency);
    setTransferCountry(persistedState.transferCountry);
    setExchangeAmount(persistedState.exchangeAmount);
    setExchangeFromCurrency(persistedState.exchangeFromCurrency);
    setExchangeToCurrency(persistedState.exchangeToCurrency);
    setExchangeCountry(persistedState.exchangeCountry);
    setInsuranceType(persistedState.insuranceType as MarketplaceInsuranceType);
    setInsuranceDuration(persistedState.insuranceDuration);
    setInsuranceRegion(persistedState.insuranceRegion as DiscoverWorkspaceDraft["insuranceRegion"]);
    setCardMonthlySpend(persistedState.cardMonthlySpend);
    setCardFocus(persistedState.cardFocus as CardFocus);
    setInvestmentsAsset(persistedState.investmentsAsset as MarketIntelligenceAssetId);
    setWorkspaceStateLoaded(true);
  }, [defaultWorkspaceState, userId]);

  useEffect(() => {
    if (!workspaceStateLoaded || !defaultCountry) {
      return;
    }

    if (lastPreferredCountryRef.current === defaultCountry) {
      return;
    }

    lastPreferredCountryRef.current = defaultCountry;
    setLoanCountry(defaultCountry);
    setTransferCountry(defaultCountry);
    setExchangeCountry(defaultCountry);
  }, [defaultCountry, workspaceStateLoaded]);

  useEffect(() => {
    if (!initialIntent) {
      return;
    }

    if (lastAppliedIntentRef.current === initialIntent) {
      return;
    }

    lastAppliedIntentRef.current = initialIntent;
    setSelectedGoal(initialIntent);
  }, [initialIntent]);

  useEffect(() => {
    if (!workspaceStateLoaded) {
      return;
    }

    writePersistedProductWorkspaceState(
      workspaceStateKey,
      {
        selectedGoal,
        loanAmount,
        loanDuration,
        loanCountry,
        loanPurpose,
        transferAmount,
        transferFromCurrency,
        transferToCurrency,
        transferCountry,
        exchangeAmount,
        exchangeFromCurrency,
        exchangeToCurrency,
        exchangeCountry,
        insuranceType,
        insuranceDuration,
        insuranceRegion,
        cardMonthlySpend,
        cardFocus,
        investmentsAsset,
      },
      userId,
    );
  }, [
    cardFocus,
    cardMonthlySpend,
    exchangeAmount,
    exchangeCountry,
    exchangeFromCurrency,
    exchangeToCurrency,
    insuranceDuration,
    insuranceRegion,
    insuranceType,
    investmentsAsset,
    loanAmount,
    loanCountry,
    loanDuration,
    loanPurpose,
    selectedGoal,
    transferAmount,
    transferCountry,
    transferFromCurrency,
    transferToCurrency,
    userId,
    workspaceStateLoaded,
  ]);

  const quoteConfig = useMemo(() => {
    if (selectedGoal === "transfers") {
      return { from: transferFromCurrency, to: transferToCurrency };
    }

    if (selectedGoal === "exchange") {
      return { from: exchangeFromCurrency, to: exchangeToCurrency };
    }

    return null;
  }, [
    exchangeFromCurrency,
    exchangeToCurrency,
    selectedGoal,
    transferFromCurrency,
    transferToCurrency,
  ]);

  useEffect(() => {
    if (!quoteConfig || quoteConfig.from === quoteConfig.to) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    const controller = new AbortController();
    setQuoteLoading(true);

    void (async () => {
      try {
        const response = await fetch(
          `/api/v1/fx-quote?from=${quoteConfig.from}&to=${quoteConfig.to}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Quote request failed");
        }

        const payload = (await response.json()) as FxQuotePayload;
        setQuote(payload);
      } catch {
        if (!controller.signal.aborted) {
          setQuote(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [quoteConfig]);

  const previewRows = useMemo(() => {
    if (selectedGoal === "transfers" || selectedGoal === "exchange") {
      const amountValue = Number.parseFloat(
        selectedGoal === "transfers" ? transferAmount : exchangeAmount,
      );
      const fromCurrency = selectedGoal === "transfers" ? transferFromCurrency : exchangeFromCurrency;
      const toCurrency = selectedGoal === "transfers" ? transferToCurrency : exchangeToCurrency;
      const selectedCountry = selectedGoal === "transfers" ? transferCountry : exchangeCountry;

      if (!quote || quote.unavailable || !Number.isFinite(quote.rate) || !amountValue) {
        return [] as PreviewRow[];
      }

      return offers
        .filter(
          (offer) =>
            offer.category === selectedGoal &&
            Boolean(getOfferCalculatorProfile(offer)) &&
            countryMatchesOffer(offer, selectedCountry),
        )
        .map((offer) => {
          const result = getOfferCalculatorResult({
            offer,
            amount: amountValue,
            fromCurrency: fromCurrency as (typeof supportedFxCurrencies)[number],
            toCurrency: toCurrency as (typeof supportedFxCurrencies)[number],
            baseRate: quote.rate,
          });

          if (!result) {
            return null;
          }

          return {
            key: offer.id,
            providerName: offer.providerName,
            title: offer.title,
            primaryLabel: selectedGoal === "transfers" ? copy.recipientGets : copy.youGet,
            primaryValue: formatCurrency(locale, result.finalAmount, toCurrency),
            secondary: `Fee ${formatCurrency(locale, result.totalFeeSource, fromCurrency)} · ${getCalculatorSpeedLabel(
              result.speedHours,
              locale,
            )}`,
            tags: [
              result.totalFeeSource <= 3 ? translateUiToken(locale, "Cheapest") : "",
              result.speedHours <= 1 ? translateUiToken(locale, "Fastest") : "",
              selectedCountry ? translateUiToken(locale, "Country fit") : translateUiToken(locale, "Live quote"),
            ].filter(Boolean),
            href: categoryHref(selectedGoal),
          } satisfies PreviewRow;
        })
        .filter((row): row is PreviewRow => Boolean(row))
        .sort((left, right) => {
          const leftValue = Number.parseFloat(left.primaryValue.replace(/[^\d.-]/g, ""));
          const rightValue = Number.parseFloat(right.primaryValue.replace(/[^\d.-]/g, ""));
          return rightValue - leftValue;
        })
        .filter((row, index, source) => source.findIndex((item) => item.providerName === row.providerName) === index)
        .slice(0, 3);
    }

    if (selectedGoal === "loans") {
      const amountValue = Number.parseFloat(loanAmount);
      const durationValue = Number.parseInt(loanDuration, 10);

      return offers
        .filter((offer) => offer.category === "loans" && countryMatchesOffer(offer, loanCountry))
        .map((offer) => {
          const amountRange = parseMetricRange(getMetricValue(offer, ["Amount"]));
          const termRange = {
            min: offer.attributes?.minTermMonths ?? 0,
            max: offer.attributes?.maxTermMonths ?? Number.POSITIVE_INFINITY,
          };

          if (
            amountValue <= 0 ||
            durationValue <= 0 ||
            amountValue < (offer.attributes?.minAmount ?? amountRange.min ?? 0) ||
            amountValue > (offer.attributes?.maxAmount ?? amountRange.max ?? Number.POSITIVE_INFINITY) ||
            durationValue < termRange.min ||
            durationValue > termRange.max
          ) {
            return null;
          }

          const apr = getLoanApr(offer);
          const monthly = getLoanMonthlyPayment(amountValue, apr, durationValue);
          const purposeBoost = getLoanPurposeBoost(offer, loanPurpose);

          return {
            key: offer.id,
            providerName: offer.providerName,
            title: offer.title,
            primaryLabel: copy.monthly,
            primaryValue: formatCurrency(locale, monthly),
            secondary: `APR ${normalizeDisplayText(getMetricValue(offer, ["APR"]) ?? "—")} · ${locale === "de" ? "Zusage" : "Approval"} ${inferApprovalLabel(
              offer,
              locale,
            )}`,
            tags: [
              purposeBoost > 0 ? `${normalizeDisplayText(loanPurpose)} ${locale === "de" ? "Fit" : "fit"}` : "",
              loanCountry ? translateUiToken(locale, "Country fit") : "",
              translateUiToken(locale, "Consumer credit"),
            ].filter(Boolean),
            href: categoryHref("loans"),
          } satisfies PreviewRow;
        })
        .filter((row): row is PreviewRow => Boolean(row))
        .sort((left, right) => {
          const leftValue = Number.parseFloat(left.primaryValue.replace(/[^\d.-]/g, ""));
          const rightValue = Number.parseFloat(right.primaryValue.replace(/[^\d.-]/g, ""));
          return leftValue - rightValue;
        })
        .slice(0, 3);
    }

    if (selectedGoal === "cards") {
      const monthlySpend = Number.parseFloat(cardMonthlySpend) || 0;

      return offers
        .filter((offer) => offer.category === "cards")
        .map((offer) => {
          const annualFee = offer.attributes?.annualFeeAmount ?? parseMetricRange(getMetricValue(offer, ["Annual fee"])).min ?? 0;
          const fxFee = offer.attributes?.fxFeePercent ?? parseMetricRange(getMetricValue(offer, ["FX fee"])).min ?? 1;
          const cashback = offer.attributes?.cashbackPercent ?? parseMetricRange(getMetricValue(offer, ["Cashback"])).max ?? 0;
          const atmLimit = offer.attributes?.atmFreeLimit ?? parseMetricRange(getMetricValue(offer, ["ATM", "ATM limit"])).max ?? 0;
          const yearlyTravelValue = cashback * monthlySpend * 12 * 0.01 - annualFee - fxFee * monthlySpend * 0.2 * 12 * 0.01;
          const yearlyCashbackValue = cashback * monthlySpend * 12 * 0.01 - annualFee;

          if (cardFocus === "cashback") {
            return {
              key: offer.id,
              providerName: offer.providerName,
              title: offer.title,
              primaryLabel: copy.yearlyCashbackValue,
              primaryValue: formatCurrency(locale, yearlyCashbackValue),
              secondary: `${normalizeDisplayText(getMetricLabel(locale, "Cashback"))} ${normalizeDisplayText(
                getMetricValue(offer, ["Cashback"]) ?? "—",
              )} · ${normalizeDisplayText(getMetricLabel(locale, "Annual fee"))} ${normalizeDisplayText(
                getMetricValue(offer, ["Annual fee"]) ?? "—",
              )}`,
              tags: [
                translateUiToken(locale, "Cashback-first"),
                annualFee === 0 ? translateUiToken(locale, "No annual fee") : "",
              ].filter(Boolean),
              href: categoryHref("cards"),
            } satisfies PreviewRow;
          }

          if (cardFocus === "atm") {
            return {
              key: offer.id,
              providerName: offer.providerName,
              title: offer.title,
              primaryLabel: copy.atmLimit,
              primaryValue: formatCurrency(locale, atmLimit),
              secondary: `${normalizeDisplayText(getMetricLabel(locale, "FX fee"))} ${normalizeDisplayText(
                getMetricValue(offer, ["FX fee"]) ?? "—",
              )} · ${normalizeDisplayText(getMetricLabel(locale, "Annual fee"))} ${normalizeDisplayText(
                getMetricValue(offer, ["Annual fee"]) ?? "—",
              )}`,
              tags: [
                translateUiToken(locale, "ATM focus"),
                atmLimit >= 400 ? translateUiToken(locale, "Stronger ATM") : "",
              ].filter(Boolean),
              href: categoryHref("cards"),
            } satisfies PreviewRow;
          }

          return {
            key: offer.id,
            providerName: offer.providerName,
            title: offer.title,
            primaryLabel: cardFocus === "fx" ? copy.fxCostProfile : copy.travelValue,
            primaryValue: formatCurrency(locale, yearlyTravelValue),
            secondary: `${normalizeDisplayText(getMetricLabel(locale, "FX fee"))} ${normalizeDisplayText(
              getMetricValue(offer, ["FX fee"]) ?? "—",
            )} · ${normalizeDisplayText(getMetricLabel(locale, "Cashback"))} ${normalizeDisplayText(
              getMetricValue(offer, ["Cashback"]) ?? "—",
            )}`,
            tags: [
              cardFocus === "fx"
                ? translateUiToken(locale, "FX-first")
                : translateUiToken(locale, "Travel-first"),
              annualFee === 0 ? translateUiToken(locale, "No annual fee") : "",
            ].filter(Boolean),
            href: categoryHref("cards"),
          } satisfies PreviewRow;
        })
        .sort((left, right) => {
          const leftValue = Number.parseFloat(left.primaryValue.replace(/[^\d.-]/g, ""));
          const rightValue = Number.parseFloat(right.primaryValue.replace(/[^\d.-]/g, ""));
          return cardFocus === "atm" ? rightValue - leftValue : rightValue - leftValue;
        })
        .filter((row, index, source) => source.findIndex((item) => item.providerName === row.providerName) === index)
        .slice(0, 3);
    }

    if (selectedGoal === "insurance") {
      const durationValue = Number.parseInt(insuranceDuration, 10) || 0;

      return offers
        .filter(
          (offer) =>
            offer.category === "insurance" &&
            offer.attributes?.insuranceType === insuranceType &&
            (insuranceRegion === "all" || offer.attributes?.regionCoverage === insuranceRegion),
        )
        .map((offer) => {
          const price =
            offer.attributes?.priceAmount ??
            parseMetricRange(getMetricValue(offer, ["Price", "Monthly premium"])).min ??
            0;

          if (
            durationValue > 0 &&
            (insuranceType === "travel" || insuranceType === "nomad") &&
            (offer.attributes?.maxTripDays ?? 999) < durationValue
          ) {
            return null;
          }

          return {
            key: offer.id,
            providerName: offer.providerName,
            title: offer.title,
            primaryLabel:
              insuranceType === "travel" || insuranceType === "nomad"
                ? copy.estimatedTripPrice
                : insuranceType === "life"
                  ? copy.monthlyPremium
                  : copy.coverRoute,
            primaryValue: formatCurrency(locale, price, offer.metrics.some((metric) => metric.value.includes("USD")) ? "USD" : "EUR"),
            secondary: `${normalizeDisplayText(
              getMetricValue(offer, ["Medical cover", "Coverage", "Insured amount", "Liability"]) ?? copy.coverageAvailable,
            )} · ${normalizeDisplayText(
              getMetricValue(offer, ["Region coverage", "Countries covered", "Worldwide protection"]) ?? copy.checkRegion,
            )}`,
            tags: [
              insuranceRegion !== "all" ? normalizeDisplayText(insuranceRegion) : "",
              offer.attributes?.visaCompliant ? (locale === "de" ? "Visa-Fit" : "Visa fit") : "",
              insuranceType === "device" ? (locale === "de" ? "Geräteschutz" : "Device cover") : "",
            ].filter(Boolean),
            href: categoryHref("insurance"),
          } satisfies PreviewRow;
        })
        .filter((row): row is PreviewRow => Boolean(row))
        .sort((left, right) => {
          const leftValue = Number.parseFloat(left.primaryValue.replace(/[^\d.-]/g, ""));
          const rightValue = Number.parseFloat(right.primaryValue.replace(/[^\d.-]/g, ""));
          return leftValue - rightValue;
        })
        .slice(0, 3);
    }

    return getInvestmentAccessMatches(
      offers.filter((offer) => offer.category === "investments"),
      investmentsAsset,
    )
      .filter((match, index, source) => source.findIndex((item) => item.offer.providerName === match.offer.providerName) === index)
      .slice(0, 3)
      .map((match) => ({
        key: `${match.offer.id}-${match.assetId}`,
        providerName: match.offer.providerName,
        title: match.offer.title,
        primaryLabel: copy.estimatedCost,
        primaryValue: match.estimatedCostLabel,
        secondary: `${match.accessType} · ${match.minimumOrder ?? copy.routeDependent}`,
        tags: [
          match.recurringSupported ? translateUiToken(locale, "Savings plan") : "",
          translateUiToken(locale, normalizeDisplayText(match.bestFor)),
        ].filter(Boolean),
        href: `${categoryHref("investments")}?asset=${investmentsAsset}`,
      }));
  }, [
    cardFocus,
    cardMonthlySpend,
    categoryHref,
    exchangeAmount,
    exchangeCountry,
    exchangeFromCurrency,
    exchangeToCurrency,
    insuranceDuration,
    insuranceRegion,
    insuranceType,
    investmentsAsset,
    loanAmount,
    loanCountry,
    loanDuration,
    loanPurpose,
    locale,
    offers,
    quote,
    selectedGoal,
    transferAmount,
    transferCountry,
    transferFromCurrency,
    transferToCurrency,
  ]);

  const continueHref = useMemo(() => {
    if (selectedGoal === "investments") {
      return `${categoryHref("investments")}?asset=${investmentsAsset}`;
    }

    return categoryHref(selectedGoal);
  }, [categoryHref, investmentsAsset, selectedGoal]);
  const openFullLabel =
    locale === "de"
      ? `Vollständige ${dictionary.categories[selectedGoal]}-Ansicht öffnen`
      : `Open full ${dictionary.categories[selectedGoal]}`;

  const showUnavailable =
    (selectedGoal === "transfers" || selectedGoal === "exchange") &&
    !quoteLoading &&
    (!quote || quote.unavailable);
  const continueOffer = recentOffers?.[0] ?? savedOffers?.[0] ?? null;
  const selectedCountryLabel =
    countryOptions.find((option) => option.value === normalizeCountryValue(preferredCountry ?? profile?.home_country))?.label ??
    null;
  const updateLoanCountry = (nextCountry: string) => {
    setLoanCountry(nextCountry);
    onCountryChange?.(nextCountry);
  };

  const updateTransferCountry = (nextCountry: string) => {
    setTransferCountry(nextCountry);
    onCountryChange?.(nextCountry);
  };

  const updateExchangeCountry = (nextCountry: string) => {
    setExchangeCountry(nextCountry);
    onCountryChange?.(nextCountry);
  };

  return (
    <div className="mx-auto grid max-w-[1100px] gap-6">
      {userId ? (
        <DashboardSectionCard
          eyebrow={copy.signedInEyebrow}
          title={copy.signedInTitle}
          description={copy.signedInDescription}
          action={
            <div className="flex flex-wrap gap-2">
              {dashboardHref ? (
                <Link href={dashboardHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                  {copy.continueDashboard}
                </Link>
              ) : null}
              {settingsHref ? (
                <Link href={settingsHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                  {copy.continueSettings}
                </Link>
              ) : null}
            </div>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="grid gap-3">
              {continueOffer ? (
                <Link
                  href={localePath(locale, getOfferHref(continueOffer))}
                  className="flex flex-col gap-4 rounded-[22px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-5 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ProviderLogo providerName={continueOffer.providerName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                        {copy.continueTitle}
                      </p>
                      <p className="mt-2 text-base font-bold tracking-[-0.02em] text-ink">{continueOffer.title}</p>
                      <p className="mt-2 text-sm text-ink-secondary">{continueOffer.providerName}</p>
                    </div>
                  </div>
                  <span className={`${buttonStyles({ variant: "primary", size: "sm" })} w-full justify-center sm:w-auto`}>
                    {copy.continueButton}
                  </span>
                </Link>
              ) : (
                <div className="rounded-[22px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-5">
                  <p className="text-base font-semibold text-ink">{copy.rememberTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {copy.rememberDescription}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{copy.savedOffers}</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-ink">{savedOffers?.length ?? 0}</p>
                <p className="mt-2 text-sm text-ink-tertiary">{copy.savedOffersHint}</p>
              </div>
              <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{copy.profileContext}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{selectedCountryLabel ?? copy.discoverMarket}</p>
                <p className="mt-2 text-sm text-ink-tertiary">{copy.profileContextHint}</p>
              </div>
            </div>
          </div>
        </DashboardSectionCard>
      ) : null}

      <DashboardSectionCard
        eyebrow={copy.step1Eyebrow}
        title={copy.step1Title}
        description={copy.step1Description}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {goalOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setSelectedGoal(goal)}
              className={clsx(
                "group rounded-[28px] border px-5 py-5 text-left shadow-[0_10px_24px_rgba(17,24,39,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(17,24,39,0.10)] active:scale-[0.985]",
                selectedGoal === goal
                  ? "border-accent-emerald bg-accent-emerald text-white"
                  : "border-[#EAEAEA] bg-white text-ink hover:bg-[#FCFCFD]",
              )}
            >
              <div className="flex items-start gap-4">
                <CategoryIcon
                  category={goal}
                  size="lg"
                  className={selectedGoal === goal ? "border-accent-emerald/20 bg-white/20 text-white shadow-none" : ""}
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold tracking-[-0.02em]">{getGoalLabel(locale, goal)}</p>
                  <p
                    className={clsx(
                      "mt-2 max-w-[22rem] text-sm leading-relaxed",
                      selectedGoal === goal ? "text-white/80" : "text-ink-secondary",
                    )}
                  >
                    {getGoalDescription(locale, goal)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        eyebrow={copy.step2Eyebrow}
        title={copy.step2Title}
        description={copy.step2Description}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {selectedGoal === "transfers" ? (
            <>
              <MiniField label={copy.amount}>
                <input
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                  className={amountFieldClassName()}
                  inputMode="decimal"
                />
              </MiniField>
              <MiniField label={copy.from}>
                <CurrencySelect value={transferFromCurrency} onChange={setTransferFromCurrency} />
              </MiniField>
              <MiniField label={copy.to}>
                <CurrencySelect value={transferToCurrency} onChange={setTransferToCurrency} />
              </MiniField>
              <MiniField label={copy.destinationCountry}>
                <select value={transferCountry} onChange={(event) => updateTransferCountry(event.target.value)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </MiniField>
            </>
          ) : null}

          {selectedGoal === "loans" ? (
            <>
              <MiniField label={copy.amount}>
                <input
                  value={loanAmount}
                  onChange={(event) => setLoanAmount(event.target.value)}
                  className={amountFieldClassName()}
                  inputMode="decimal"
                />
              </MiniField>
              <MiniField label={copy.durationMonths}>
                <input
                  value={loanDuration}
                  onChange={(event) => setLoanDuration(event.target.value)}
                  className={fieldClassName()}
                  inputMode="numeric"
                />
              </MiniField>
              <MiniField label={copy.country}>
                <select value={loanCountry} onChange={(event) => updateLoanCountry(event.target.value)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </MiniField>
              <MiniField label={copy.purpose}>
                <select value={loanPurpose} onChange={(event) => setLoanPurpose(event.target.value)} className={fieldClassName()}>
                  <option value="general">{locale === "de" ? "Allgemein" : "General"}</option>
                  <option value="personal">{locale === "de" ? "Persönlich" : "Personal"}</option>
                  <option value="car">{locale === "de" ? "Auto" : "Car"}</option>
                  <option value="device">{locale === "de" ? "Gerät" : "Device"}</option>
                </select>
              </MiniField>
            </>
          ) : null}

          {selectedGoal === "cards" ? (
            <>
              <MiniField label={copy.monthlySpend}>
                <input
                  value={cardMonthlySpend}
                  onChange={(event) => setCardMonthlySpend(event.target.value)}
                  className={amountFieldClassName()}
                  inputMode="decimal"
                />
              </MiniField>
              <MiniField label={copy.cardGoal}>
                <select value={cardFocus} onChange={(event) => setCardFocus(event.target.value as CardFocus)} className={fieldClassName()}>
                  <option value="travel">{locale === "de" ? "Reise" : "Travel"}</option>
                  <option value="cashback">Cashback</option>
                  <option value="atm">ATM</option>
                  <option value="fx">FX</option>
                </select>
              </MiniField>
            </>
          ) : null}

          {selectedGoal === "exchange" ? (
            <>
              <MiniField label={copy.amount}>
                <input
                  value={exchangeAmount}
                  onChange={(event) => setExchangeAmount(event.target.value)}
                  className={amountFieldClassName()}
                  inputMode="decimal"
                />
              </MiniField>
              <MiniField label={copy.from}>
                <CurrencySelect value={exchangeFromCurrency} onChange={setExchangeFromCurrency} />
              </MiniField>
              <MiniField label={copy.to}>
                <CurrencySelect value={exchangeToCurrency} onChange={setExchangeToCurrency} />
              </MiniField>
              <MiniField label={copy.marketCountry}>
                <select value={exchangeCountry} onChange={(event) => updateExchangeCountry(event.target.value)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </MiniField>
            </>
          ) : null}

          {selectedGoal === "insurance" ? (
            <>
              <MiniField label={copy.protectionType}>
                <select
                  value={insuranceType}
                  onChange={(event) => setInsuranceType(event.target.value as MarketplaceInsuranceType)}
                  className={fieldClassName()}
                >
                  <option value="travel">{getInsuranceTypeLabel("travel", locale)}</option>
                  <option value="health">{getInsuranceTypeLabel("health", locale)}</option>
                  <option value="life">{getInsuranceTypeLabel("life", locale)}</option>
                  <option value="auto">Auto</option>
                  <option value="nomad">{getInsuranceTypeLabel("nomad", locale)}</option>
                  <option value="device">{getInsuranceTypeLabel("device", locale)}</option>
                </select>
              </MiniField>
              {(insuranceType === "travel" || insuranceType === "nomad" || insuranceType === "life") ? (
                <MiniField label={insuranceType === "life" ? copy.termLength : copy.duration}>
                  <input
                    value={insuranceDuration}
                    onChange={(event) => setInsuranceDuration(event.target.value)}
                    className={fieldClassName()}
                    inputMode="numeric"
                  />
                </MiniField>
              ) : null}
              {(insuranceType === "travel" || insuranceType === "nomad" || insuranceType === "health" || insuranceType === "device") ? (
                <MiniField label={copy.region}>
                  <select
                    value={insuranceRegion}
                    onChange={(event) => setInsuranceRegion(event.target.value as DiscoverWorkspaceDraft["insuranceRegion"])}
                    className={fieldClassName()}
                  >
                    <option value="all">{copy.anyRegion}</option>
                    <option value="eu">EU</option>
                    <option value="regional">{locale === "de" ? "Regional" : "Regional"}</option>
                    <option value="worldwide">{locale === "de" ? "Weltweit" : "Worldwide"}</option>
                  </select>
                </MiniField>
              ) : null}
            </>
          ) : null}

          {selectedGoal === "investments" ? (
            <MiniField label={copy.asset}>
              <select
                value={investmentsAsset}
                onChange={(event) => setInvestmentsAsset(event.target.value as MarketIntelligenceAssetId)}
                className={fieldClassName()}
              >
                {Object.values(marketIntelligenceAssets).map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label}
                  </option>
                ))}
              </select>
            </MiniField>
          ) : null}
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        eyebrow={copy.step3Eyebrow}
        title={copy.step3Title}
        description={copy.step3Description}
        action={
          <Link href={continueHref} className={buttonStyles({ variant: "primary", size: "sm" })}>
            {openFullLabel}
          </Link>
        }
      >
        {quoteLoading ? (
          <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-8 text-sm text-ink-secondary">
            {copy.updatingQuote}
          </div>
        ) : showUnavailable ? (
          <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-8 text-sm text-ink-secondary">
            {copy.marketUnavailable}
          </div>
        ) : previewRows.length > 0 ? (
          <div className="grid gap-3">
            {previewRows.map((row, index) => (
              <div
                key={row.key}
                className="grid gap-4 rounded-[24px] border border-[#EAEAEA] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#FCFCFD] hover:shadow-[0_18px_34px_rgba(17,24,39,0.10)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center active:scale-[0.99]"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="w-8 pt-1 text-sm font-semibold text-ink-tertiary">#{index + 1}</div>
                  <ProviderLogo providerName={row.providerName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{row.providerName}</p>
                      <span className="text-sm text-ink-tertiary">·</span>
                      <p className="text-base font-bold tracking-[-0.02em] text-ink">{row.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{row.secondary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.tags.map((tag) => (
                        <Tag
                          key={`${row.key}-${tag}`}
                          tone={getPreviewTagTone(tag)}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {row.primaryLabel}
                  </p>
                  <p className="mt-2 text-[28px] font-bold tracking-[-0.06em] text-ink tabular-nums">{row.primaryValue}</p>
                  <Link
                    href={row.href}
                    className={`${buttonStyles({ variant: "secondary", size: "sm" })} mt-3 w-full justify-center sm:w-auto`}
                  >
                    {copy.checkDetails}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-8 text-sm text-ink-secondary">
            {copy.emptyPreview}
          </div>
        )}
      </DashboardSectionCard>
    </div>
  );
}
