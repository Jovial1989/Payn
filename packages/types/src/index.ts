export type MarketplaceCategory =
  | "loans"
  | "cards"
  | "transfers"
  | "exchange"
  | "insurance"
  | "investments";

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
  minAmount?: number;
  maxAmount?: number;
  minTermMonths?: number;
  maxTermMonths?: number;
  speed?: "instant" | "same_day" | "next_day" | "standard";
  feeProfile?: "low" | "medium" | "premium";
  riskProfile?: "conservative" | "balanced" | "growth";
  availability?: "local" | "regional" | "eu_wide" | "international";
  searchTags?: string[];
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
  linkType: "affiliate_redirect" | "lead_capture" | "embedded_partner";
  affiliatePriorityScore: number;
  updatedAt: string;
  attributes?: MarketplaceOfferAttributes;
}
