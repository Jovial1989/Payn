import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";

export type OfferSourceType = "provider" | "marketplace" | "affiliate";
export type CrawlStrategy = "static" | "api" | "html";
export type TrackingNetwork = "financeads" | "impact" | "custom" | "direct" | null;

export type OfferDiscoverySource = {
  id: string;
  name: string;
  url: string;
  country: string;
  categories: MarketplaceCategory[];
  sourceType: OfferSourceType;
  crawlStrategy: CrawlStrategy;
  reliabilityScore: number;
  isActive: boolean;
  lastCrawledAt: string | null;
  parserConfig: Record<string, unknown>;
};

export type RawDiscoveredOffer = {
  sourceId: string;
  sourceUrl: string;
  sourceType: OfferSourceType;
  reliabilityScore: number;
  providerName?: string;
  productName?: string;
  category?: MarketplaceCategory;
  country?: string;
  aprMin?: number | null;
  aprMax?: number | null;
  rate?: string | null;
  spread?: string | null;
  fee?: string | null;
  currency?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
  termMin?: number | null;
  termMax?: number | null;
  features: string[];
  tags: string[];
  benefits: string[];
  rating?: number | null;
  affiliateUrl?: string | null;
  rawTrackingUrl?: string | null;
  trackingNetwork?: TrackingNetwork;
  extractedAt: string;
  confidenceHints: string[];
};

export type NormalizedOfferRecord = {
  id: string;
  providerId?: string;
  providerName: string;
  name: string;
  category: MarketplaceCategory;
  country: string;
  aprMin: number | null;
  aprMax: number | null;
  fee: string | null;
  currency: string;
  amountMin: number | null;
  amountMax: number | null;
  termMin: number | null;
  termMax: number | null;
  features: string[];
  isMonetised: boolean;
  affiliateUrl: string | null;
  rawTrackingUrl: string | null;
  trackingNetwork: TrackingNetwork;
  sourceUrl: string;
  sourceType: OfferSourceType;
  lastUpdated: string;
  confidenceScore: number;
  informational: boolean;
  estimated: boolean;
  fingerprint: string;
};

export type ParserResult = {
  offers: RawDiscoveredOffer[];
  errors: string[];
  metadata: {
    parser: string;
    durationMs: number;
    fetchedUrl?: string;
    cached?: boolean;
  };
};

export type IngestionRunStats = {
  runId: string | null;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  sourcesChecked: number;
  offersDiscovered: number;
  offersNormalized: number;
  offersPublished: number;
  changesDetected: number;
  failures: Array<{ sourceId: string; sourceUrl: string; reason: string }>;
  skipped: Array<{ sourceId: string; reason: string }>;
};

export type PublishedOffer = MarketplaceOffer & {
  discovery?: NormalizedOfferRecord;
};
