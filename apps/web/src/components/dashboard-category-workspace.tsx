"use client";
import type {
  MarketplaceCategory,
  MarketplaceInsuranceType,
  MarketplaceLocale,
  MarketplaceOffer,
} from "@payn/types";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buttonStyles } from "@/components/button";
import { OfferRowAtlas } from "@/features/marketplace/offer-row-atlas";
import { DashboardEmptyState } from "@/components/dashboard-primitives";
import { CategoryPill } from "@/components/category-pill";
import { InsuranceCompareTable } from "@/components/insurance-compare-table";
import {
  ProductCompareTable,
  type ProductCompareEntry,
} from "@/components/product-compare-table";
import { Tag } from "@/components/tag";
import type { DashboardOfferInsight } from "@/lib/dashboard";
import type { FxQuotePayload } from "@/lib/fx-quote";
import { supportedFxCurrencies } from "@/lib/fx-quote";
import { getDictionary, getMetricLabel, translateUiToken } from "@/lib/i18n";
import {
  getMetricValue,
  normalizeDisplayText,
  parseMetricRange,
} from "@/lib/marketplace";
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
  getCountryCode,
  getCountrySelectorOptions,
  matchesOfferCountrySelection,
  normalizeCountrySelection,
} from "@/lib/countries";
import type { UserProfile } from "@/lib/types";

type DecisionResultMetric = { label: string; value: string };
type DecisionResultTag = { label: string; tone?: "neutral" | "accent" | "muted" | "success" | "blue" | "purple" | "orange" };

type CountryValue = string;
type InsuranceSelection = MarketplaceInsuranceType;
type InsuranceRegionFilter = "all" | "eu" | "worldwide" | "regional";
type InsuranceActivityFilter = "all" | "basic" | "extreme";
type LoanPurpose = "general" | "personal" | "car" | "device";
type LoanIncomeRange =
  | "not_shared"
  | "under_2000"
  | "2000_3500"
  | "3500_5000"
  | "5000_plus";
type LoanEmploymentStatus =
  | "not_shared"
  | "salaried"
  | "self_employed"
  | "part_time"
  | "student"
  | "retired";

type RankedResult = {
  offer: MarketplaceOffer;
  score: number;
  primaryLabel: string;
  primaryValue: string;
  summary: string;
  metrics: DecisionResultMetric[];
  why: string;
  tags: DecisionResultTag[];
  feeValue?: number;
  speedValue?: number;
  popularityValue: number;
  flexibilityValue?: number;
};

const loanPurposeOptions = [
  { value: "general", label: "General" },
  { value: "personal", label: "Personal" },
  { value: "car", label: "Car" },
  { value: "device", label: "Device / electronics" },
 ] as const satisfies ReadonlyArray<{ value: LoanPurpose; label: string }>;

const loanIncomeRangeOptions: Array<{ value: LoanIncomeRange; label: string }> = [
  { value: "not_shared", label: "Not shared" },
  { value: "under_2000", label: "Under €2,000" },
  { value: "2000_3500", label: "€2,000 - €3,500" },
  { value: "3500_5000", label: "€3,500 - €5,000" },
  { value: "5000_plus", label: "€5,000+" },
];

