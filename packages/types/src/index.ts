export type MarketplaceCategory =
  | "loans"
  | "cards"
  | "banking"
  | "transfers"
  | "exchange"
  | "insurance"
  | "investments"
  | "crypto"
  | "business"
  | "budgeting"
  | "kids";

export type MarketplaceInsuranceType =
  | "travel"
  | "health"
  | "life"
  | "auto"
  | "nomad"
  | "device";

export type MarketplaceInvestmentAssetId =
  | "btc"
  | "eth"
  | "spy"
  | "qqq"
  | "eustocks"
  | "gold"
  | "eurusd";

export type MarketplaceInvestmentAccessType =
  | "spot_crypto"
  | "etf_dealing"
  | "commodity_exposure"
  | "multi_asset_brokerage"
  | "recurring_buy"
  | "multi_currency_fx";

export type MarketplaceMarket =
  | "eu"
  | "international"
  | "de"
  | "es"
  | "uk"
  | "fr"
  | "it"
  | "pt"
  | "nl";

export type MarketplaceLocale = "en" | "de" | "es" | "fr" | "it" | "pt";

export interface MarketplaceMetric {
  label: string;
  value: string;
}

export interface MarketplaceOfferAttributes {
  subtype?: string;
  insuranceType?: MarketplaceInsuranceType;
  minAmount?: number;
  maxAmount?: number;
  minTermMonths?: number;
  maxTermMonths?: number;
  speed?: "instant" | "same_day" | "next_day" | "standard";
  feeProfile?: "low" | "medium" | "premium";
  riskProfile?: "conservative" | "balanced" | "growth";
  availability?: "local" | "regional" | "eu_wide" | "international";
  searchTags?: string[];
  isPartner?: boolean;
  affiliate?: boolean;
  monetized?: boolean;
  supportedAssets?: MarketplaceInvestmentAssetId[];
  accessType?: MarketplaceInvestmentAccessType;
  estimatedCostLabel?: string;
  feeModel?: string;
  estimatedSpreadRange?: string;
  recurringSupported?: boolean;
  minimumOrder?: string;
  notes?: string;
  sourceUrl?: string;
  dataSource?: "manual" | "provider" | "marketplace" | "affiliate";
  lastCheckedAt?: string;
  confidenceScore?: number;
  informational?: boolean;
  priceAmount?: number;
  coverageAmount?: number;
  medicalCoverage?: number;
  deductibleAmount?: number;
  maxTripDays?: number;
  regionCoverage?: "eu" | "worldwide" | "regional";
  activityLevel?: "basic" | "extreme";
  visaCompliant?: boolean;
  instantActivation?: boolean;
  comparisonHighlights?: string[];
  cardType?: "credit" | "debit" | "charge";
  annualFeeAmount?: number;
  fxFeePercent?: number;
  atmFreeLimit?: number;
  cashbackPercent?: number;
  cryptoSupport?: boolean;
  beginnerFriendly?: boolean;
  platformUxLevel?: "beginner" | "intermediate" | "advanced" | "pro";
  minDeposit?: string;
  assetsAvailableLabel?: string;
}

export interface MarketplaceOffer {
  id: string;
  slug: string;
  category: MarketplaceCategory;
  countryCodes: string[];
  providerMark: string;
  providerName: string;
  title: string;
  subtitle: string;
  metrics: MarketplaceMetric[];
  bestFor: string[];
  providerWebsiteUrl: string;
  affiliateLink: string;
  providerUrls?: Record<string, string>;
  linkType: "affiliate_redirect" | "lead_capture" | "embedded_partner";
  affiliatePriorityScore: number;
  updatedAt: string;
  attributes?: MarketplaceOfferAttributes;
}
