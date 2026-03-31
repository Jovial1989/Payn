"use client";
import type {
  MarketplaceCategory,
  MarketplaceInsuranceType,
  MarketplaceLocale,
  MarketplaceOffer,
} from "@payn/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import {
  DecisionResultRow,
  type DecisionResultMetric,
  type DecisionResultTag,
} from "@/components/decision-result-row";
import { DashboardEmptyState } from "@/components/dashboard-primitives";
import { InsuranceCompareTable } from "@/components/insurance-compare-table";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import type { DashboardOfferInsight } from "@/lib/dashboard";
import type { FxQuotePayload } from "@/lib/fx-quote";
import { supportedFxCurrencies } from "@/lib/fx-quote";
import { getDictionary, getMetricLabel } from "@/lib/i18n";
import {
  getMetricValue,
  getOfferTradeoff,
  normalizeDisplayText,
  parseMetricRange,
} from "@/lib/marketplace";
import {
  getCalculatorSpeedLabel,
  getOfferCalculatorProfile,
  getOfferCalculatorResult,
} from "@/lib/offer-calculator";
import {
  getResidenceCountryCode,
  residenceCountryOptions,
} from "@/lib/residence-countries";
import type { UserProfile } from "@/lib/types";

type CountryValue = string;
type InsuranceSelection = MarketplaceInsuranceType;
type InsuranceRegionFilter = "all" | "eu" | "worldwide" | "regional";
type InsuranceActivityFilter = "all" | "basic" | "extreme";

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
  { value: "general", label: "General / personal" },
  { value: "car", label: "Car" },
  { value: "device", label: "Device / electronics" },
  { value: "home", label: "Home improvement" },
  { value: "education", label: "Education" },
  { value: "consolidation", label: "Debt consolidation" },
  { value: "travel", label: "Travel" },
] as const;

const insuranceTypes: InsuranceSelection[] = ["travel", "health", "life", "auto", "nomad", "device"];

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
  if (country === "eu") {
    return true;
  }

  const codes = new Set(offer.countryCodes.map((code) => code.toUpperCase()));
  const selectedCode = getResidenceCountryCode(country);
  return codes.has(selectedCode) || codes.has("EU") || offer.attributes?.availability === "international";
}

