import type { MarketplaceOffer } from "@payn/types";

export const featuredOffers: MarketplaceOffer[] = [
  {
    id: "offer-loan-fast-eu",
    slug: "fast-eu-flex-loan",
    category: "loans",
    countryCodes: ["EU", "DE", "ES"],
    providerName: "NorthLake Finance",
    title: "Flexible personal loan",
    subtitle: "Transparent repayments for planned expenses and refinancing needs.",
    bestFor: ["Debt consolidation", "Large purchases", "Digital application"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.72,
    providerWebsiteUrl: "https://example.com/provider",
    affiliateLink: "https://example.com/affiliate",
    updatedAt: "2026-03-23T00:00:00Z",
  },
  {
    id: "offer-card-smart-travel",
    slug: "smart-travel-card",
    category: "cards",
    countryCodes: ["EU", "UK"],
    providerName: "Atlas Bank",
    title: "Travel rewards card",
    subtitle: "Rewards-focused card with travel perks and fee visibility.",
    bestFor: ["Travel spend", "Points", "Premium support"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.63,
    providerWebsiteUrl: "https://example.com/provider",
    affiliateLink: "https://example.com/affiliate",
    updatedAt: "2026-03-23T00:00:00Z",
  },
];

