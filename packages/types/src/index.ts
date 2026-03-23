export type MarketplaceCategory = "loans" | "cards" | "transfers" | "exchange";

export interface MarketplaceOffer {
  id: string;
  slug: string;
  category: MarketplaceCategory;
  countryCodes: string[];
  providerName: string;
  title: string;
  subtitle: string;
  bestFor: string[];
  providerWebsiteUrl: string;
  affiliateLink: string;
  linkType: "affiliate_redirect" | "lead_capture" | "embedded_partner";
  affiliatePriorityScore: number;
  updatedAt: string;
}

