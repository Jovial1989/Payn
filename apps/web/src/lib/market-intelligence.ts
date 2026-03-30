import type { MarketplaceLocale } from "@payn/types";

export type MarketIntelligenceAssetId = "btc" | "eth" | "spy" | "qqq" | "gold" | "eurusd";
export type MarketIntelligenceTimeframe = "1D" | "1W" | "1M" | "3M";
export type MarketIntelligenceDirection = "up" | "down" | "flat";
export type MarketInsightTone = "positive" | "neutral" | "caution";
export type MarketAssetKind = "crypto" | "equity" | "commodity" | "fx";

export interface MarketDataPoint {
  time: string;
  value: number;
}

export interface MarketIntelligenceSignal {
  label: string;
  value: string;
  tone: MarketInsightTone;
}

export interface MarketIntelligenceProviderMatch {
  providerName: string;
  offerTitle: string;
  href: string;
  note: string;
}

export interface MarketIntelligencePayload {
  assetId: MarketIntelligenceAssetId;
  assetLabel: string;
  timeframe: MarketIntelligenceTimeframe;
  latestPrice: number;
  currency: string;
  changePct: number;
  direction: MarketIntelligenceDirection;
  points: MarketDataPoint[];
  signals: MarketIntelligenceSignal[];
  summary: string;
  recommendations: string[];
  availableOn: MarketIntelligenceProviderMatch[];
  sourceLabel: string;
  sourceName: string;
  stale: boolean;
  delayed: boolean;
  updatedAt: string;
  statusLabel: string;
  attributionNotice: string;
  attributionLink: string;
  attributionLabel: string;
}

export interface MarketAssetDefinition {
  id: MarketIntelligenceAssetId;
  label: string;
  kind: MarketAssetKind;
  currency: string;
  baseValue: number;
  defaultDrift: number;
  finnhub: {
    endpoint: "stock" | "crypto" | "forex";
    symbol: string;
  };
  alphaVantage?: {
    kind: "security" | "digital" | "fx";
    symbol?: string;
    market?: string;
    fromSymbol?: string;
    toSymbol?: string;
  };
  providerNames: string[];
}

export interface MarketTimeframeDefinition {
  id: MarketIntelligenceTimeframe;
  days: number;
  resolution: string;
  points: number;
}

export const marketIntelligenceAssets: Record<MarketIntelligenceAssetId, MarketAssetDefinition> = {
  btc: {
    id: "btc",
    label: "BTC",
    kind: "crypto",
    currency: "USD",
    baseValue: 68000,
    defaultDrift: 0.072,
    finnhub: { endpoint: "crypto", symbol: "BINANCE:BTCUSDT" },
    alphaVantage: { kind: "digital", symbol: "BTC", market: "USD" },
    providerNames: ["eToro", "Bitpanda", "Coinbase"],
  },
  eth: {
    id: "eth",
    label: "ETH",
    kind: "crypto",
    currency: "USD",
    baseValue: 3600,
    defaultDrift: 0.058,
    finnhub: { endpoint: "crypto", symbol: "BINANCE:ETHUSDT" },
    alphaVantage: { kind: "digital", symbol: "ETH", market: "USD" },
    providerNames: ["eToro", "Bitpanda", "Coinbase"],
  },
  spy: {
    id: "spy",
    label: "S&P 500 ETF",
    kind: "equity",
    currency: "USD",
    baseValue: 515,
    defaultDrift: 0.018,
    finnhub: { endpoint: "stock", symbol: "SPY" },
    alphaVantage: { kind: "security", symbol: "SPY" },
    providerNames: ["Trade Republic", "Scalable Capital", "DEGIRO", "eToro"],
  },
  qqq: {
    id: "qqq",
    label: "NASDAQ ETF",
    kind: "equity",
    currency: "USD",
    baseValue: 445,
    defaultDrift: 0.026,
    finnhub: { endpoint: "stock", symbol: "QQQ" },
    alphaVantage: { kind: "security", symbol: "QQQ" },
    providerNames: ["Trade Republic", "Scalable Capital", "DEGIRO", "eToro"],
  },
  gold: {
    id: "gold",
    label: "Gold",
    kind: "commodity",
    currency: "USD",
    baseValue: 225,
    defaultDrift: 0.012,
    finnhub: { endpoint: "stock", symbol: "GLD" },
    alphaVantage: { kind: "security", symbol: "GLD" },
    providerNames: ["Trade Republic", "Scalable Capital", "DEGIRO", "eToro"],
  },
  eurusd: {
    id: "eurusd",
    label: "EUR/USD",
    kind: "fx",
    currency: "USD",
    baseValue: 1.09,
    defaultDrift: -0.004,
    finnhub: { endpoint: "forex", symbol: "OANDA:EUR_USD" },
    alphaVantage: { kind: "fx", fromSymbol: "EUR", toSymbol: "USD" },
    providerNames: ["eToro", "DEGIRO", "Trade Republic"],
  },
};

export const marketIntelligenceTimeframes: Record<
  MarketIntelligenceTimeframe,
  MarketTimeframeDefinition
> = {
  "1D": { id: "1D", days: 1, resolution: "60", points: 24 },
  "1W": { id: "1W", days: 7, resolution: "240", points: 42 },
  "1M": { id: "1M", days: 30, resolution: "D", points: 30 },
  "3M": { id: "3M", days: 90, resolution: "D", points: 90 },
};

export const marketIntelligenceAssetOptions = Object.values(marketIntelligenceAssets);
export const marketIntelligenceTimeframeOptions = Object.values(marketIntelligenceTimeframes);

export function isMarketIntelligenceAssetId(value: string | null): value is MarketIntelligenceAssetId {
  return Boolean(value && value in marketIntelligenceAssets);
}

export function isMarketIntelligenceTimeframe(
  value: string | null,
): value is MarketIntelligenceTimeframe {
  return Boolean(value && value in marketIntelligenceTimeframes);
}

export function normalizeMarketIntelligenceAsset(
  value?: string | null,
): MarketIntelligenceAssetId {
  const normalized = value ?? null;
  return isMarketIntelligenceAssetId(normalized) ? normalized : "btc";
}

export function normalizeMarketIntelligenceTimeframe(
  value?: string | null,
): MarketIntelligenceTimeframe {
  const normalized = value ?? null;
  return isMarketIntelligenceTimeframe(normalized) ? normalized : "1W";
}

export function normalizeMarketIntelligenceLocale(
  value?: string | null,
): MarketplaceLocale {
  const locales: MarketplaceLocale[] = ["en", "de", "es", "fr", "it", "pt"];
  return locales.includes(value as MarketplaceLocale) ? (value as MarketplaceLocale) : "en";
}
