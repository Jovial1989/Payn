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

import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import type { FxQuotePayload } from "@/lib/fx-quote";
import { supportedFxCurrencies } from "@/lib/fx-quote";
import { getDictionary, getMetricLabel, translateUiToken } from "@/lib/i18n";

import {
  getMetricValue,
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
  "neobanks",
  "savings",
  "exchange",
  "insurance",
  "investments",
  "crypto",
  "debit",
  "travel",
  "cashback",
  "banking",
  "remittance",
  "wallets",
  "bnpl",
  "budgeting",
  "kids",
  "trading",
  "business",
  "payroll",
  "expense",
  "tax",
];

function getGoalLabel(locale: MarketplaceLocale, goal: GoalId) {
  const labels: Record<GoalId, string> =
    locale === "de"
      ? {
          transfers: "Geld ins Ausland senden",
          loans: "Kredit finden",
          cards: "Beste Karte finden",
          neobanks: "Neobank wählen",
          savings: "Tagesgeld & Sparen",
          banking: "Konto eröffnen",
          exchange: "Währung tauschen",
          insurance: "Versicherung finden",
          investments: "Geld anlegen",
          crypto: "Krypto kaufen",
          debit: "Debitkarte finden",
          travel: "Reisekarte finden",
          cashback: "Cashback-Karte",
          remittance: "Heimatüberweisungen",
          wallets: "Digitale Geldbörse",
          bnpl: "Jetzt kaufen, später zahlen",
          budgeting: "Ausgaben verfolgen",
          kids: "Für Kinder",
          trading: "Trading-Plattform",
          business: "Geschäftskonto",
          payroll: "Lohnabrechnung",
          expense: "Ausgabenmanagement",
          tax: "Steuererklärung",
        }
      : {
          // FIX-03: canonical category names so MOST-USED titles match the
          // sidebar/jump-in/category-route labels. The action-y subtitle in
          // getGoalDescription below carries the verb, the title stays a
          // recognizable navigation token.
          transfers: "Transfers",
          loans: "Loans",
          cards: "Cards",
          neobanks: "Neobanks",
          savings: "Savings",
          banking: "Banking",
          exchange: "Exchange",
          insurance: "Insurance",
          investments: "Investments",
          crypto: "Crypto",
          debit: "Debit cards",
          travel: "Travel cards",
          cashback: "Cashback cards",
          remittance: "Remittance",
          wallets: "Wallets",
          bnpl: "Buy now, pay later",
          budgeting: "Budgeting",
          kids: "Kids & Family",
          trading: "Trading",
          business: "Business",
          payroll: "Payroll",
          expense: "Expense management",
          tax: "Tax",
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
          neobanks: "Konten mit hohen Zinsen, Echtzeit-Benachrichtigungen und 0 € Gebühren.",
          savings: "Vergleiche Tagesgeldzinsen und Festgeld – stets auf dem neuesten Stand.",
          banking: "Kostenlose Konten und Neobanken mit hohen Zinsen vergleichen.",
          exchange: "Vergleiche den gelieferten Wechselkurs statt nur Werbeversprechen.",
          insurance: "Starte mit der passenden Schutzart und verfeinere dann die Route.",
          investments: "Prüfe erst den Markt-Kontext und vergleiche dann die Plattformen.",
          crypto: "Vergleiche Krypto-Plattformen nach Gebühren und Asset-Auswahl.",
          debit: "Debitkarten ohne Auslandsgebühren und mit kostenlosem Geldautomaten.",
          travel: "Keine Wechselkurszuschläge, kostenlose Abhebungen weltweit.",
          cashback: "Echte Cashback-Raten auf Einkäufe – ohne versteckte Bedingungen.",
          remittance: "Überweisungsgebühren und Auszahlungsgeschwindigkeit vergleichen.",
          wallets: "Apple Pay, Google Pay und digitale Konten für alltägliche Zahlungen.",
          bnpl: "Jetzt kaufen, in Raten zahlen – ohne Zinsen bei pünktlicher Zahlung.",
          budgeting: "Ausgaben analysieren und Sparziele mit Open-Banking-Tools setzen.",
          kids: "Taschengeld-Apps mit elterlicher Kontrolle und Lernmodus vergleichen.",
          trading: "CFD-, Aktien- und ETF-Plattformen nach Kosten und Tools vergleichen.",
          business: "Geschäftskonten nach Funktionen, Währungen und Kosten vergleichen.",
          payroll: "Globale Gehaltsabrechnung und Arbeitgeberregistrierung vergleichen.",
          expense: "Firmenkarten und Ausgabenkontrolle für Teams vergleichen.",
          tax: "Steuersoftware für Selbstständige und Expats im Vergleich.",
        }
      : {
          transfers: "See exactly what arrives — fees and FX included.",
          loans: "Personal loans from 3.9% APR across 8 markets.",
          cards: "Cashback, travel, low-fee — pick the angle, we'll match.",
          neobanks: "Accounts with high interest, real-time alerts and zero fees.",
          savings: "Compare easy-access rates and fixed-term deposits — always current.",
          banking: "Compare free accounts and neobanks with great rates.",
          exchange: "Real exchange rates, no hidden markup.",
          insurance: "Car, home, life — compare what's actually included.",
          investments: "Brokers, ETFs and cash savings — fees compared.",
          crypto: "Compare exchanges by fees, assets, and security.",
          debit: "Zero FX fees, free ATM withdrawals — compare debit cards.",
          travel: "No foreign transaction fees, free ATM withdrawals worldwide.",
          cashback: "Real cashback rates on your spending — no hidden conditions.",
          remittance: "Compare transfer fees and payout speed to 130+ countries.",
          wallets: "Apple Pay, Google Pay and digital accounts for everyday payments.",
          bnpl: "Buy now, pay in instalments — often interest-free if you pay on time.",
          budgeting: "Connect your accounts and see where your money goes.",
          kids: "Pocket money apps with spending limits and savings goals.",
          trading: "Compare CFD, stock and ETF platforms by cost and tools.",
          business: "Multi-currency accounts for teams — fees and features compared.",
          payroll: "Global payroll and employer-of-record services compared.",
          expense: "Company cards and spend management for teams — compared.",
          tax: "Tax filing software for freelancers and expats — fees and features.",
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
            "",
          savedOffers: "Gespeicherte Angebote",
          savedOffersHint:
            "Vorgemerkte Anbieter bleiben in Discover und auf den vollständigen Kategorieseiten verfügbar.",
          profileContext: "Profilkontext",
          discoverMarket: "Discover-Markt",
          profileContextHint:
            "Empfehlungen nutzen dein gespeichertes Land und deine Profileinstellungen, wenn sie verfügbar sind.",
          step1Eyebrow: "",
          step1Title: "Ziel wählen",
          step1Description: "",
          step2Eyebrow: "",
          step2Title: "Ein paar Details",
          step2Description: "",
          step3Eyebrow: "",
          step3Title: "Drei gute Optionen",
          step3Description: "",
          openFullPrefix: "Alle ansehen",
          updatingQuote: "Die aktuellen Kurse werden abgerufen…",
          marketUnavailable:
            "Zeigt Kurse von früher heute. Gleich aktualisieren für die neuesten.",
          emptyPreview:
            "Wähle oben ein Ziel, um die besten Optionen für dich zu sehen.",
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
          rememberDescription: "",
          savedOffers: "Saved offers",
          savedOffersHint:
            "Shortlisted providers stay available across discover and the full category pages.",
          profileContext: "Profile context",
          discoverMarket: "Discover market",
          profileContextHint:
            "Recommendations use your saved country and profile settings when they are available.",
          step1Eyebrow: "",
          step1Title: "Browse by goal",
          step1Description: "",
          step2Eyebrow: "",
          step2Title: "A couple of details",
          step2Description: "",
          step3Eyebrow: "",
          step3Title: "Three good fits",
          step3Description: "",
          openFullPrefix: "See all",
          updatingQuote: "Getting the latest rates…",
          marketUnavailable:
            "Showing rates from earlier today. Refresh in a moment for the latest.",
          emptyPreview:
            "Choose a goal above to see the best options for you.",
          checkDetails: "See details",
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
  const [showAllGoals, setShowAllGoals] = useState(false);
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

    if (!goalOptions.includes(initialIntent as GoalId)) {
      return;
    }
    lastAppliedIntentRef.current = initialIntent as GoalId;
    setSelectedGoal(initialIntent as GoalId);
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

    if (selectedGoal === "investments") {
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
    }

    // Generic fallback for all other categories: show top 3 by affiliatePriorityScore
    return offers
      .filter((offer) => offer.category === selectedGoal)
      .filter((offer, index, source) => source.findIndex((o) => o.providerName === offer.providerName) === index)
      .sort((a, b) => (b.affiliatePriorityScore ?? 0) - (a.affiliatePriorityScore ?? 0))
      .slice(0, 3)
      .map((offer) => {
        const metric1 = offer.metrics[0];
        const metric2 = offer.metrics[1];
        return {
          key: offer.id,
          providerName: offer.providerName,
          title: offer.title,
          primaryLabel: metric1?.label ?? "",
          primaryValue: normalizeDisplayText(metric1?.value ?? "—"),
          secondary: metric2 ? `${metric2.label} ${normalizeDisplayText(metric2.value)}` : "",
          tags: (offer.bestFor ?? []).slice(0, 2).map((t) => normalizeDisplayText(t)),
          href: categoryHref(selectedGoal),
        } satisfies PreviewRow;
      });
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
  const goalOfferCount = offers.filter((o) => o.category === selectedGoal).length;
  const openFullLabel =
    locale === "de"
      ? `${copy.openFullPrefix} ${goalOfferCount} Angebote →`
      : `${copy.openFullPrefix} ${goalOfferCount} offers →`;

  const showUnavailable =
    (selectedGoal === "transfers" || selectedGoal === "exchange") &&
    !quoteLoading &&
    (!quote || quote.unavailable);
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
      {/* Most-used goals */}
      <section className="rounded-[28px] border border-line bg-white px-6 py-8 shadow-card sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {locale === "de" ? "Meist gesucht" : "Most-used"}
          </p>
          <div className="h-px flex-1 bg-line" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(["transfers", "loans", "cards", "savings", "exchange", "neobanks"] as GoalId[]).map((goal) => {
            const count = offers.filter((o) => o.category === goal).length;
            return (
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-semibold tracking-[-0.02em]">{getGoalLabel(locale, goal)}</p>
                      {count > 0 && (
                        <span
                          className={clsx(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            selectedGoal === goal
                              ? "bg-white/20 text-white"
                              : "bg-accent-emerald-soft text-accent-emerald-strong",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </div>
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
            );
          })}
        </div>

        {/* More ways to compare */}
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {locale === "de" ? "Weitere Vergleiche" : "More ways to compare"}
            </p>
            <div className="h-px flex-1 bg-line" />
          </div>
          {!showAllGoals ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink-secondary">
                {locale === "de"
                  ? "Außerdem: Kinderkonto, Payroll, Ausgaben-Tracking, Steuererklärung, Geschäftskonto und mehr."
                  : "Also: kids’ banking, payroll, expense tracking, tax filing, business accounts, and more."}
              </p>
              <button
                type="button"
                onClick={() => setShowAllGoals(true)}
                className="shrink-0 rounded-full border border-line bg-bg-surface px-4 py-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:border-accent-emerald/40 hover:text-accent-emerald-strong"
              >
                {locale === "de" ? "Alle 17 anzeigen →" : "Show all 17 →"}
              </button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {goalOptions
                .filter((g) => !(["transfers", "loans", "cards", "savings", "exchange", "neobanks"] as GoalId[]).includes(g))
                .map((goal) => {
                  const count = offers.filter((o) => o.category === goal).length;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setSelectedGoal(goal)}
                      className={clsx(
                        "flex items-center gap-3 rounded-[16px] border px-4 py-3 text-left transition-all duration-150 hover:shadow-[0_4px_12px_rgba(17,24,39,0.07)]",
                        selectedGoal === goal
                          ? "border-accent-emerald bg-accent-emerald text-white"
                          : "border-[#EAEAEA] bg-white text-ink hover:bg-[#FCFCFD]",
                      )}
                    >
                      <CategoryIcon
                        category={goal}
                        size="sm"
                        className={selectedGoal === goal ? "border-accent-emerald/20 bg-white/20 text-white shadow-none" : ""}
                      />
                      <span className="flex-1 text-sm font-semibold">{getGoalLabel(locale, goal)}</span>
                      {count > 0 && (
                        <span
                          className={clsx(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            selectedGoal === goal
                              ? "bg-white/20 text-white"
                              : "bg-accent-emerald-soft text-accent-emerald-strong",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* Quick check */}
      <section className="rounded-[28px] border border-line bg-white px-6 py-8 shadow-card sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {locale === "de" ? "Schnellcheck" : "Quick check"}
          </p>
          <div className="h-px flex-1 bg-line" />
        </div>
        <h2 className="mb-4 text-xl font-bold tracking-[-0.02em] text-ink">{copy.step2Title}</h2>
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
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 [&>div]:w-full [&_select]:w-full">
                    <CurrencySelect value={transferFromCurrency} onChange={setTransferFromCurrency} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const tmp = transferFromCurrency;
                      setTransferFromCurrency(transferToCurrency);
                      setTransferToCurrency(tmp);
                    }}
                    className="h-12 shrink-0 rounded-full border border-line bg-bg-surface px-2.5 text-sm text-ink-tertiary transition-colors hover:border-accent-emerald/40 hover:text-accent-emerald-strong sm:h-14"
                    aria-label="Swap currencies"
                  >
                    ⇄
                  </button>
                </div>
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
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 [&>div]:w-full [&_select]:w-full">
                    <CurrencySelect value={exchangeFromCurrency} onChange={setExchangeFromCurrency} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const tmp = exchangeFromCurrency;
                      setExchangeFromCurrency(exchangeToCurrency);
                      setExchangeToCurrency(tmp);
                    }}
                    className="h-12 shrink-0 rounded-full border border-line bg-bg-surface px-2.5 text-sm text-ink-tertiary transition-colors hover:border-accent-emerald/40 hover:text-accent-emerald-strong sm:h-14"
                    aria-label="Swap currencies"
                  >
                    ⇄
                  </button>
                </div>
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
      </section>

      {/* Best for you */}
      <section className="rounded-[28px] border border-line bg-white px-6 py-8 shadow-card sm:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {locale === "de" ? "Am besten für dich" : "Best for you"}
            </p>
            <div className="h-px w-8 bg-line" />
          </div>
          <Link href={continueHref} className={buttonStyles({ variant: "primary", size: "sm" })}>
            {openFullLabel}
          </Link>
        </div>
        <h2 className="mb-4 text-xl font-bold tracking-[-0.02em] text-ink">{copy.step3Title}</h2>
        {showUnavailable && (
          <div className="mb-4 rounded-[16px] border border-line bg-bg-surface px-4 py-3 text-sm text-ink-secondary">
            {copy.marketUnavailable}
          </div>
        )}
        {quoteLoading ? (
          <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-8 text-center text-sm text-ink-secondary">
            {copy.updatingQuote}
          </div>
        ) : previewRows.length > 0 ? (
          <div className="grid gap-3">
            {previewRows.map((row) => (
              <div
                key={row.key}
                // Lock the two columns to deterministic widths so cards
                // share row heights and the right column hugs both top and
                // bottom edges (no dead air between logo and price). The
                // right column is a flex column with justify-between so the
                // primaryValue floats top, the CTA floats bottom regardless
                // of how much content the left column emits.
                className="group/preview grid gap-5 rounded-3xl border border-line bg-white px-5 py-5 shadow-subtle transition-all duration-200 hover:-translate-y-px hover:border-accent-emerald/25 hover:shadow-card active:scale-[0.99] sm:grid-cols-[minmax(0,1fr)_200px] sm:items-stretch"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <ProviderLogo providerName={row.providerName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{row.providerName}</p>
                      <span className="text-sm text-ink-tertiary">·</span>
                      <p className="text-base font-bold tracking-tight-1 text-ink">{row.title}</p>
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

                <div className="flex flex-col justify-between gap-3 sm:items-end sm:text-right">
                  <div>
                    <p className="eyebrow-cap">{row.primaryLabel}</p>
                    <p className="mt-1 text-[28px] font-extrabold tracking-tight-3 text-ink tabular-nums">{row.primaryValue}</p>
                  </div>
                  <Link
                    href={row.href}
                    className={`${buttonStyles({ variant: "secondary", size: "sm" })} w-full justify-center sm:w-auto`}
                  >
                    {copy.checkDetails}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-8 text-center text-sm text-ink-secondary">
            {copy.emptyPreview}
          </div>
        )}
      </section>
    </div>
  );
}