const loanEmploymentOptions: Array<{ value: LoanEmploymentStatus; label: string }> = [
  { value: "not_shared", label: "Not shared" },
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self-employed" },
  { value: "part_time", label: "Part-time" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

const insuranceTypes: InsuranceSelection[] = ["travel", "health", "life", "auto", "nomad", "device"];

type CategoryWorkspaceDraft = {
  amount: string;
  duration: string;
  country: CountryValue;
  purpose: LoanPurpose;
  interestRate: string;
  incomeRange: LoanIncomeRange;
  employmentStatus: LoanEmploymentStatus;
  fromCountry: CountryValue;
  toCountry: CountryValue;
  fromCurrency: string;
  toCurrency: string;
  insuranceType: InsuranceSelection;
  coverageAmount: string;
  maxPrice: string;
  minMedicalCoverage: string;
  maxDeductible: string;
  regionFilter: InsuranceRegionFilter;
  activityFilter: InsuranceActivityFilter;
  visaCompliantOnly: boolean;
  compareSelection: string[];
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatCurrency(locale: MarketplaceLocale, value: number, currency = "EUR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

function normalizeScore(value: number, min: number, max: number, direction: "higher" | "lower") {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (max === min) {
    return 72;
  }

  const ratio = direction === "higher" ? (value - min) / (max - min) : (max - value) / (max - min);
  return clampPercent(ratio * 100);
}

function getOfferText(offer: MarketplaceOffer) {
  return `${offer.providerName} ${offer.title} ${offer.subtitle} ${offer.bestFor.join(" ")} ${offer.metrics
    .map((metric) => `${metric.label} ${metric.value}`)
    .join(" ")} ${(offer.attributes?.searchTags ?? []).join(" ")}`.toLowerCase();
}

function inferSpeedValue(offer: MarketplaceOffer) {
  const text = getOfferText(offer);

  if (text.includes("instant")) return 0.25;
  if (text.includes("5 min")) return 0.08;
  if (text.includes("10 min")) return 0.17;
  if (text.includes("minutes")) return 0.5;
  if (text.includes("same day")) return 6;
  if (text.includes("24 hours") || text.includes("24h")) return 24;
  if (text.includes("1-2 days")) return 36;
  if (text.includes("2-5 days")) return 72;

  return 48;
}

function getPopularityScore(offer: MarketplaceOffer, insight?: DashboardOfferInsight) {
  const activity = insight?.activityScore ?? 0;
  const saves = insight?.saveCount ?? 0;
  return clampPercent(offer.affiliatePriorityScore * 55 + activity * 2.5 + saves * 6 + 20);
}

function getSimplicityScore(offer: MarketplaceOffer) {
  const text = getOfferText(offer);
  let score = 48;

  if (offer.attributes?.feeProfile === "low") score += 18;
  if (text.includes("no annual fee") || text.includes("eur 0")) score += 16;
  if (text.includes("instant") || text.includes("same day")) score += 10;
  if (text.includes("digital") || text.includes("app")) score += 8;
  if (text.includes("transparent") || text.includes("mid-market")) score += 8;
  if (text.includes("rolling monthly") || text.includes("instant activation")) score += 6;

  return clampPercent(score);
}

function matchesCountry(offer: MarketplaceOffer, country: CountryValue) {
  if (!country) {
    return true;
  }

  return matchesOfferCountrySelection(offer, country);
}

function getCountryFitScore(offer: MarketplaceOffer, country: CountryValue) {
  if (!country) {
    return 72;
  }

  if (country === "eu") {
    return matchesOfferCountrySelection(offer, country) ? 78 : 0;
  }

  if (country === "international") {
    return matchesOfferCountrySelection(offer, country) ? 70 : 0;
  }

  const codes = new Set(offer.countryCodes.map((code) => code.toUpperCase()));
  const selectedCode = getCountryCode(country);

  if (codes.has(selectedCode)) {
    return 100;
  }

  if (codes.has("EU")) {
    return 72;
  }

  if (offer.attributes?.availability === "international") {
    return 58;
  }

  return 0;
}

function getAvailableAmountRange(offer: MarketplaceOffer) {
  const metricRange = parseMetricRange(getMetricValue(offer, ["Amount"]));
  return {
    min: offer.attributes?.minAmount ?? metricRange.min ?? 0,
    max: offer.attributes?.maxAmount ?? metricRange.max ?? Number.POSITIVE_INFINITY,
  };
}

function getTermRange(offer: MarketplaceOffer) {
  return {
    min: offer.attributes?.minTermMonths ?? 0,
    max: offer.attributes?.maxTermMonths ?? Number.POSITIVE_INFINITY,
  };
}

function getLoanApr(offer: MarketplaceOffer) {
  return parseMetricRange(getMetricValue(offer, ["APR"])).min ?? 9.5;
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

function getLoanApprovalLabel(offer: MarketplaceOffer, locale: MarketplaceLocale) {
  const speed = inferSpeedValue(offer);
  if (speed <= 1) return locale === "de" ? "Minuten" : "Minutes";
  if (speed <= 24) return "24h";
  return locale === "de" ? "1-2 Tage" : "1-2 days";
}

function getLoanPurposeBoost(text: string, purpose: LoanPurpose) {
  if (purpose === "general") {
    return 0;
  }

  return text.includes(purpose) ? 12 : 0;
}

function getLoanIncomeBoost(offer: MarketplaceOffer, incomeRange: LoanIncomeRange) {
  const maxAmount = offer.attributes?.maxAmount ?? getAvailableAmountRange(offer).max;
  const apr = getLoanApr(offer);

  if (incomeRange === "under_2000") {
    return apr <= 9 ? 8 : 0;
  }

  if (incomeRange === "5000_plus") {
    return maxAmount >= 40000 ? 8 : 0;
  }

  if (incomeRange === "3500_5000") {
    return maxAmount >= 25000 && apr <= 12 ? 6 : 0;
  }

  return 0;
}

function getLoanEmploymentBoost(offer: MarketplaceOffer, employmentStatus: LoanEmploymentStatus) {
  const text = getOfferText(offer);

  if (employmentStatus === "self_employed") {
    return text.includes("digital") || text.includes("flexible") ? 6 : 0;
  }

  if (employmentStatus === "student") {
    return offer.attributes?.maxAmount && offer.attributes.maxAmount <= 15000 ? 6 : 0;
  }

  if (employmentStatus === "retired") {
    return getLoanApr(offer) <= 10 ? 4 : 0;
  }

  return 0;
}


function getMetricDisplayValue(
  metrics: DecisionResultMetric[],
  labels: string[],
  fallback = "Check details",
) {
  return metrics.find((metric) => labels.includes(metric.label))?.value ?? fallback;
}

function getInsuranceType(offer: MarketplaceOffer): InsuranceSelection | null {
  const type = offer.attributes?.insuranceType ?? offer.attributes?.subtype;

  if (
    type === "travel" ||
    type === "health" ||
    type === "life" ||
    type === "auto" ||
    type === "nomad" ||
    type === "device"
  ) {
    return type;
  }

  return null;
}

function getInsuranceTypeLabel(type: InsuranceSelection, locale: MarketplaceLocale) {
  switch (type) {
    case "travel":
      return locale === "de" ? "Reise" : "Travel";
    case "health":
      return locale === "de" ? "Gesundheit" : "Health";
    case "life":
      return locale === "de" ? "Leben" : "Life";
    case "auto":
      return "Auto";
    case "nomad":
      return locale === "de" ? "Nomaden" : "Nomad";
    case "device":
      return locale === "de" ? "Gerät" : "Device";
    default:
      return normalizeDisplayText(type);
  }
}

function getInsurancePriceValue(offer: MarketplaceOffer) {
  return (
    offer.attributes?.priceAmount ??
    parseMetricRange(getMetricValue(offer, ["Price", "Monthly premium", "Premium"])).min ??
    Number.NaN
  );
}

function getInsuranceCoverageAmount(offer: MarketplaceOffer) {
  return (
    offer.attributes?.coverageAmount ??
    parseMetricRange(getMetricValue(offer, ["Coverage", "Insured amount", "Device cover", "Liability"])).max ??
    0
  );
}

function getInsuranceMedicalCoverage(offer: MarketplaceOffer) {
  return (
    offer.attributes?.medicalCoverage ??
    parseMetricRange(getMetricValue(offer, ["Medical cover", "Medical emergencies"])).max ??
    0
  );
}

function getInsuranceDeductible(offer: MarketplaceOffer) {
  return (
    offer.attributes?.deductibleAmount ??
    parseMetricRange(getMetricValue(offer, ["Deductible"])).min ??
    0
  );
}

function getInsuranceTripDuration(offer: MarketplaceOffer) {
  return (
    offer.attributes?.maxTripDays ??
    parseMetricRange(getMetricValue(offer, ["Trip length"])).max ??
    999
  );
}

function getInsuranceDurationValue(offer: MarketplaceOffer, type: InsuranceSelection) {
  if (type === "life") {
    return parseMetricRange(getMetricValue(offer, ["Term"])).max ?? 999;
  }

  return getInsuranceTripDuration(offer);
}

function insuranceUsesDuration(type: InsuranceSelection) {
  return type === "travel" || type === "nomad" || type === "life";
}

function insuranceUsesRegion(type: InsuranceSelection) {
  return type === "travel" || type === "nomad" || type === "health" || type === "device";
}

function insuranceUsesActivity(type: InsuranceSelection) {
  return type === "travel" || type === "nomad";
}

function insuranceUsesVisa(type: InsuranceSelection) {
  return type === "travel" || type === "nomad";
}

function getInsuranceFlexibility(offer: MarketplaceOffer) {
  const text = getOfferText(offer);
  let score = 48;

  if (text.includes("rolling monthly")) score += 22;
  if (text.includes("worldwide") || text.includes("180+")) score += 14;
  if (text.includes("digital claims") || text.includes("app")) score += 12;
  if (offer.attributes?.instantActivation || text.includes("instant activation")) score += 10;
  if (text.includes("flexible") || text.includes("adjust")) score += 8;

  return clampPercent(score);
}

function getInsuranceMetrics(
  offer: MarketplaceOffer,
  type: InsuranceSelection,
  locale: MarketplaceLocale,
): DecisionResultMetric[] {
  const labelsByType: Partial<Record<MarketplaceInsuranceType, string[]>> = {
    travel: ["Price", "Medical cover", "Trip length", "Region coverage", "Baggage / delay"],
    health: ["Monthly premium", "Outpatient", "Inpatient", "Digital claims"],
    life: ["Monthly premium", "Insured amount", "Term", "Family cover"],
    auto: ["Monthly premium", "Liability", "Collision / theft", "Roadside support", "Deductible"],
    nomad: ["Price", "Rolling monthly", "Countries covered", "Medical emergencies", "Remote work suitability"],
    device: ["Monthly premium", "Device cover", "Theft / liquid", "Worldwide protection", "Deductible"],
  };

  return (labelsByType[type] ?? [])
    .map((label) => {
      const value = getMetricValue(offer, [label]);
      if (!value) {
        return null;
      }

      return {
        label: normalizeDisplayText(getMetricLabel(locale, label)),
        value: normalizeDisplayText(value),
      };
    })
    .filter((metric): metric is DecisionResultMetric => Boolean(metric));
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
  return "h-12 rounded-[18px] border border-[#EAEAEA] bg-white px-4 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(17,24,39,0.04)] outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-accent-emerald/15 focus:bg-[#FCFCFD] focus:shadow-[0_14px_30px_rgba(17,24,39,0.08)] sm:h-14 sm:rounded-[20px]";
}

function amountFieldClassName() {
  return "h-12 rounded-[18px] border border-[#EAEAEA] bg-white px-4 text-[22px] font-bold tracking-[-0.05em] text-ink shadow-[0_8px_24px_rgba(17,24,39,0.04)] outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-accent-emerald/15 focus:bg-[#FCFCFD] focus:shadow-[0_14px_30px_rgba(17,24,39,0.08)] sm:h-14 sm:rounded-[20px] sm:text-[26px]";
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
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClassName()} pl-12`}>
        {supportedFxCurrencies.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

function getCountryOptions(locale: MarketplaceLocale) {
  return getCountrySelectorOptions({ locale }).map((option) => ({
    value: option.value,
    label: option.label,
    flag: option.flag,
  }));
}

function getValidCountryValue(countryOptions: ReturnType<typeof getCountryOptions>, value?: string | null) {
  const normalizedValue = normalizeCountrySelection(value ?? null);
  return countryOptions.some((option) => option.value === normalizedValue) ? normalizedValue : "";
}

// Loading placeholder shaped like an OfferRowAtlas result so the swap from
// skeleton to live ranked rows doesn't shift the layout. Mirrors the shared
// CategoryRouteSkeleton row so FX refreshes read as the same surface.
function OfferRowSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-4">
        <div className="skeleton-block h-12 w-12 shrink-0 rounded-[12px]" />
        <div className="min-w-0 flex-1 space-y-2 sm:flex-[0_0_260px]">
          <div className="skeleton-block h-4 w-40 rounded-full" />
          <div className="skeleton-block h-3 w-28 rounded-full" />
          <div className="skeleton-block mt-1 h-5 w-32 rounded-full" />
        </div>
        <div className="hidden min-w-0 flex-1 md:flex md:flex-col md:gap-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="skeleton-block h-2.5 w-16 rounded-full" />
              <div className="skeleton-block h-3.5 w-20 rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="skeleton-block h-2.5 w-16 rounded-full" />
              <div className="skeleton-block h-3.5 w-20 rounded-full" />
            </div>
          </div>
          <ul className="grid gap-1.5">
            <li className="skeleton-block h-3 w-full rounded-full" />
            <li className="skeleton-block h-3 w-5/6 rounded-full" />
          </ul>
        </div>
        <div className="skeleton-block h-10 w-28 shrink-0 rounded-xl sm:h-11 sm:w-36" />
      </div>
    </div>
  );
}

function getDefaultCategoryWorkspaceState(
  category: MarketplaceCategory,
  defaultCountry: CountryValue,
): CategoryWorkspaceDraft {
  return {
    amount: category === "loans" ? "5000" : "1000",
    duration: category === "insurance" ? "30" : "24",
    country: defaultCountry,
    purpose: "general",
    interestRate: "",
    incomeRange: "not_shared",
    employmentStatus: "not_shared",
    fromCountry: defaultCountry,
    toCountry: defaultCountry,
    fromCurrency: "EUR",
    toCurrency: category === "exchange" ? "USD" : "GBP",
    insuranceType: "travel",
    coverageAmount: "500000",
    maxPrice: "250",
    minMedicalCoverage: "0",
    maxDeductible: "1000",
    regionFilter: "all",
    activityFilter: "all",
    visaCompliantOnly: false,
    compareSelection: [],
  };
}

function decorateTags(args: {
  row: RankedResult;
  cheapestOfferId: string | null;
  fastestOfferId: string | null;
  popularOfferId: string | null;
  topOfferId: string | null;
  flexibleOfferId?: string | null;
}) {
  const tags: DecisionResultTag[] = [];

  if (args.row.offer.id === args.cheapestOfferId) {
    tags.push({ label: "Cheapest", tone: "success" });
  }

  if (args.row.offer.id === args.fastestOfferId) {
    tags.push({ label: "Fastest", tone: "blue" });
  }

  if (args.row.offer.id === args.popularOfferId) {
    tags.push({ label: "Best rated", tone: "purple" });
  }

  if (args.row.offer.id === args.flexibleOfferId) {
    tags.push({ label: "Most flexible", tone: "orange" });
  }

  if (args.row.offer.id === args.topOfferId) {
    tags.push({ label: "Best match", tone: "accent" });
  }

  return tags.slice(0, 3);
}

export function DashboardCategoryWorkspace({
  locale,
  userId,
  category,
  marketLabel,
  profile,
  preferredCountry,
  onCountryChange,
  offers,
  insights,
  discoverHref,
}: {
  locale: MarketplaceLocale;
  userId?: string | null;
  category: MarketplaceCategory;
  marketLabel: string;
  profile: UserProfile | null;
  preferredCountry?: string | null;
  onCountryChange?: (country: string) => void;
  offers: MarketplaceOffer[];
  insights: DashboardOfferInsight[];
  discoverHref: string;
}) {
  const dictionary = getDictionary(locale);
  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const copy =
    locale === "de"
      ? {
          loansTitle: "Konsumenten- und Privatkredite live vergleichen",
          transfersTitle: "Überweisung eingeben und vergleichen, was beim Empfänger ankommt",
          exchangeTitle: "Wechsel eingeben und den effektiven Kurs vergleichen",
          insuranceTitle: "Zuerst die Schutzart wählen",
          loansDescription:
            `Digitale Kreditgeber, Banken und Fintechs mit Konsumenten- und Privatkrediten für ${marketLabel.toLowerCase()} — nach realer Monatsrate sortiert. Betrag, Laufzeit, Zinsannahme, Einkommen, Beschäftigung oder Zweck ändern sich sofort im Ranking.`,
          transfersDescription:
            `Ändere Korridor, Betrag oder Währungspaar und das Ranking für ${marketLabel.toLowerCase()} aktualisiert sich mit Live-Kurs und jedem Gebührenmodell.`,
          exchangeDescription:
            `Payn nutzt den Live-Marktkurs plus Aufschläge und Gebühren der Anbieter, damit eine sortierte Wechsel-Liste für ${marketLabel.toLowerCase()} sichtbar bleibt.`,
          insuranceDescription:
            `Wähle zuerst die echte Schutzart und filtere dann nach Deckung, Region, Selbstbehalt, Laufzeit und Visa-Fit, bevor du Anbieter in ${marketLabel.toLowerCase()} vergleichst.`,
          backToDiscover: "Zurück zu Discover",
          amount: "Betrag",
          durationMonths: "Laufzeit (Monate)",
          country: "Land",
          purpose: "Zweck",
          interestRateOptional: "Zinssatz (optional)",
          useTopProviderEstimate: "Top-Anbieter-Schätzung verwenden",
          incomeRangeOptional: "Einkommensbereich (optional)",
          employmentStatusOptional: "Beschäftigungsstatus (optional)",
          fromCountry: "Von Land",
          toCountry: "Nach Land",
          currency: "Währung",
          fromCurrency: "Von Währung",
          toCurrency: "Nach Währung",
          chooseCountry: "Land wählen",
          protectionType: "Schutzart",
          termLength: "Laufzeit",
          duration: "Dauer",
          sumInsured: "Versicherungssumme",
          liabilityTarget: "Haftungsziel",
          deviceValue: "Gerätewert",
          coverageAmount: "Deckungsbetrag",
          maxTripPrice: "Max. Reisepreis",
          maxMonthlyPremium: "Max. Monatsbeitrag",
          monthlyPremium: "Monatlicher Beitrag",
          medicalCoverLevel: "Leistungsniveau medizinisch",
          medicalCoverage: "Medizinische Deckung",
          deductibleTier: "Selbstbehalt-Stufe",
          deductible: "Selbstbehalt",
          coverageRegion: "Deckungsregion",
          region: "Region",
          tripStyle: "Reisestil",
          activity: "Aktivität",
          visaCompliant: "Visa-konform",
          anyRegion: "Beliebige Region",
          any: "Beliebig",
          yes: "Ja",
          required: "Erforderlich",
          off: "Aus",
          rankedResults: "Sortierte Ergebnisse",
          providersRanked: (count: number) =>
            `${count} ${count === 1 ? "Anbieter" : "Anbieter"} sortiert`,
          rankingDescription:
            "Sortiert nach Relevanz, realem Ergebnis, Tempo, Einfachheit und Beliebtheit.",
          topLead: "#1",
          monthly: "Monatlich",
          totalRepayable: "Gesamt zurückzuzahlen",
          interestPaid: "Gezahlte Zinsen",
          usingYourRate: "Mit deiner Zinsannahme",
          estimatedFrom: "Geschätzt von",
          updatingLiveComparison: "Live-Vergleich wird aktualisiert…",
          marketDataUnavailable: "Marktdaten vorübergehend nicht verfügbar",
          marketDataDescription:
            "Versuche ein anderes Währungspaar oder lade gleich neu. Payn zeigt nur eine sortierte Liste, wenn ein echter Marktkurs vorliegt.",
          noProvidersTitle: "Noch keine lokalen Anbieter für diesen Markt",
          noProvidersDescription:
            "Payn baut diesen Markt gerade aus. Europäische Anbieter, die hier verfügbar sind, findest du über ganz Europa.",
          checkDetails: "Details ansehen",
          goToProvider: "Zum Anbieter",
          compare: "Vergleichen",
          sideBySideTitle: "Anbieter direkt nebeneinander",
          sideBySideDescription:
            "Vergleiche Anbieter innerhalb derselben Kategorie, ohne aktuelle Eingaben, Filter oder Merkliste zu verlieren.",
          howRankingWorks: "So funktioniert das Ranking",
          whatChangesTitle: "Was das Ranking verändert",
          whatChangesBody:
            "Eingabeänderungen berechnen Ergebnis, Tempo und Passung sofort neu. Betrag, Laufzeit, Land, Korridor, Währungspaar, Versicherungsart, Deckung, Selbstbehalt und Region beeinflussen die Liste.",
          nextStepTitle: "Was du als Nächstes tun solltest",
          nextStepBody:
            "Öffne erst die Details in Payn, um die Abwägungen zu verstehen. Nutze den Anbieter-Link erst, wenn du außerhalb des Produkts weitermachen willst.",
          currentLeadTradeoff: "Aktuelle Führungs-Abwägung",
          estimatedResult:
            "Geschätztes Ergebnis. Endbetrag kann abweichen. Exakten Kurs bitte beim Anbieter prüfen.",
          insuranceDisclaimer:
            "Nur geschätzter Preis und Deckung. Endgültige Preise, Ausschlüsse und Eignung bleiben beim Anbieter.",
          generalDisclaimer:
            "Payn vergleicht veröffentlichte Anbieter-Konditionen und geschätzte Kosten. Endgültige Eignung und Preise bleiben beim Anbieter.",
        }
      : {
          loansTitle: "Compare consumer & personal loans — live",
          transfersTitle: "Enter the transfer and compare what the recipient gets",
          exchangeTitle: "Enter the exchange and compare the delivered rate",
          insuranceTitle: "Choose the protection type first",
          loansDescription:
            `Digital lenders, banks, and fintechs offering consumer loans, personal loans, and small-ticket financing for ${marketLabel.toLowerCase()} — ranked by real monthly cost. Change amount, duration, rate assumption, income, employment, or purpose and results update instantly.`,
          transfersDescription:
            `Change the corridor, amount, or currency pair and the provider ranking updates for ${marketLabel.toLowerCase()} from the live quote and each fee model.`,
          exchangeDescription:
            `Payn uses the live market quote plus provider markups and fees to keep one ranked exchange list for ${marketLabel.toLowerCase()}.`,
          insuranceDescription:
            `Choose the protection type you actually need, then filter by coverage, region, deductible, trip duration, and visa fit before comparing providers in ${marketLabel.toLowerCase()}.`,
          backToDiscover: "Back to Discover",
          amount: "Amount",
          durationMonths: "Duration (months)",
          country: "Country",
          purpose: "Purpose",
          interestRateOptional: "Interest rate (optional)",
          useTopProviderEstimate: "Use top-provider estimate",
          incomeRangeOptional: "Income range (optional)",
          employmentStatusOptional: "Employment status (optional)",
          fromCountry: "From country",
          toCountry: "To country",
          currency: "Currency",
          fromCurrency: "From currency",
          toCurrency: "To currency",
          chooseCountry: "Choose country",
          protectionType: "Protection type",
          termLength: "Term length",
          duration: "Duration",
          sumInsured: "Sum insured",
          liabilityTarget: "Liability target",
          deviceValue: "Device value",
          coverageAmount: "Coverage amount",
          maxTripPrice: "Max trip price",
          maxMonthlyPremium: "Max monthly premium",
          monthlyPremium: "Monthly premium",
          medicalCoverLevel: "Medical cover level",
          medicalCoverage: "Medical coverage",
          deductibleTier: "Deductible tier",
          deductible: "Deductible",
          coverageRegion: "Coverage region",
          region: "Region",
          tripStyle: "Trip style",
          activity: "Activity",
          visaCompliant: "Visa compliant",
          anyRegion: "Any region",
          any: "Any",
          yes: "Yes",
          required: "Required",
          off: "Off",
          rankedResults: "Ranked results",
          providersRanked: (count: number) =>
            `${count} ${count === 1 ? "provider" : "providers"} ranked`,
          rankingDescription:
            "Sorted by relevance, real outcome, speed, simplicity, and popularity.",
          topLead: "#1",
          monthly: "Monthly",
          totalRepayable: "Total repayable",
          interestPaid: "Interest paid",
          usingYourRate: "Using your rate assumption",
          estimatedFrom: "Estimated from",
          updatingLiveComparison: "Updating live comparison…",
          marketDataUnavailable: "Market data temporarily unavailable",
          marketDataDescription:
            "Try another currency pair or refresh shortly. Payn will only show a ranked list when it has a real market quote.",
          noProvidersTitle: "No local providers for this market yet",
          noProvidersDescription:
            "Payn is expanding coverage here. Pan-European providers that work in your country are available via All Europe.",
          checkDetails: "Check details",
          goToProvider: "Go to provider",
          compare: "Compare",
          sideBySideTitle: "Side-by-side provider view",
          sideBySideDescription:
            "Compare providers inside the same category without losing the current inputs, filters, or shortlist.",
          howRankingWorks: "How ranking works",
          whatChangesTitle: "What changes the ranking",
          whatChangesBody:
            "Input changes immediately recalculate outcome, speed, and fit. Amount, term, country, corridor, currency pair, insurance type, coverage, deductible, and region all affect the list.",
          nextStepTitle: "What to do next",
          nextStepBody:
            "Open details to understand tradeoffs inside Payn, then use the provider link when you are ready to continue outside the product.",
          currentLeadTradeoff: "Current lead tradeoff",
          estimatedResult:
            "Estimated result. Final amount may vary. Check provider for exact rate.",
          insuranceDisclaimer:
            "Estimated price and cover only. Final pricing, exclusions, and eligibility stay with the provider.",
          generalDisclaimer:
            "Payn compares published provider terms and estimated costs. Final eligibility and pricing stay with the provider.",
        };
  const localizedLoanPurposeOptions = loanPurposeOptions.map((option) => ({
    ...option,
    label:
      locale === "de"
        ? {
            general: "Allgemein",
            personal: "Persönlich",
            car: "Auto",
            device: "Gerät / Elektronik",
          }[option.value]
        : option.label,
  }));
  const localizedLoanIncomeRangeOptions = loanIncomeRangeOptions.map((option) => ({
    ...option,
    label:
      locale === "de"
        ? {
            not_shared: "Nicht angegeben",
            under_2000: "Unter 2.000 €",
            "2000_3500": "2.000 € - 3.500 €",
            "3500_5000": "3.500 € - 5.000 €",
            "5000_plus": "5.000 €+",
          }[option.value]
        : option.label,
  }));
  const localizedLoanEmploymentOptions = loanEmploymentOptions.map((option) => ({
    ...option,
    label:
      locale === "de"
        ? {
            not_shared: "Nicht angegeben",
            salaried: "Angestellt",
            self_employed: "Selbstständig",
            part_time: "Teilzeit",
            student: "Student",
            retired: "Rentner",
          }[option.value]
        : option.label,
  }));
  const defaultCountry = useMemo<CountryValue>(() => {
    return (
      getValidCountryValue(countryOptions, preferredCountry) ||
      getValidCountryValue(countryOptions, profile?.home_country)
    );
  }, [countryOptions, preferredCountry, profile?.home_country]);
  const workspaceStateKey = useMemo(() => `product-category:${category}`, [category]);
  const defaultWorkspaceState = useMemo(
    () => getDefaultCategoryWorkspaceState(category, defaultCountry),
    [category, defaultCountry],
  );
  const [workspaceStateLoaded, setWorkspaceStateLoaded] = useState(false);
  const lastPreferredCountryRef = useRef(defaultCountry);

  const [amount, setAmount] = useState(defaultWorkspaceState.amount);
  const [duration, setDuration] = useState(defaultWorkspaceState.duration);
  const [country, setCountry] = useState<CountryValue>(defaultWorkspaceState.country);
  const [purpose, setPurpose] = useState<LoanPurpose>(defaultWorkspaceState.purpose);
  const [interestRate, setInterestRate] = useState(defaultWorkspaceState.interestRate);
  const [incomeRange, setIncomeRange] = useState<LoanIncomeRange>(defaultWorkspaceState.incomeRange);
  const [employmentStatus, setEmploymentStatus] = useState<LoanEmploymentStatus>(
    defaultWorkspaceState.employmentStatus,
  );
  const [fromCountry, setFromCountry] = useState<CountryValue>(defaultWorkspaceState.fromCountry);
  const [toCountry, setToCountry] = useState<CountryValue>(defaultWorkspaceState.toCountry);
  const [fromCurrency, setFromCurrency] = useState(defaultWorkspaceState.fromCurrency);
  const [toCurrency, setToCurrency] = useState(defaultWorkspaceState.toCurrency);
  const [insuranceType, setInsuranceType] = useState<InsuranceSelection>(defaultWorkspaceState.insuranceType);
  const [coverageAmount, setCoverageAmount] = useState(defaultWorkspaceState.coverageAmount);
  const [maxPrice, setMaxPrice] = useState(defaultWorkspaceState.maxPrice);
  const [minMedicalCoverage, setMinMedicalCoverage] = useState(defaultWorkspaceState.minMedicalCoverage);
  const [maxDeductible, setMaxDeductible] = useState(defaultWorkspaceState.maxDeductible);
  const [regionFilter, setRegionFilter] = useState<InsuranceRegionFilter>(defaultWorkspaceState.regionFilter);
  const [activityFilter, setActivityFilter] = useState<InsuranceActivityFilter>(defaultWorkspaceState.activityFilter);
  const [visaCompliantOnly, setVisaCompliantOnly] = useState(defaultWorkspaceState.visaCompliantOnly);
  const [compareSelection, setCompareSelection] = useState<string[]>(defaultWorkspaceState.compareSelection);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quote, setQuote] = useState<FxQuotePayload | null>(null);
  // FX categories must never paint the empty "market data unavailable" state on
  // first load: seed the loading flag so the skeleton shows until the seeded
  // EUR→USD / EUR→GBP quote (or a genuine failure) resolves on mount.
  const isFxCategory = category === "transfers" || category === "exchange";
  const [quoteLoading, setQuoteLoading] = useState(isFxCategory);
  // Distinguishes a real fetch failure/outage from the pre-fetch initial state,
  // since `quote === null` alone covers both. Only `true` keeps the genuine
  // "market data temporarily unavailable" copy reachable.
  const [quoteFailed, setQuoteFailed] = useState(false);
  const updateCountry = (nextCountry: CountryValue) => {
    setCountry(nextCountry);
    onCountryChange?.(nextCountry);
  };
  const updateFromCountry = (nextCountry: CountryValue) => {
    setFromCountry(nextCountry);
    onCountryChange?.(nextCountry);
  };

  const availableInsuranceTypes = useMemo(
    () => insuranceTypes.filter((type) => offers.some((offer) => getInsuranceType(offer) === type)),
    [offers],
  );

  useEffect(() => {
    const persistedState = readPersistedProductWorkspaceState(
      workspaceStateKey,
      defaultWorkspaceState,
      userId,
    );

    setAmount(persistedState.amount);
    setDuration(persistedState.duration);
    setCountry(persistedState.country);
    setPurpose(persistedState.purpose);
    setInterestRate(persistedState.interestRate);
    setIncomeRange(persistedState.incomeRange);
    setEmploymentStatus(persistedState.employmentStatus);
    setFromCountry(persistedState.fromCountry);
    setToCountry(persistedState.toCountry);
    setFromCurrency(persistedState.fromCurrency);
    setToCurrency(persistedState.toCurrency);
    setInsuranceType(persistedState.insuranceType);
    setCoverageAmount(persistedState.coverageAmount);
    setMaxPrice(persistedState.maxPrice);
    setMinMedicalCoverage(persistedState.minMedicalCoverage);
    setMaxDeductible(persistedState.maxDeductible);
    setRegionFilter(persistedState.regionFilter);
    setActivityFilter(persistedState.activityFilter);
    setVisaCompliantOnly(persistedState.visaCompliantOnly);
    setCompareSelection(persistedState.compareSelection);
    setWorkspaceStateLoaded(true);
  }, [defaultWorkspaceState, userId, workspaceStateKey]);

  useEffect(() => {
    if (!workspaceStateLoaded || !defaultCountry) {
      return;
    }

    if (lastPreferredCountryRef.current === defaultCountry) {
      return;
    }

    lastPreferredCountryRef.current = defaultCountry;
    setCountry(defaultCountry);
    setFromCountry(defaultCountry);
  }, [defaultCountry, workspaceStateLoaded]);

  useEffect(() => {
    if (!workspaceStateLoaded) {
      return;
    }

    writePersistedProductWorkspaceState(
      workspaceStateKey,
      {
        amount,
        duration,
        country,
        purpose,
        interestRate,
        incomeRange,
        employmentStatus,
        fromCountry,
        toCountry,
        fromCurrency,
        toCurrency,
        insuranceType,
        coverageAmount,
        maxPrice,
        minMedicalCoverage,
        maxDeductible,
        regionFilter,
        activityFilter,
        visaCompliantOnly,
        compareSelection,
      },
      userId,
    );
  }, [
    activityFilter,
    amount,
    compareSelection,
    country,
    coverageAmount,
    duration,
    employmentStatus,
    fromCountry,
    fromCurrency,
    incomeRange,
    insuranceType,
    interestRate,
    maxDeductible,
    maxPrice,
    minMedicalCoverage,
    purpose,
    regionFilter,
    toCountry,
    toCurrency,
    userId,
    visaCompliantOnly,
    workspaceStateKey,
    workspaceStateLoaded,
  ]);

  useEffect(() => {
    if (category !== "insurance") {
      return;
    }

    if (!availableInsuranceTypes.includes(insuranceType)) {
      setInsuranceType(availableInsuranceTypes[0] ?? "travel");
    }
  }, [availableInsuranceTypes, category, insuranceType]);

  useEffect(() => {
    if (!isFxCategory) {
      setQuote(null);
      setQuoteLoading(false);
      setQuoteFailed(false);
      return;
    }

    if (fromCurrency === toCurrency) {
      setQuote(null);
      setQuoteLoading(false);
      setQuoteFailed(false);
      return;
    }

    const controller = new AbortController();
    setQuoteLoading(true);
    setQuoteFailed(false);

    void (async () => {
      try {
        const response = await fetch(`/api/v1/fx-quote?from=${fromCurrency}&to=${toCurrency}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Quote request failed");
        }

        const payload = (await response.json()) as FxQuotePayload;
        setQuote(payload);
        // A genuine outage can still surface: getFxQuote returns unavailable:true
        // when every live source and the cached-rate fallback are exhausted.
        setQuoteFailed(payload.unavailable);
      } catch {
        if (!controller.signal.aborted) {
          setQuote(null);
          setQuoteFailed(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [isFxCategory, fromCurrency, toCurrency]);

  const insightMap = useMemo(() => new Map(insights.map((item) => [item.offer.id, item])), [insights]);
  const amountValue = Number.parseFloat(amount) || 0;
  const durationValue = Number.parseInt(duration, 10) || 0;
  const interestRateValue = Number.parseFloat(interestRate);
  const coverageAmountValue = Number.parseFloat(coverageAmount) || 0;
  const maxPriceValue = Number.parseFloat(maxPrice) || Number.POSITIVE_INFINITY;
  const minMedicalCoverageValue = Number.parseFloat(minMedicalCoverage) || 0;
  const maxDeductibleValue = Number.parseFloat(maxDeductible) || Number.POSITIVE_INFINITY;

  const scopedOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (category === "insurance") {
        const type = getInsuranceType(offer);
        if (type !== insuranceType) {
          return false;
        }

        if (!matchesCountry(offer, country)) {
          return false;
        }

        if (coverageAmountValue > 0 && getInsuranceCoverageAmount(offer) < coverageAmountValue) {
          return false;
        }

        if (getInsurancePriceValue(offer) > maxPriceValue) {
          return false;
        }

        if (getInsuranceMedicalCoverage(offer) < minMedicalCoverageValue) {
          return false;
        }

        if (getInsuranceDeductible(offer) > maxDeductibleValue) {
          return false;
        }

        if (insuranceUsesDuration(type) && durationValue > 0 && getInsuranceDurationValue(offer, type) < durationValue) {
          return false;
        }

        if (insuranceUsesRegion(type) && regionFilter !== "all" && offer.attributes?.regionCoverage !== regionFilter) {
          return false;
        }

        if (insuranceUsesActivity(type) && activityFilter !== "all" && offer.attributes?.activityLevel !== activityFilter) {
          return false;
        }

        if (insuranceUsesVisa(type) && visaCompliantOnly && !offer.attributes?.visaCompliant) {
          return false;
        }

        return true;
      }

      if (category === "transfers") {
        return matchesCountry(offer, fromCountry) && Boolean(getOfferCalculatorProfile(offer));
      }

      if (category === "exchange") {
        return matchesCountry(offer, country) && Boolean(getOfferCalculatorProfile(offer));
      }

      return matchesCountry(offer, country);
    });
  }, [
    activityFilter,
    category,
    country,
    coverageAmountValue,
    durationValue,
    fromCountry,
    insuranceType,
    maxDeductibleValue,
    maxPriceValue,
    minMedicalCoverageValue,
    offers,
    regionFilter,
    visaCompliantOnly,
  ]);

  const rankedResults = useMemo(() => {
    const baseRows: Array<
      Omit<RankedResult, "score" | "tags"> & {
        rawOutcomeValue: number;
        outcomeDirection: "higher" | "lower";
      }
    > = [];

    if (category === "transfers" || category === "exchange") {
      if (!quote || quote.unavailable || !Number.isFinite(quote.rate) || quote.rate <= 0) {
        return [] as RankedResult[];
      }

      for (const offer of scopedOffers) {
        const result = getOfferCalculatorResult({
          offer,
          amount: amountValue,
          fromCurrency: fromCurrency as (typeof supportedFxCurrencies)[number],
          toCurrency: toCurrency as (typeof supportedFxCurrencies)[number],
          baseRate: quote.rate,
        });

        if (!result) {
          continue;
        }

        const popularity = getPopularityScore(offer, insightMap.get(offer.id));
        const simplicity = clampPercent(
          100 - result.feePercent * 14 - result.fixedFee * 2 + (result.speedHours <= 6 ? 10 : 0),
        );
        const outcomeValue = result.finalAmount;
        const outcomeScore = outcomeValue;

        baseRows.push({
          offer,
          primaryLabel: category === "transfers" ? (locale === "de" ? "Empfänger erhält" : "User gets") : locale === "de" ? "Du erhältst" : "You get",
          primaryValue: formatCurrency(locale, result.finalAmount, toCurrency),
          summary:
            category === "transfers"
              ? locale === "de"
                ? "Berechnet aus dem aktuellen Marktkurs, dem Gebührenprofil des Anbieters und der Auszahlungsgeschwindigkeit."
                : "Calculated from the current market quote, provider fee profile, and payout speed."
              : locale === "de"
                ? "Berechnet aus dem aktuellen Marktkurs, dem Aufschlag des Anbieters und dem Umtausch-Gebührenprofil."
                : "Calculated from the current market quote, provider markup, and conversion fee profile.",
          metrics: [
            { label: "Fee", value: formatCurrency(locale, result.totalFeeSource, fromCurrency) },
            { label: "Speed", value: getCalculatorSpeedLabel(result.speedHours, locale) },
            { label: "Rate", value: result.providerRate.toFixed(4) },
            { label: "Market", value: quote.rate.toFixed(4) },
          ],
          why:
            category === "transfers"
              ? locale === "de"
                ? `Es liefert nach Gebühren das stärkste Empfänger-Ergebnis für ${fromCurrency} nach ${toCurrency}.`
                : `It gives the strongest recipient outcome for ${fromCurrency} to ${toCurrency} after fees.`
              : locale === "de"
                ? `Es hält das effektive Umtausch-Ergebnis für ${fromCurrency} nach ${toCurrency} nach Aufschlägen und Gebühren am stärksten.`
                : `It keeps the delivered conversion result strongest for ${fromCurrency} to ${toCurrency} after markups and fees.`,
          rawOutcomeValue: outcomeScore,
          outcomeDirection: "higher",
          popularityValue: popularity,
          feeValue: result.totalFeeSource,
          speedValue: result.speedHours,
          flexibilityValue: undefined,
        });
      }
    } else if (category === "loans") {
      for (const offer of scopedOffers) {
        const amountRange = getAvailableAmountRange(offer);
        const termRange = getTermRange(offer);
        if (amountValue < amountRange.min || amountValue > amountRange.max) continue;
        if (durationValue < termRange.min || durationValue > termRange.max) continue;

        const apr = getLoanApr(offer);
        const monthlyPayment = getLoanMonthlyPayment(amountValue, apr, durationValue);
        const text = getOfferText(offer);
        const popularity = getPopularityScore(offer, insightMap.get(offer.id));
        const purposeBoost = getLoanPurposeBoost(text, purpose);
        const incomeBoost = getLoanIncomeBoost(offer, incomeRange);
        const employmentBoost = getLoanEmploymentBoost(offer, employmentStatus);

        baseRows.push({
          offer,
          primaryLabel: copy.monthly,
          primaryValue: formatCurrency(locale, monthlyPayment),
          summary: normalizeDisplayText(offer.subtitle),
          metrics: [
            { label: "APR", value: normalizeDisplayText(getMetricValue(offer, ["APR"]) ?? "—") },
            { label: "Amount", value: normalizeDisplayText(getMetricValue(offer, ["Amount"]) ?? "—") },
            { label: "Approval", value: getLoanApprovalLabel(offer, locale) },
            { label: "Term", value: `${durationValue} ${locale === "de" ? "Monate" : "months"}` },
          ],
          why:
            locale === "de"
              ? "Es verbindet niedrigere Monatskosten mit einem klareren Zusagepfad für den eingegebenen Betrag und die Laufzeit."
              : "It balances lower monthly cost with a cleaner approval path for the amount and term you entered.",
          rawOutcomeValue: monthlyPayment,
          outcomeDirection: "lower",
          popularityValue: popularity + purposeBoost + incomeBoost + employmentBoost,
          feeValue: apr,
          speedValue: inferSpeedValue(offer),
          flexibilityValue: getSimplicityScore(offer),
        });
      }
    } else if (category === "insurance") {
      for (const offer of scopedOffers) {
        const type = getInsuranceType(offer);
        if (!type) continue;

        const priceValue = getInsurancePriceValue(offer);
        const popularity = getPopularityScore(offer, insightMap.get(offer.id));
        const flexibility = getInsuranceFlexibility(offer);
        const regionCoverage = normalizeDisplayText(
          getMetricValue(offer, ["Region coverage", "Countries covered", "Worldwide protection"]) ??
            copy.checkDetails,
        );
        const currency = offer.metrics.some((metric) => metric.value.includes("USD")) ? "USD" : "EUR";

        baseRows.push({
          offer,
          primaryLabel:
            type === "travel" || type === "nomad"
              ? locale === "de"
                ? "Geschätzter Preis"
                : "Estimated price"
              : type === "device"
                ? locale === "de"
                  ? "Monatlicher Schutz"
                  : "Monthly cover"
                : copy.monthlyPremium,
          primaryValue: Number.isFinite(priceValue)
            ? formatCurrency(locale, priceValue, currency)
            : normalizeDisplayText(
                getMetricValue(offer, ["Price", "Monthly premium"]) ?? copy.checkDetails,
              ),
          summary: normalizeDisplayText(offer.subtitle),
          metrics: getInsuranceMetrics(offer, type, locale),
          why:
            locale === "de"
              ? `Es bleibt nur innerhalb von ${getInsuranceTypeLabel(type, locale).toLowerCase()} und bringt für ${regionCoverage.toLowerCase()} die stärkere Balance aus Schutz, Preis und Flexibilität.`
              : `It stays inside ${getInsuranceTypeLabel(type, locale).toLowerCase()} only, with a stronger balance of cover, price, and flexibility for ${regionCoverage.toLowerCase()}.`,
          rawOutcomeValue: Number.isFinite(priceValue) ? priceValue : 999,
          outcomeDirection: "lower",
          popularityValue: popularity,
          feeValue: Number.isFinite(priceValue) ? priceValue : undefined,
          speedValue: inferSpeedValue(offer),
          flexibilityValue: flexibility,
        });
      }
    } else {
      for (const offer of scopedOffers) {
        const popularity = getPopularityScore(offer, insightMap.get(offer.id));
        baseRows.push({
          offer,
          primaryLabel: locale === "de" ? "Anbieter" : "Provider",
          primaryValue: normalizeDisplayText(offer.title),
          summary: normalizeDisplayText(offer.subtitle),
          metrics: offer.metrics.slice(0, 4).map((m) => ({
            label: m.label,
            value: normalizeDisplayText(m.value),
          })),
          why:
            locale === "de"
              ? `${offer.providerName} ist einer der meistgesuchten Anbieter in dieser Kategorie für Ihren Markt.`
              : `${offer.providerName} is one of the most-matched providers in this category for your market.`,
          rawOutcomeValue: offer.affiliatePriorityScore ?? 0.5,
          outcomeDirection: "higher",
          popularityValue: popularity,
          speedValue: inferSpeedValue(offer),
          flexibilityValue: getSimplicityScore(offer),
        });
      }
    }

    if (baseRows.length === 0) {
      return [] as RankedResult[];
    }

    const outcomeValues = baseRows.map((row) => row.rawOutcomeValue);
    const outcomeMin = Math.min(...outcomeValues);
    const outcomeMax = Math.max(...outcomeValues);
    const providerCounts = new Map<string, number>();

    for (const row of baseRows) {
      providerCounts.set(row.offer.providerName, (providerCounts.get(row.offer.providerName) ?? 0) + 1);
    }

    const scoredRows = baseRows
      .map((row) => {
        const popularityScore = clampPercent(row.popularityValue);
        const countryFitScore =
          category === "transfers"
            ? getCountryFitScore(row.offer, fromCountry)
            : getCountryFitScore(row.offer, country);
        const speedScore = normalizeScore(row.speedValue ?? 24, 0.1, 72, "lower");
        const simplicityScore = clampPercent(row.flexibilityValue ?? getSimplicityScore(row.offer));
        const baseRelevanceScore = clampPercent(
          countryFitScore * 0.52 +
            speedScore * 0.22 +
            simplicityScore * 0.14 +
            (category === "loans"
              ? getLoanPurposeBoost(getOfferText(row.offer), purpose) +
                getLoanIncomeBoost(row.offer, incomeRange) +
                getLoanEmploymentBoost(row.offer, employmentStatus)
              : 0),
        );
        const diversityBoost = clampPercent(
          86 -
            Math.max(0, (providerCounts.get(row.offer.providerName) ?? 1) - 1) * 18 +
            ((row.offer.providerName.charCodeAt(0) + row.offer.id.length) % 9),
        );
        const relevanceScore = clampPercent(
          category === "insurance" ? baseRelevanceScore + 6 : baseRelevanceScore,
        );
        const outcomeScore = normalizeScore(
          row.rawOutcomeValue,
          outcomeMin,
          outcomeMax,
          row.outcomeDirection,
        );
        const score =
          relevanceScore * 0.5 +
          outcomeScore * 0.2 +
          popularityScore * 0.2 +
          diversityBoost * 0.1;

        return {
          ...row,
          score,
          tags: [],
        } satisfies RankedResult;
      })
      .sort((left, right) => right.score - left.score);

    const uniqueScoredRows: RankedResult[] = [];
    const seenProviders = new Set<string>();

    for (const row of scoredRows) {
      if (seenProviders.has(row.offer.providerName)) {
        continue;
      }

      seenProviders.add(row.offer.providerName);
      uniqueScoredRows.push(row);
    }

    const cheapestOfferId =
      [...uniqueScoredRows].sort((left, right) => (left.feeValue ?? Infinity) - (right.feeValue ?? Infinity))[0]?.offer.id ?? null;
    const fastestOfferId =
      [...uniqueScoredRows].sort((left, right) => (left.speedValue ?? Infinity) - (right.speedValue ?? Infinity))[0]?.offer.id ?? null;
    const popularOfferId =
      [...uniqueScoredRows].sort((left, right) => right.popularityValue - left.popularityValue)[0]?.offer.id ?? null;
    const flexibleOfferId =
      category === "insurance"
        ? [...uniqueScoredRows].sort((left, right) => (right.flexibilityValue ?? 0) - (left.flexibilityValue ?? 0))[0]?.offer.id ?? null
        : null;
    const topOfferId = uniqueScoredRows[0]?.offer.id ?? null;

    return uniqueScoredRows.map((row) => ({
      ...row,
      tags: decorateTags({
        row,
        cheapestOfferId,
        fastestOfferId,
        popularOfferId,
        topOfferId,
        flexibleOfferId,
      }),
    }));
  }, [
    amountValue,
    category,
    country,
    durationValue,
    fromCurrency,
    insightMap,
    insuranceType,
    locale,
    maxDeductibleValue,
    minMedicalCoverageValue,
    employmentStatus,
    incomeRange,
    purpose,
    quote,
    scopedOffers,
    toCurrency,
  ]);

  useEffect(() => {
    setCompareSelection((current) => current.filter((id) => rankedResults.some((row) => row.offer.id === id)));
  }, [rankedResults]);

  const selectedCompareRows = rankedResults
    .filter((row) => compareSelection.includes(row.offer.id))
    .slice(0, 3);
  const selectedCompareOffers = selectedCompareRows.map((row) => row.offer);

  const topResult = rankedResults[0] ?? null;
  const loanSummary = (() => {
    if (category !== "loans" || !topResult || amountValue <= 0 || durationValue <= 0) return null;
    const apr =
      Number.isFinite(interestRateValue) && interestRateValue > 0
        ? interestRateValue
        : getLoanApr(topResult.offer);
    const monthly = getLoanMonthlyPayment(amountValue, apr, durationValue);
    const total = monthly * durationValue;
    const interest = total - amountValue;
    return {
      monthly,
      total,
      interest,
      apr,
      source:
        Number.isFinite(interestRateValue) && interestRateValue > 0
          ? copy.usingYourRate
          : `${copy.estimatedFrom} ${topResult.offer.providerName}`,
    };
  })();
  const comparePrimaryMetricLabel = category === "insurance" ? undefined : selectedCompareRows[0]?.primaryLabel;
  const compareEntries = useMemo<ProductCompareEntry[]>(
    () =>
      selectedCompareRows.map((row) => {
        if (category === "loans") {
          const apr = getLoanApr(row.offer);
          const monthly = getLoanMonthlyPayment(amountValue, apr, durationValue);
          const total = monthly * durationValue;
          const interest = total - amountValue;

          return {
            offer: row.offer,
            primaryMetricValue: row.primaryValue,
            fees: formatCurrency(locale, interest),
            speed: getMetricDisplayValue(row.metrics, ["Approval"]),
            rateOrApr: getMetricDisplayValue(row.metrics, ["APR"]),
            keyBenefits:
              row.tags.map((tag) => translateUiToken(locale, tag.label)).join(" · ") ||
              row.offer.bestFor.slice(0, 2).map((item) => translateUiToken(locale, item)).join(" · "),
            bestFor: row.offer.bestFor.slice(0, 3).map((item) => translateUiToken(locale, item)).join(" · "),
          };
        }

        if (category === "transfers" || category === "exchange") {
          return {
            offer: row.offer,
            primaryMetricValue: row.primaryValue,
            fees: getMetricDisplayValue(row.metrics, ["Fee"]),
            speed: getMetricDisplayValue(row.metrics, ["Speed"]),
            rateOrApr: getMetricDisplayValue(row.metrics, ["Rate"]),
            keyBenefits:
              row.tags.map((tag) => translateUiToken(locale, tag.label)).join(" · ") ||
              row.offer.bestFor.slice(0, 2).map((item) => translateUiToken(locale, item)).join(" · "),
            bestFor: row.offer.bestFor.slice(0, 3).map((item) => translateUiToken(locale, item)).join(" · "),
          };
        }

        return {
          offer: row.offer,
          primaryMetricValue: row.primaryValue,
          fees: getMetricDisplayValue(row.metrics, ["Price", "Monthly premium", "Monthly cover"]),
          speed: row.offer.attributes?.instantActivation
            ? locale === "de"
              ? "Sofort aktiv"
              : "Instant activation"
            : translateUiToken(locale, "Check provider"),
          rateOrApr: getMetricDisplayValue(
            row.metrics,
            ["Medical cover", "Coverage", "Insured amount"],
            copy.checkDetails,
          ),
          keyBenefits:
            row.offer.attributes?.comparisonHighlights?.slice(0, 2).join(" · ") ||
            row.tags.map((tag) => translateUiToken(locale, tag.label)).join(" · ") ||
            row.offer.bestFor.slice(0, 2).map((item) => translateUiToken(locale, item)).join(" · "),
          bestFor: row.offer.bestFor.slice(0, 3).map((item) => translateUiToken(locale, item)).join(" · "),
        };
      }),
    [amountValue, category, durationValue, locale, selectedCompareRows],
  );
  // For FX categories show the skeleton — never the empty "unavailable" panel —
  // while a quote is in flight or hasn't resolved yet. The genuine-outage copy
  // is reachable only once a fetch actually fails (`quoteFailed`).
  const fxQuotePending = isFxCategory && fromCurrency !== toCurrency && !quoteFailed && !quote;
  const showSkeleton = quoteLoading || fxQuotePending;
  return (
    <div className="mx-auto grid max-w-[980px] gap-6">
      {(category === "loans" || category === "transfers" || category === "exchange" || category === "insurance") && (
      <section>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-ink-secondary hover:text-accent-emerald-strong"
        >
          <span>{dictionary.sidebarNav.refineResults}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {filtersOpen && (
          <div className="mt-4 rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {category === "loans" ? (
            <>
              <InputField label={copy.amount}>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className={amountFieldClassName()}
                  inputMode="decimal"
                />
              </InputField>
              <InputField label={copy.durationMonths}>
                <input
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className={fieldClassName()}
                  inputMode="numeric"
                />
              </InputField>
              <InputField label={copy.country}>
                <select
                  value={country}
                  onChange={(event) => updateCountry(event.target.value as CountryValue)}
                  className={fieldClassName()}
                >
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label={copy.purpose}>
                <select
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value as LoanPurpose)}
                  className={fieldClassName()}
                >
                  {localizedLoanPurposeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label={copy.interestRateOptional}>
                <input
                  value={interestRate}
                  onChange={(event) => setInterestRate(event.target.value)}
                  className={fieldClassName()}
                  inputMode="decimal"
                  placeholder={copy.useTopProviderEstimate}
                />
              </InputField>
              <InputField label={copy.incomeRangeOptional}>
                <select
                  value={incomeRange}
                  onChange={(event) => setIncomeRange(event.target.value as LoanIncomeRange)}
                  className={fieldClassName()}
                >
                  {localizedLoanIncomeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label={copy.employmentStatusOptional}>
                <select
                  value={employmentStatus}
                  onChange={(event) => setEmploymentStatus(event.target.value as LoanEmploymentStatus)}
                  className={fieldClassName()}
                >
                  {localizedLoanEmploymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
            </>
          ) : null}

          {category === "transfers" ? (
            <>
              <InputField label={copy.fromCountry}>
                <select value={fromCountry} onChange={(event) => updateFromCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label={copy.toCountry}>
                <select value={toCountry} onChange={(event) => setToCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label={copy.amount}>
                <input value={amount} onChange={(event) => setAmount(event.target.value)} className={amountFieldClassName()} inputMode="decimal" />
              </InputField>
              <InputField label={copy.currency}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
                  <CurrencySelect value={toCurrency} onChange={setToCurrency} />
                </div>
              </InputField>
            </>
          ) : null}

          {category === "exchange" ? (
            <>
              <InputField label={copy.amount}>
                <input value={amount} onChange={(event) => setAmount(event.target.value)} className={amountFieldClassName()} inputMode="decimal" />
              </InputField>
              <InputField label={copy.fromCurrency}>
                <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
              </InputField>
              <InputField label={copy.toCurrency}>
                <CurrencySelect value={toCurrency} onChange={setToCurrency} />
              </InputField>
              <InputField label={copy.country}>
                <select value={country} onChange={(event) => updateCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
            </>
          ) : null}

          {category === "insurance" ? (
            <>
              <div className="md:col-span-2 xl:col-span-4">
                <InputField label={copy.protectionType}>
                  <div className="flex flex-wrap gap-2">
                    {availableInsuranceTypes.map((type) => (
                      <CategoryPill
                        key={type}
                        label={getInsuranceTypeLabel(type, locale)}
                        active={insuranceType === type}
                        groupId="insurance-type"
                        onClick={() => setInsuranceType(type)}
                      />
                    ))}
                  </div>
                </InputField>
              </div>
              <InputField label={copy.country}>
                <select value={country} onChange={(event) => updateCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  <option value="">{copy.chooseCountry}</option>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              {insuranceUsesDuration(insuranceType) ? (
                <InputField label={insuranceType === "life" ? copy.termLength : copy.duration}>
                  <input value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClassName()} inputMode="numeric" />
                </InputField>
              ) : null}
              <InputField
                label={
                  insuranceType === "life"
                    ? copy.sumInsured
                    : insuranceType === "auto"
                      ? copy.liabilityTarget
                      : insuranceType === "device"
                        ? copy.deviceValue
                        : copy.coverageAmount
                }
              >
                <input
                  value={coverageAmount}
                  onChange={(event) => setCoverageAmount(event.target.value)}
                  className={fieldClassName()}
                  inputMode="numeric"
                />
              </InputField>
              <InputField label={insuranceType === "travel" || insuranceType === "nomad" ? copy.maxTripPrice : copy.maxMonthlyPremium}>
                <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className={fieldClassName()}>
                  <option value="40">{locale === "de" ? "Bis 40 €" : "Up to €40"}</option>
                  <option value="80">{locale === "de" ? "Bis 80 €" : "Up to €80"}</option>
                  <option value="150">{locale === "de" ? "Bis 150 €" : "Up to €150"}</option>
                  <option value="250">{locale === "de" ? "Bis 250 €" : "Up to €250"}</option>
                  <option value="9999">{locale === "de" ? "Jeder Preis" : "Any price"}</option>
                </select>
              </InputField>
              {insuranceType === "travel" || insuranceType === "nomad" || insuranceType === "health" ? (
                <InputField label={insuranceType === "health" ? copy.medicalCoverLevel : copy.medicalCoverage}>
                  <select value={minMedicalCoverage} onChange={(event) => setMinMedicalCoverage(event.target.value)} className={fieldClassName()}>
                    <option value="0">{copy.any}</option>
                    <option value="100000">€100k+</option>
                    <option value="500000">€500k+</option>
                    <option value="1000000">€1M+</option>
                    <option value="5000000">€5M+</option>
                  </select>
                </InputField>
              ) : null}
              <InputField label={insuranceType === "auto" ? copy.deductibleTier : copy.deductible}>
                <select value={maxDeductible} onChange={(event) => setMaxDeductible(event.target.value)} className={fieldClassName()}>
                  <option value="0">{locale === "de" ? "Kein Selbstbehalt" : "No deductible"}</option>
                  <option value="250">{locale === "de" ? "Bis 250 €" : "Up to €250"}</option>
                  <option value="500">{locale === "de" ? "Bis 500 €" : "Up to €500"}</option>
                  <option value="1000">{locale === "de" ? "Bis 1.000 €" : "Up to €1,000"}</option>
                  <option value="99999">{locale === "de" ? "Jeder Selbstbehalt" : "Any deductible"}</option>
                </select>
              </InputField>
              {insuranceUsesRegion(insuranceType) ? (
                <InputField label={insuranceType === "health" ? copy.coverageRegion : copy.region}>
                  <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value as InsuranceRegionFilter)} className={fieldClassName()}>
                    <option value="all">{copy.anyRegion}</option>
                    <option value="eu">EU</option>
                    <option value="regional">{locale === "de" ? "Regional" : "Regional"}</option>
                    <option value="worldwide">{locale === "de" ? "Weltweit" : "Worldwide"}</option>
                  </select>
                </InputField>
              ) : null}
              {insuranceUsesActivity(insuranceType) ? (
                <InputField label={insuranceType === "nomad" ? copy.tripStyle : copy.activity}>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "basic", "extreme"] as InsuranceActivityFilter[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setActivityFilter(item)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          activityFilter === item ? "bg-accent-emerald text-white" : "bg-[#F1F2F4] text-ink-secondary hover:text-ink"
                        }`}
                      >
                        {item === "all" ? copy.any : normalizeDisplayText(item)}
                      </button>
                    ))}
                  </div>
                </InputField>
              ) : null}
              {insuranceUsesVisa(insuranceType) ? (
                <InputField label={copy.visaCompliant}>
                  <button type="button" onClick={() => setVisaCompliantOnly((current) => !current)} className={`${fieldClassName()} flex items-center justify-between`}>
                    <span>{visaCompliantOnly ? copy.yes : copy.any}</span>
                    <Tag tone={visaCompliantOnly ? "success" : "muted"}>{visaCompliantOnly ? copy.required : copy.off}</Tag>
                  </button>
                </InputField>
              ) : null}
            </>
          ) : null}
            </div>
          </div>
        )}
      </section>
      )}

      <section className="rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-secondary">
            {rankedResults.length === 1
              ? `1 option in ${marketLabel}`
              : `${rankedResults.length} options in ${marketLabel}`}
          </p>
          {quote?.delayed && quote.sourceName === "Cached estimate" ? (
            <p className="text-[11px] text-amber-600">
              Indicative rates — live data temporarily unavailable.
            </p>
          ) : null}
        </div>

        {loanSummary ? (
          <div className="mt-5 rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{copy.monthly}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-ink">{formatCurrency(locale, loanSummary.monthly)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{copy.totalRepayable}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-ink">{formatCurrency(locale, loanSummary.total)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{copy.interestPaid}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-ink">{formatCurrency(locale, loanSummary.interest)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">APR</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-ink">{loanSummary.apr.toFixed(1)}%</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-secondary">{loanSummary.source}</p>
          </div>
        ) : null}

        {showSkeleton ? (
          <div className="mt-6 flex flex-col gap-3 sm:gap-4" aria-busy="true" aria-live="polite">
            <span className="sr-only">{copy.updatingLiveComparison}</span>
            {Array.from({ length: 4 }).map((_, index) => (
              <OfferRowSkeleton key={index} />
            ))}
          </div>
        ) : rankedResults.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-line bg-bg-surface p-6">
            <p className="text-base font-bold text-ink">
              {/* Outage copy only for a genuine quote failure; an FX category
                  with a valid quote but no matching providers reads as such. */}
              {isFxCategory && quoteFailed ? copy.marketDataUnavailable : copy.noProvidersTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {isFxCategory && quoteFailed ? copy.marketDataDescription : copy.noProvidersDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {country !== "all_europe" && (
                <button
                  type="button"
                  onClick={() => updateCountry("all_europe")}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-secondary transition-colors hover:border-accent-emerald/40 hover:text-accent-emerald-strong"
                >
                  {locale === "de" ? "Ganz Europa anzeigen" : "Show pan-European options →"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {rankedResults.map((row) => (
              <OfferRowAtlas
                key={row.offer.id}
                offer={row.offer}
                locale={locale}
                // Pass the unfiltered category market (`offers`), not the
                // user-filtered `rankedResults` — the Payn score must rank
                // against every card/loan in this country, not the 3 on the
                // screen after a slider change.
                marketContext={offers}
                compareSelected={compareSelection.includes(row.offer.id)}
                onToggleCompare={() =>
                  setCompareSelection((current) =>
                    current.includes(row.offer.id)
                      ? current.filter((id) => id !== row.offer.id)
                      : current.length >= 3
                        ? current
                        : [...current, row.offer.id],
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      {selectedCompareOffers.length >= 2 ? (
        category === "insurance" ? (
          <InsuranceCompareTable
            locale={locale}
            type={insuranceType}
            offers={selectedCompareOffers}
          />
        ) : (
          <ProductCompareTable
            locale={locale}
            entries={compareEntries}
            primaryMetricLabel={comparePrimaryMetricLabel}
            title={copy.sideBySideTitle}
            description={copy.sideBySideDescription}
            onRemove={(offerId) =>
              setCompareSelection((current) => current.filter((id) => id !== offerId))
            }
          />
        )
      ) : null}

    </div>
  );
}
