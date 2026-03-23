export type MarketplaceCategory = "loans" | "cards" | "transfers" | "exchange";

export interface MarketplaceMetric {
  label: string;
  value: string;
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
}