function getCountryFitScore(offer: MarketplaceOffer, country: CountryValue) {
  if (country === "eu") {
    return 72;
  }

  const codes = new Set(offer.countryCodes.map((code) => code.toUpperCase()));
  const selectedCode = getResidenceCountryCode(country);

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

function getInsuranceTypeLabel(type: InsuranceSelection) {
  switch (type) {
    case "travel":
      return "Travel";
    case "health":
      return "Health";
    case "life":
      return "Life";
    case "auto":
      return "Auto";
    case "nomad":
      return "Nomad";
    case "device":
      return "Device";
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
  return "h-14 rounded-[20px] border border-[#EAEAEA] bg-white px-4 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(17,24,39,0.04)] outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-black/15 focus:bg-[#FCFCFD] focus:shadow-[0_14px_30px_rgba(17,24,39,0.08)]";
}

function amountFieldClassName() {
  return "h-14 rounded-[20px] border border-[#EAEAEA] bg-white px-4 text-[26px] font-bold tracking-[-0.05em] text-ink shadow-[0_8px_24px_rgba(17,24,39,0.04)] outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-black/15 focus:bg-[#FCFCFD] focus:shadow-[0_14px_30px_rgba(17,24,39,0.08)]";
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

function getCountryOptions() {
  return residenceCountryOptions.map((option) => ({
    value: option.value,
    label: option.label,
    flag: option.flag,
  }));
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

function GenericCompareTable({
  locale,
  category,
  offers,
}: {
  locale: MarketplaceLocale;
  category: MarketplaceCategory;
  offers: MarketplaceOffer[];
}) {
  const metricsByCategory: Partial<Record<MarketplaceCategory, string[]>> = {
    loans: ["APR", "Amount", "Term", "Approval"],
    transfers: ["Fee", "Speed", "Rate", "Market"],
    exchange: ["Fee", "Speed", "Rate", "Market"],
    cards: ["Annual fee", "FX fee", "Cashback", "ATM limit"],
  };

  const labels = metricsByCategory[category] ?? [];

  return (
    <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Compare selected</p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">Side-by-side view</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          Compare key metrics across selected providers to find the best fit for your needs.
        </p>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-[180px] border-b border-[#ECEDEF] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Feature
              </th>
              {offers.map((offer) => (
                <th
                  key={offer.id}
                  className="min-w-[180px] border-b border-[#ECEDEF] px-4 py-3 text-left text-sm font-semibold text-ink"
                >
                  <div className="flex items-center gap-2">
                    <ProviderLogo providerName={offer.providerName} size="sm" />
                    <span>{offer.providerName}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-[#ECEDEF] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Provider</td>
              {offers.map((offer) => (
                <td key={offer.id} className="border-b border-[#ECEDEF] px-4 py-3 text-sm font-semibold text-ink">
                  {offer.providerName}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-[#ECEDEF] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Best for</td>
              {offers.map((offer) => (
                <td key={offer.id} className="border-b border-[#ECEDEF] px-4 py-3 text-sm text-ink-secondary">
                  {offer.bestFor.slice(0, 2).join(", ")}
                </td>
              ))}
            </tr>
            {labels.map((label) => (
              <tr key={label}>
                <td className="border-b border-[#ECEDEF] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {label}
                </td>
                {offers.map((offer) => {
                  const value = normalizeDisplayText(getMetricValue(offer, [label]) ?? "—");
                  return (
                    <td key={offer.id} className="border-b border-[#ECEDEF] px-4 py-3 text-sm text-ink">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardCategoryWorkspace({
  locale,
  category,
  marketLabel,
  profile,
  offers,
  insights,
  discoverHref,
}: {
  locale: MarketplaceLocale;
  category: MarketplaceCategory;
  marketLabel: string;
  profile: UserProfile | null;
  offers: MarketplaceOffer[];
  insights: DashboardOfferInsight[];
  savedCount: number;
  discoverHref: string;
}) {
  const dictionary = getDictionary(locale);
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const defaultCountry = useMemo<CountryValue>(() => {
    const profileCountry = (profile?.home_country ?? "other_eu").toLowerCase();
    if (countryOptions.some((option) => option.value === profileCountry)) {
      return profileCountry;
    }
    return "other_eu";
  }, [countryOptions, profile?.home_country]);

  const [amount, setAmount] = useState(category === "loans" ? "5000" : "1000");
  const [duration, setDuration] = useState(category === "insurance" ? "30" : "24");
  const [country, setCountry] = useState<CountryValue>(defaultCountry);
  const [purpose, setPurpose] = useState<(typeof loanPurposeOptions)[number]["value"]>("general");
  const [fromCountry, setFromCountry] = useState<CountryValue>(defaultCountry);
  const [toCountry, setToCountry] = useState<CountryValue>(defaultCountry);
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState(category === "exchange" ? "USD" : "GBP");
  const [insuranceType, setInsuranceType] = useState<InsuranceSelection>("travel");
  const [coverageAmount, setCoverageAmount] = useState("500000");
  const [maxPrice, setMaxPrice] = useState("250");
  const [minMedicalCoverage, setMinMedicalCoverage] = useState("0");
  const [maxDeductible, setMaxDeductible] = useState("1000");
  const [regionFilter, setRegionFilter] = useState<InsuranceRegionFilter>("all");
  const [activityFilter, setActivityFilter] = useState<InsuranceActivityFilter>("all");
  const [visaCompliantOnly, setVisaCompliantOnly] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [quote, setQuote] = useState<FxQuotePayload | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const availableInsuranceTypes = useMemo(
    () => insuranceTypes.filter((type) => offers.some((offer) => getInsuranceType(offer) === type)),
    [offers],
  );

  useEffect(() => {
    if (category !== "insurance") {
      return;
    }

    if (!availableInsuranceTypes.includes(insuranceType)) {
      setInsuranceType(availableInsuranceTypes[0] ?? "travel");
    }
  }, [availableInsuranceTypes, category, insuranceType]);

  useEffect(() => {
    if (category !== "transfers" && category !== "exchange") {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    if (fromCurrency === toCurrency) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    const controller = new AbortController();
    setQuoteLoading(true);

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
  }, [category, fromCurrency, toCurrency]);

  const insightMap = useMemo(() => new Map(insights.map((item) => [item.offer.id, item])), [insights]);
  const amountValue = Number.parseFloat(amount) || 0;
  const durationValue = Number.parseInt(duration, 10) || 0;
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

        if (durationValue > 0 && getInsuranceTripDuration(offer) < durationValue) {
          return false;
        }

        if (regionFilter !== "all" && offer.attributes?.regionCoverage !== regionFilter) {
          return false;
        }

        if (activityFilter !== "all" && offer.attributes?.activityLevel !== activityFilter) {
          return false;
        }

        if (visaCompliantOnly && !offer.attributes?.visaCompliant) {
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
          primaryLabel: category === "transfers" ? "User gets" : "You get",
          primaryValue: formatCurrency(locale, result.finalAmount, toCurrency),
          summary:
            category === "transfers"
              ? "Calculated from the current market quote, provider fee profile, and payout speed."
              : "Calculated from the current market quote, provider markup, and conversion fee profile.",
          metrics: [
            { label: "Fee", value: formatCurrency(locale, result.totalFeeSource, fromCurrency) },
            { label: "Speed", value: getCalculatorSpeedLabel(result.speedHours) },
            { label: "Rate", value: result.providerRate.toFixed(4) },
            { label: "Market", value: quote.rate.toFixed(4) },
          ],
          why:
            category === "transfers"
              ? `It gives the strongest recipient outcome for ${fromCurrency} to ${toCurrency} after fees.`
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
        const purposeBoost = purpose !== "general" && text.includes(purpose) ? 12 : 0;

        baseRows.push({
          offer,
          primaryLabel: "Monthly",
          primaryValue: formatCurrency(locale, monthlyPayment),
          summary: normalizeDisplayText(offer.subtitle),
          metrics: [
            { label: "APR", value: normalizeDisplayText(getMetricValue(offer, ["APR"]) ?? "—") },
            { label: "Amount", value: normalizeDisplayText(getMetricValue(offer, ["Amount"]) ?? "—") },
            { label: "Approval", value: inferSpeedValue(offer) <= 1 ? "Minutes" : inferSpeedValue(offer) <= 24 ? "24h" : "1-2 days" },
            { label: "Term", value: `${durationValue} months` },
          ],
          why: "It balances lower monthly cost with a cleaner approval path for the amount and term you entered.",
          rawOutcomeValue: monthlyPayment,
          outcomeDirection: "lower",
          popularityValue: popularity + purposeBoost,
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
        const regionCoverage = normalizeDisplayText(getMetricValue(offer, ["Region coverage", "Countries covered", "Worldwide protection"]) ?? "Check details");
        const currency = offer.metrics.some((metric) => metric.value.includes("USD")) ? "USD" : "EUR";

        baseRows.push({
          offer,
          primaryLabel:
            type === "travel" || type === "nomad"
              ? "Estimated price"
              : type === "device"
                ? "Monthly cover"
                : "Monthly premium",
          primaryValue: Number.isFinite(priceValue)
            ? formatCurrency(locale, priceValue, currency)
            : normalizeDisplayText(getMetricValue(offer, ["Price", "Monthly premium"]) ?? "Check details"),
          summary: normalizeDisplayText(offer.subtitle),
          metrics: getInsuranceMetrics(offer, type, locale),
          why: `It stays inside ${getInsuranceTypeLabel(type).toLowerCase()} only, with a stronger balance of cover, price, and flexibility for ${regionCoverage.toLowerCase()}.`,
          rawOutcomeValue: Number.isFinite(priceValue) ? priceValue : 999,
          outcomeDirection: "lower",
          popularityValue: popularity,
          feeValue: Number.isFinite(priceValue) ? priceValue : undefined,
          speedValue: inferSpeedValue(offer),
          flexibilityValue: flexibility,
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
            (category === "loans" && purpose !== "general" && getOfferText(row.offer).includes(purpose) ? 12 : 0),
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
    purpose,
    quote,
    scopedOffers,
    toCurrency,
  ]);

  useEffect(() => {
    setCompareSelection((current) => current.filter((id) => rankedResults.some((row) => row.offer.id === id)));
  }, [rankedResults]);

  const selectedCompareOffers = rankedResults
    .filter((row) => compareSelection.includes(row.offer.id))
    .slice(0, 3)
    .map((row) => row.offer);

  const disclaimer =
    category === "transfers" || category === "exchange"
      ? "Estimated result. Final amount may vary. Check provider for exact rate."
      : category === "insurance"
        ? "Estimated price and cover only. Final pricing, exclusions, and eligibility stay with the provider."
        : "Payn compares published provider terms and estimated costs. Final eligibility and pricing stay with the provider.";

  const topResult = rankedResults[0] ?? null;
  const loanSummary = (() => {
    if (category !== "loans" || !topResult || amountValue <= 0 || durationValue <= 0) return null;
    const apr = getLoanApr(topResult.offer);
    const monthly = getLoanMonthlyPayment(amountValue, apr, durationValue);
    const total = monthly * durationValue;
    const interest = total - amountValue;
    return { monthly, total, interest, apr };
  })();
  const resultCountLabel = `${rankedResults.length} ${rankedResults.length === 1 ? "provider" : "providers"} ranked`;
  return (
    <div className="mx-auto grid max-w-[980px] gap-6">
      <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {dictionary.categories[category]}
                </p>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">
                  {category === "loans" && "Compare consumer & personal loans — live"}
                  {category === "transfers" && "Enter the transfer and compare what the recipient gets"}
                  {category === "exchange" && "Enter the exchange and compare the delivered rate"}
                  {category === "insurance" && "Choose the protection type first"}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
                  {category === "loans" &&
                    "Digital lenders, banks, and fintechs offering personal credit — ranked by real monthly cost. Change amount, duration, country, or purpose and results update instantly."}
                  {category === "transfers" &&
                    "Change the corridor, amount, or currency pair and the provider ranking updates from the live quote and each fee model."}
                  {category === "exchange" &&
                    "Payn uses the live market quote plus provider markups and fees to keep one ranked exchange list."}
                  {category === "insurance" &&
                    "Choose the protection type you actually need, then filter by coverage, region, deductible, trip duration, and visa fit before comparing providers."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={discoverHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                  Back to Discover
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {category === "loans" ? (
            <>
              <InputField label="Amount">
                <input value={amount} onChange={(event) => setAmount(event.target.value)} className={amountFieldClassName()} inputMode="decimal" />
              </InputField>
              <InputField label="Duration">
                <input value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClassName()} inputMode="numeric" />
              </InputField>
              <InputField label="Country">
                <select value={country} onChange={(event) => setCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="Purpose">
                <select value={purpose} onChange={(event) => setPurpose(event.target.value as (typeof loanPurposeOptions)[number]["value"])} className={fieldClassName()}>
                  {loanPurposeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
            </>
          ) : null}

          {category === "transfers" ? (
            <>
              <InputField label="From country">
                <select value={fromCountry} onChange={(event) => setFromCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="To country">
                <select value={toCountry} onChange={(event) => setToCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="Amount">
                <input value={amount} onChange={(event) => setAmount(event.target.value)} className={amountFieldClassName()} inputMode="decimal" />
              </InputField>
              <InputField label="Currency">
                <div className="grid grid-cols-2 gap-2">
                  <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
                  <CurrencySelect value={toCurrency} onChange={setToCurrency} />
                </div>
              </InputField>
            </>
          ) : null}

          {category === "exchange" ? (
            <>
              <InputField label="Amount">
                <input value={amount} onChange={(event) => setAmount(event.target.value)} className={amountFieldClassName()} inputMode="decimal" />
              </InputField>
              <InputField label="From currency">
                <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
              </InputField>
              <InputField label="To currency">
                <CurrencySelect value={toCurrency} onChange={setToCurrency} />
              </InputField>
              <InputField label="Market">
                <select value={country} onChange={(event) => setCountry(event.target.value as CountryValue)} className={fieldClassName()}>
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
                <InputField label="Protection type">
                  <div className="flex flex-wrap gap-2">
                    {availableInsuranceTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInsuranceType(type)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          insuranceType === type ? "bg-black text-white" : "bg-[#F1F2F4] text-ink-secondary hover:text-ink"
                        }`}
                      >
                        {getInsuranceTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </InputField>
              </div>
              <InputField label="Country">
                <select value={country} onChange={(event) => setCountry(event.target.value as CountryValue)} className={fieldClassName()}>
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="Duration">
                <input value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClassName()} inputMode="numeric" />
              </InputField>
              <InputField label="Coverage amount">
                <div className="grid gap-2 rounded-[18px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-3">
                  <input type="range" min="50000" max="5000000" step="50000" value={coverageAmount} onChange={(event) => setCoverageAmount(event.target.value)} />
                  <span className="text-sm font-semibold text-ink">{formatCurrency(locale, coverageAmountValue)}</span>
                </div>
              </InputField>
              <InputField label="Price range">
                <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className={fieldClassName()}>
                  <option value="40">Up to €40</option>
                  <option value="80">Up to €80</option>
                  <option value="150">Up to €150</option>
                  <option value="250">Up to €250</option>
                  <option value="9999">Any price</option>
                </select>
              </InputField>
              <InputField label="Medical coverage">
                <select value={minMedicalCoverage} onChange={(event) => setMinMedicalCoverage(event.target.value)} className={fieldClassName()}>
                  <option value="0">Any</option>
                  <option value="100000">€100k+</option>
                  <option value="500000">€500k+</option>
                  <option value="1000000">€1M+</option>
                  <option value="5000000">€5M+</option>
                </select>
              </InputField>
              <InputField label="Deductible">
                <select value={maxDeductible} onChange={(event) => setMaxDeductible(event.target.value)} className={fieldClassName()}>
                  <option value="0">No deductible</option>
                  <option value="250">Up to €250</option>
                  <option value="500">Up to €500</option>
                  <option value="1000">Up to €1,000</option>
                  <option value="99999">Any deductible</option>
                </select>
              </InputField>
              <InputField label="Region">
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value as InsuranceRegionFilter)} className={fieldClassName()}>
                  <option value="all">Any region</option>
                  <option value="eu">EU</option>
                  <option value="regional">Regional</option>
                  <option value="worldwide">Worldwide</option>
                </select>
              </InputField>
              <InputField label="Activity">
                <div className="flex gap-2">
                  {(["all", "basic", "extreme"] as InsuranceActivityFilter[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActivityFilter(item)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        activityFilter === item ? "bg-black text-white" : "bg-[#F1F2F4] text-ink-secondary hover:text-ink"
                      }`}
                    >
                      {item === "all" ? "Any" : normalizeDisplayText(item)}
                    </button>
                  ))}
                </div>
              </InputField>
              <InputField label="Visa compliant">
                <button type="button" onClick={() => setVisaCompliantOnly((current) => !current)} className={`${fieldClassName()} flex items-center justify-between`}>
                  <span>{visaCompliantOnly ? "Yes" : "Any"}</span>
                  <Tag tone={visaCompliantOnly ? "success" : "muted"}>{visaCompliantOnly ? "Required" : "Off"}</Tag>
                </button>
              </InputField>
            </>
          ) : null}
            </div>
      </section>

      <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Ranked results</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">{resultCountLabel}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
              Sorted by relevance, real outcome, speed, simplicity, and popularity. {disclaimer}
            </p>
          </div>

          {topResult ? (
            <div className="rounded-[18px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-3 text-sm text-ink-secondary">
              <span className="font-semibold text-ink">#1 {topResult.offer.providerName}</span>
              {" · "}
              {topResult.primaryLabel}: {topResult.primaryValue}
            </div>
          ) : null}
        </div>

        {loanSummary ? (
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] p-4 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Monthly</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-ink">{formatCurrency(locale, loanSummary.monthly)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Total cost</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-ink">{formatCurrency(locale, loanSummary.total)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Interest paid</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-ink">{formatCurrency(locale, loanSummary.interest)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Est. APR</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-ink">{loanSummary.apr.toFixed(1)}%</p>
            </div>
          </div>
        ) : null}

        {quoteLoading ? (
          <div className="mt-6 rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-10 text-center text-sm text-ink-secondary">
            Updating live comparison…
          </div>
        ) : rankedResults.length === 0 ? (
          <div className="mt-6">
            <DashboardEmptyState
              title={category === "transfers" || category === "exchange" ? "Market data temporarily unavailable" : "No providers match these inputs yet"}
              description={category === "transfers" || category === "exchange" ? "Try another currency pair or refresh shortly. Payn will only show a ranked list when it has a real market quote." : "Adjust the inputs and Payn will recalculate the provider list immediately."}
              href={discoverHref}
              cta="Back to Discover"
            />
          </div>
        ) : (
          <div className="mt-6 divide-y divide-[#ECEDEF]">
            {rankedResults.map((row, index) => (
              <DecisionResultRow
                key={row.offer.id}
                locale={locale}
                offer={row.offer}
                rank={index + 1}
                summary={row.summary}
                primaryLabel={row.primaryLabel}
                primaryValue={row.primaryValue}
                metrics={row.metrics}
                tags={row.tags}
                why={index === 0 ? row.why : undefined}
                detailsLabel="Check details"
                providerLabel="Go to provider"
                highlighted={index < 3}
                extraActions={
                  (
                    <button
                      type="button"
                      onClick={() =>
                        setCompareSelection((current) =>
                          current.includes(row.offer.id)
                            ? current.filter((id) => id !== row.offer.id)
                            : [...current, row.offer.id].slice(0, 3),
                        )
                      }
                      className={buttonStyles({
                        variant: compareSelection.includes(row.offer.id) ? "primary" : "ghost",
                        size: "sm",
                      })}
                    >
                      {compareSelection.includes(row.offer.id) ? "Comparing" : "Compare"}
                    </button>
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
          <GenericCompareTable
            locale={locale}
            category={category}
            offers={selectedCompareOffers}
          />
        )
      ) : null}

      <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">How ranking works</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[18px] bg-[#F7F7F8] px-4 py-4">
            <p className="text-sm font-semibold text-ink">What changes the ranking</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Input changes immediately recalculate outcome, speed, and fit. Amount, term, country, corridor, currency pair, insurance type, coverage, deductible, and region all affect the list.
            </p>
          </div>
          <div className="rounded-[18px] bg-[#F7F7F8] px-4 py-4">
            <p className="text-sm font-semibold text-ink">What to do next</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Open details to understand tradeoffs inside Payn, then use the provider link when you are ready to continue outside the product.
            </p>
          </div>
        </div>
        {topResult ? (
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            Current lead tradeoff: {getOfferTradeoff(topResult.offer)}
          </p>
        ) : null}
      </section>
    </div>
  );
}
