import type {
  MarketplaceInvestmentAccessType,
  MarketplaceInvestmentAssetId,
  MarketplaceLocale,
  MarketplaceOffer,
} from "@payn/types";

export type MarketIntelligenceAssetId = MarketplaceInvestmentAssetId;
export type MarketIntelligenceTimeframe = "1D" | "1W" | "1M" | "3M" | "1Y";
export type MarketIntelligenceDirection = "up" | "down" | "flat";
export type MarketInsightTone = "positive" | "neutral" | "caution";
export type MarketAssetKind = "crypto" | "equity" | "commodity" | "fx";

export interface MarketDataPoint {
  time: string;
  value: number;
}

export interface MarketIntelligenceSourceAttempt {
  provider: string;
  symbol: string;
  timeframe: MarketIntelligenceTimeframe;
  interval: string;
  requestLabel: string;
  status: "success" | "empty" | "failed" | "disabled";
  pointCount: number;
  firstPoint?: MarketDataPoint;
  lastPoint?: MarketDataPoint;
  error?: string;
}

export interface MarketIntelligenceSignal {
  label: string;
  value: string;
  tone: MarketInsightTone;
}

export interface MarketIntelligenceProviderMatch {
  providerName: string;
  offerTitle: string;
  providerUrl: string;
  offerHref: string;
  accessType: string;
  estimatedCostLabel: string;
  feeModel: string;
  estimatedSpreadRange: string;
  recurringSupported: boolean;
  minimumOrder?: string;
  bestFor: string;
  notes: string;
  estimatedCostScore: number;
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
  unavailable: boolean;
  updatedAt: string;
  statusLabel: string;
  attributionNotice: string;
  attributionLink: string;
  attributionLabel: string;
  debug?: {
    assetId: MarketIntelligenceAssetId;
    timeframe: MarketIntelligenceTimeframe;
    attempts: MarketIntelligenceSourceAttempt[];
  };
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
  twelveData?: {
    symbol: string;
  };
  alphaVantage?: {
    kind: "security" | "digital" | "fx";
    symbol?: string;
    market?: string;
    fromSymbol?: string;
    toSymbol?: string;
  };
  yahooFinance: {
    symbol: string;
  };
}

export interface MarketTimeframeDefinition {
  id: MarketIntelligenceTimeframe;
  days: number;
  points: number;
  finnhubResolution: Record<MarketAssetKind, string>;
  yahooInterval: string;
  yahooLabel: string;
  twelvedataInterval: string;
}

export interface InvestmentAccessProfile {
  offerId: string;
  assetId: MarketIntelligenceAssetId;
  accessType: string;
  accessTypeKey: MarketplaceInvestmentAccessType;
  estimatedCostLabel: string;
  estimatedSpreadRange: string;
  feeModel: string;
  recurringSupported: boolean;
  minimumOrder?: string;
  bestFor: string;
  notes: string;
  estimatedCostScore: number;
}

export interface InvestmentAccessMatch extends InvestmentAccessProfile {
  offer: MarketplaceOffer;
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
    twelveData: { symbol: "BTC/USD" },
    alphaVantage: { kind: "digital", symbol: "BTC", market: "USD" },
    yahooFinance: { symbol: "BTC-USD" },
  },
  eth: {
    id: "eth",
    label: "ETH",
    kind: "crypto",
    currency: "USD",
    baseValue: 3600,
    defaultDrift: 0.058,
    finnhub: { endpoint: "crypto", symbol: "BINANCE:ETHUSDT" },
    twelveData: { symbol: "ETH/USD" },
    alphaVantage: { kind: "digital", symbol: "ETH", market: "USD" },
    yahooFinance: { symbol: "ETH-USD" },
  },
  spy: {
    id: "spy",
    label: "S&P 500 ETF",
    kind: "equity",
    currency: "USD",
    baseValue: 515,
    defaultDrift: 0.018,
    finnhub: { endpoint: "stock", symbol: "SPY" },
    twelveData: { symbol: "SPY" },
    alphaVantage: { kind: "security", symbol: "SPY" },
    yahooFinance: { symbol: "SPY" },
  },
  qqq: {
    id: "qqq",
    label: "NASDAQ ETF",
    kind: "equity",
    currency: "USD",
    baseValue: 445,
    defaultDrift: 0.026,
    finnhub: { endpoint: "stock", symbol: "QQQ" },
    twelveData: { symbol: "QQQ" },
    alphaVantage: { kind: "security", symbol: "QQQ" },
    yahooFinance: { symbol: "QQQ" },
  },
  eustocks: {
    id: "eustocks",
    label: "EU Stocks Index",
    kind: "equity",
    currency: "USD",
    baseValue: 70,
    defaultDrift: 0.014,
    finnhub: { endpoint: "stock", symbol: "VGK" },
    twelveData: { symbol: "VGK" },
    alphaVantage: { kind: "security", symbol: "VGK" },
    yahooFinance: { symbol: "VGK" },
  },
  gold: {
    id: "gold",
    label: "Gold",
    kind: "commodity",
    currency: "USD",
    baseValue: 225,
    defaultDrift: 0.012,
    finnhub: { endpoint: "stock", symbol: "GLD" },
    twelveData: { symbol: "GLD" },
    alphaVantage: { kind: "security", symbol: "GLD" },
    yahooFinance: { symbol: "GC=F" },
  },
  eurusd: {
    id: "eurusd",
    label: "EUR/USD",
    kind: "fx",
    currency: "USD",
    baseValue: 1.09,
    defaultDrift: -0.004,
    finnhub: { endpoint: "forex", symbol: "OANDA:EUR_USD" },
    twelveData: { symbol: "EUR/USD" },
    alphaVantage: { kind: "fx", fromSymbol: "EUR", toSymbol: "USD" },
    yahooFinance: { symbol: "EURUSD=X" },
  },
};

export const marketIntelligenceTimeframes: Record<
  MarketIntelligenceTimeframe,
  MarketTimeframeDefinition
> = {
  "1D": {
    id: "1D",
    days: 1,
    points: 32,
    finnhubResolution: {
      crypto: "15",
      equity: "15",
      commodity: "15",
      fx: "15",
    },
    yahooInterval: "15m",
    yahooLabel: "1d",
    twelvedataInterval: "15min",
  },
  "1W": {
    id: "1W",
    days: 7,
    points: 42,
    finnhubResolution: {
      crypto: "60",
      equity: "60",
      commodity: "60",
      fx: "60",
    },
    yahooInterval: "60m",
    yahooLabel: "7d",
    twelvedataInterval: "1h",
  },
  "1M": {
    id: "1M",
    days: 30,
    points: 30,
    finnhubResolution: {
      crypto: "D",
      equity: "D",
      commodity: "D",
      fx: "D",
    },
    yahooInterval: "1d",
    yahooLabel: "1mo",
    twelvedataInterval: "1day",
  },
  "3M": {
    id: "3M",
    days: 90,
    points: 90,
    finnhubResolution: {
      crypto: "D",
      equity: "D",
      commodity: "D",
      fx: "D",
    },
    yahooInterval: "1d",
    yahooLabel: "3mo",
    twelvedataInterval: "1day",
  },
  "1Y": {
    id: "1Y",
    days: 365,
    points: 52,
    finnhubResolution: {
      crypto: "W",
      equity: "W",
      commodity: "W",
      fx: "W",
    },
    yahooInterval: "1wk",
    yahooLabel: "1y",
    twelvedataInterval: "1week",
  },
};

const investmentAccessProfiles: InvestmentAccessProfile[] = [
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "btc",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "Estimated spread ~1.0%",
    estimatedSpreadRange: "~0.75% to 1.00%",
    feeModel: "Spread-based crypto pricing",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "One-account crypto and ETF access",
    notes: "Useful if you want BTC alongside ETFs, gold, and FX-style exposure in one platform.",
    estimatedCostScore: 1.0,
  },
  {
    offerId: "investment-bitpanda-crypto-metals",
    assetId: "btc",
    accessType: "Recurring buy",
    accessTypeKey: "recurring_buy",
    estimatedCostLabel: "Estimated spread ~1.25%",
    estimatedSpreadRange: "~0.99% to 1.49%",
    feeModel: "Quoted spread with recurring-buy support",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Euro-based recurring BTC buys",
    notes: "A cleaner fit if you want scheduled crypto accumulation in EUR rather than active execution.",
    estimatedCostScore: 1.25,
  },
  {
    offerId: "investment-coinbase-simple",
    assetId: "btc",
    accessType: "Recurring buy",
    accessTypeKey: "recurring_buy",
    estimatedCostLabel: "Spread + transaction fee",
    estimatedSpreadRange: "~0.50% to 1.50% plus fee",
    feeModel: "Simple buy pricing varies by order size and payment flow",
    recurringSupported: true,
    minimumOrder: "EUR 2",
    bestFor: "Straightforward retail BTC access",
    notes: "Better suited to simple recurring access than tight execution pricing.",
    estimatedCostScore: 1.45,
  },
  {
    offerId: "investment-kraken-europe",
    assetId: "btc",
    accessType: "Spot crypto",
    accessTypeKey: "spot_crypto",
    estimatedCostLabel: "Exchange-style fee from 0.16%",
    estimatedSpreadRange: "~0.20% to 0.60%",
    feeModel: "Maker/taker fee plus simple-buy spread",
    recurringSupported: true,
    minimumOrder: "EUR 10",
    bestFor: "Tighter BTC pricing",
    notes: "More useful when you care about lower exchange-style cost than a simplified retail checkout.",
    estimatedCostScore: 0.4,
  },
  {
    offerId: "investment-binance-eu",
    assetId: "btc",
    accessType: "Spot crypto",
    accessTypeKey: "spot_crypto",
    estimatedCostLabel: "Spot fee from 0.10%",
    estimatedSpreadRange: "~0.10% to 0.40%",
    feeModel: "Exchange fee on liquid crypto pairs",
    recurringSupported: false,
    minimumOrder: "Exchange minimums apply",
    bestFor: "Lower headline BTC fee",
    notes: "Useful when direct spot-market pricing matters more than a guided retail flow.",
    estimatedCostScore: 0.25,
  },
  {
    offerId: "investment-revolut-crypto-fx",
    assetId: "btc",
    accessType: "Recurring buy",
    accessTypeKey: "recurring_buy",
    estimatedCostLabel: "Plan-based spread pricing",
    estimatedSpreadRange: "~0.25% to 1.50%",
    feeModel: "Spread varies by plan and trading window",
    recurringSupported: true,
    minimumOrder: "App minimums apply",
    bestFor: "In-app crypto access",
    notes: "Useful if you want simple BTC access inside an existing multi-currency app experience.",
    estimatedCostScore: 1.15,
  },
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "eth",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "Estimated spread ~1.0%",
    estimatedSpreadRange: "~0.75% to 1.00%",
    feeModel: "Spread-based crypto pricing",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "One-account ETH and ETF access",
    notes: "Useful when ETH is part of a broader multi-asset allocation rather than a standalone crypto route.",
    estimatedCostScore: 1.0,
  },
  {
    offerId: "investment-bitpanda-crypto-metals",
    assetId: "eth",
    accessType: "Recurring buy",
    accessTypeKey: "recurring_buy",
    estimatedCostLabel: "Estimated spread ~1.25%",
    estimatedSpreadRange: "~0.99% to 1.49%",
    feeModel: "Quoted spread with recurring-buy support",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Euro-based recurring ETH buys",
    notes: "Useful when you want recurring ETH access in EUR with a simpler retail flow.",
    estimatedCostScore: 1.25,
  },
  {
    offerId: "investment-coinbase-simple",
    assetId: "eth",
    accessType: "Recurring buy",
    accessTypeKey: "recurring_buy",
    estimatedCostLabel: "Spread + transaction fee",
    estimatedSpreadRange: "~0.50% to 1.50% plus fee",
    feeModel: "Simple buy pricing varies by order size and payment flow",
    recurringSupported: true,
    minimumOrder: "EUR 2",
    bestFor: "Simple ETH access",
    notes: "Best suited to straightforward recurring ETH purchases rather than tighter trading spreads.",
    estimatedCostScore: 1.45,
  },
  {
    offerId: "investment-kraken-europe",
    assetId: "eth",
    accessType: "Spot crypto",
    accessTypeKey: "spot_crypto",
    estimatedCostLabel: "Exchange-style fee from 0.16%",
    estimatedSpreadRange: "~0.20% to 0.60%",
    feeModel: "Maker/taker fee plus simple-buy spread",
    recurringSupported: true,
    minimumOrder: "EUR 10",
    bestFor: "Tighter ETH pricing",
    notes: "More useful when you care about lower exchange-style cost than a simplified checkout flow.",
    estimatedCostScore: 0.4,
  },
  {
    offerId: "investment-binance-eu",
    assetId: "eth",
    accessType: "Spot crypto",
    accessTypeKey: "spot_crypto",
    estimatedCostLabel: "Spot fee from 0.10%",
    estimatedSpreadRange: "~0.10% to 0.40%",
    feeModel: "Exchange fee on liquid crypto pairs",
    recurringSupported: false,
    minimumOrder: "Exchange minimums apply",
    bestFor: "Lower headline ETH fee",
    notes: "Useful when direct spot-market access matters more than recurring-plan support.",
    estimatedCostScore: 0.25,
  },
  {
    offerId: "investment-revolut-crypto-fx",
    assetId: "eth",
    accessType: "Recurring buy",
    accessTypeKey: "recurring_buy",
    estimatedCostLabel: "Plan-based spread pricing",
    estimatedSpreadRange: "~0.25% to 1.50%",
    feeModel: "Spread varies by plan and trading window",
    recurringSupported: true,
    minimumOrder: "App minimums apply",
    bestFor: "Simple in-app ETH access",
    notes: "Useful when you want lightweight ETH access inside an existing multi-currency product.",
    estimatedCostScore: 1.15,
  },
  {
    offerId: "investment-trade-republic-core",
    assetId: "spy",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "ETF access from EUR 1",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Order pricing plus venue spread",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Long-term ETF savings plans",
    notes: "A strong fit for long-term broad-market ETF exposure with low minimum recurring plans.",
    estimatedCostScore: 0.2,
  },
  {
    offerId: "investment-scalable-prime",
    assetId: "spy",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "ETF orders from EUR 0.99",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Plan-based or per-order pricing",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Portfolio building with savings plans",
    notes: "Useful when you want ETF breadth with recurring investing and cleaner portfolio tooling.",
    estimatedCostScore: 0.35,
  },
  {
    offerId: "investment-degiro-global",
    assetId: "spy",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "Low exchange + handling fee",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Exchange and handling fees depend on route",
    recurringSupported: false,
    minimumOrder: "Exchange minimums apply",
    bestFor: "Broader listed-market access",
    notes: "Useful when exchange coverage matters more than automated recurring plans.",
    estimatedCostScore: 0.55,
  },
  {
    offerId: "investment-trading212-market-access",
    assetId: "spy",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "Commission-free ETF dealing",
    estimatedSpreadRange: "Market spread + FX conversion if needed",
    feeModel: "Spread and FX costs depend on instrument",
    recurringSupported: true,
    minimumOrder: "Instrument minimums apply",
    bestFor: "Simple ETF exposure",
    notes: "Useful when you want broad-market ETF access with a lighter self-directed interface.",
    estimatedCostScore: 0.4,
  },
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "spy",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "ETF route with spread-based access",
    estimatedSpreadRange: "~0.15% to 0.30%",
    feeModel: "Spread and account-conversion costs vary by route",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "ETF plus crypto in one account",
    notes: "Useful when broad-market ETFs sit alongside crypto or commodities in the same discovery flow.",
    estimatedCostScore: 0.65,
  },
  {
    offerId: "investment-interactive-brokers-global",
    assetId: "spy",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "Tighter market-style pricing",
    estimatedSpreadRange: "~0.10% to 0.20%",
    feeModel: "Commission plus market spread",
    recurringSupported: false,
    minimumOrder: "Route-dependent minimums",
    bestFor: "Cost-aware ETF access",
    notes: "Useful when you care more about deeper market routing and FX efficiency than a simple retail flow.",
    estimatedCostScore: 0.18,
  },
  {
    offerId: "investment-trade-republic-core",
    assetId: "qqq",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "ETF access from EUR 1",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Order pricing plus venue spread",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Recurring NASDAQ ETF access",
    notes: "A straightforward route for recurring QQQ-style exposure inside a simple retail workflow.",
    estimatedCostScore: 0.2,
  },
  {
    offerId: "investment-scalable-prime",
    assetId: "qqq",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "ETF orders from EUR 0.99",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Plan-based or per-order pricing",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Recurring growth-ETF allocation",
    notes: "Useful when you want growth-heavy ETF exposure via recurring plan structure.",
    estimatedCostScore: 0.35,
  },
  {
    offerId: "investment-degiro-global",
    assetId: "qqq",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "Low exchange + handling fee",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Exchange and handling fees depend on route",
    recurringSupported: false,
    minimumOrder: "Exchange minimums apply",
    bestFor: "Broader exchange access",
    notes: "Useful if market depth and exchange choice matter more than recurring-plan features.",
    estimatedCostScore: 0.55,
  },
  {
    offerId: "investment-trading212-market-access",
    assetId: "qqq",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "Commission-free ETF dealing",
    estimatedSpreadRange: "Market spread + FX conversion if needed",
    feeModel: "Spread and FX costs depend on instrument",
    recurringSupported: true,
    minimumOrder: "Instrument minimums apply",
    bestFor: "Simple growth ETF access",
    notes: "Useful when you want QQQ-style access with a cleaner self-directed retail surface.",
    estimatedCostScore: 0.4,
  },
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "qqq",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "ETF route with spread-based access",
    estimatedSpreadRange: "~0.15% to 0.30%",
    feeModel: "Spread and conversion costs vary by route",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "Growth ETF plus crypto access",
    notes: "Useful if tech-heavy ETF exposure sits alongside crypto or commodity access in one account.",
    estimatedCostScore: 0.65,
  },
  {
    offerId: "investment-interactive-brokers-global",
    assetId: "qqq",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "Tighter market-style pricing",
    estimatedSpreadRange: "~0.10% to 0.20%",
    feeModel: "Commission plus market spread",
    recurringSupported: false,
    minimumOrder: "Route-dependent minimums",
    bestFor: "Cost-aware NASDAQ ETF access",
    notes: "Useful when you want tighter cross-market routing rather than a simplified retail ETF flow.",
    estimatedCostScore: 0.18,
  },
  {
    offerId: "investment-trade-republic-core",
    assetId: "eustocks",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "EU index ETF access from EUR 1",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Order pricing plus venue spread",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Recurring European equity exposure",
    notes: "Useful when you want a broader Europe index route with recurring plans.",
    estimatedCostScore: 0.2,
  },
  {
    offerId: "investment-scalable-prime",
    assetId: "eustocks",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "EU index ETF orders from EUR 0.99",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Plan-based or per-order pricing",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Portfolio building in European equities",
    notes: "Useful when Europe exposure sits inside a recurring ETF plan workflow.",
    estimatedCostScore: 0.35,
  },
  {
    offerId: "investment-degiro-global",
    assetId: "eustocks",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "Low exchange + handling fee",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Exchange and handling fees depend on route",
    recurringSupported: false,
    minimumOrder: "Exchange minimums apply",
    bestFor: "Broader European exchange access",
    notes: "Useful if listed-market depth matters more than recurring plan support.",
    estimatedCostScore: 0.55,
  },
  {
    offerId: "investment-trading212-market-access",
    assetId: "eustocks",
    accessType: "ETF dealing",
    accessTypeKey: "etf_dealing",
    estimatedCostLabel: "Commission-free ETF dealing",
    estimatedSpreadRange: "Market spread + FX conversion if needed",
    feeModel: "Spread and FX costs depend on instrument",
    recurringSupported: true,
    minimumOrder: "Instrument minimums apply",
    bestFor: "Simple European ETF access",
    notes: "Useful when you want Europe index access with a cleaner retail UX.",
    estimatedCostScore: 0.4,
  },
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "eustocks",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "ETF route with spread-based access",
    estimatedSpreadRange: "~0.15% to 0.30%",
    feeModel: "Spread and conversion costs vary by route",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "Europe index plus crypto in one account",
    notes: "Useful when European equities sit next to broader multi-asset discovery.",
    estimatedCostScore: 0.65,
  },
  {
    offerId: "investment-interactive-brokers-global",
    assetId: "eustocks",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "Tighter market-style pricing",
    estimatedSpreadRange: "~0.10% to 0.20%",
    feeModel: "Commission plus market spread",
    recurringSupported: false,
    minimumOrder: "Route-dependent minimums",
    bestFor: "Cost-aware Europe index access",
    notes: "Useful when European equity exposure needs deeper routing rather than a simplified retail flow.",
    estimatedCostScore: 0.18,
  },
  {
    offerId: "investment-trade-republic-core",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Gold ETC access from EUR 1",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Order pricing plus exchange spread",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Recurring gold exposure",
    notes: "Useful if you want gold ETC-style access via the same savings-plan workflow as broad-market ETFs.",
    estimatedCostScore: 0.3,
  },
  {
    offerId: "investment-scalable-prime",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Gold ETC access from EUR 0.99",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Plan-based or per-order pricing",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Gold alongside ETF plans",
    notes: "Useful if gold sits inside a broader recurring ETF and diversification workflow.",
    estimatedCostScore: 0.38,
  },
  {
    offerId: "investment-degiro-global",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Low exchange + handling fee",
    estimatedSpreadRange: "Market spread only",
    feeModel: "Exchange and handling fees depend on route",
    recurringSupported: false,
    minimumOrder: "Exchange minimums apply",
    bestFor: "Listed gold ETC access",
    notes: "Useful when you want listed commodity exposure with wider exchange access.",
    estimatedCostScore: 0.58,
  },
  {
    offerId: "investment-trading212-market-access",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Commission-free listed access",
    estimatedSpreadRange: "Market spread + FX conversion if needed",
    feeModel: "Spread and FX costs depend on instrument",
    recurringSupported: true,
    minimumOrder: "Instrument minimums apply",
    bestFor: "Simple gold ETC access",
    notes: "Useful when you want gold ETC exposure in a cleaner retail brokerage flow.",
    estimatedCostScore: 0.42,
  },
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Spread-based commodity access",
    estimatedSpreadRange: "~0.15% to 0.40%",
    feeModel: "Spread varies by market and route",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "Gold plus multi-asset account access",
    notes: "Useful if gold is one sleeve inside a broader multi-asset discovery workflow.",
    estimatedCostScore: 0.7,
  },
  {
    offerId: "investment-bitpanda-crypto-metals",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Quoted spread on metal access",
    estimatedSpreadRange: "~0.50% to 1.00%",
    feeModel: "Quoted spread with retail metal access",
    recurringSupported: true,
    minimumOrder: "EUR 1",
    bestFor: "Euro-based recurring gold exposure",
    notes: "Useful when you want gold access in the same place as crypto recurring buys.",
    estimatedCostScore: 0.95,
  },
  {
    offerId: "investment-interactive-brokers-global",
    assetId: "gold",
    accessType: "Commodity exposure",
    accessTypeKey: "commodity_exposure",
    estimatedCostLabel: "Tighter market-style pricing",
    estimatedSpreadRange: "~0.10% to 0.25%",
    feeModel: "Commission plus market spread",
    recurringSupported: false,
    minimumOrder: "Route-dependent minimums",
    bestFor: "Tighter gold market routing",
    notes: "Useful when you care more about access efficiency than a simplified retail commodity flow.",
    estimatedCostScore: 0.22,
  },
  {
    offerId: "investment-interactive-brokers-global",
    assetId: "eurusd",
    accessType: "Multi-currency FX",
    accessTypeKey: "multi_currency_fx",
    estimatedCostLabel: "Tighter FX-style spread",
    estimatedSpreadRange: "~0.10% to 0.25%",
    feeModel: "Commission plus market spread",
    recurringSupported: false,
    minimumOrder: "Route-dependent minimums",
    bestFor: "Cost-aware FX access",
    notes: "Useful when you want EUR/USD access through a deeper brokerage and FX routing layer.",
    estimatedCostScore: 0.2,
  },
  {
    offerId: "investment-etoro-multi-asset",
    assetId: "eurusd",
    accessType: "Multi-asset brokerage",
    accessTypeKey: "multi_asset_brokerage",
    estimatedCostLabel: "Spread-based FX access",
    estimatedSpreadRange: "~0.20% to 0.60%",
    feeModel: "Spread and conversion costs vary by route",
    recurringSupported: false,
    minimumOrder: "USD 10",
    bestFor: "Macro-led market access",
    notes: "Useful when EUR/USD sits next to broader market and commodity discovery in one account.",
    estimatedCostScore: 0.6,
  },
  {
    offerId: "investment-revolut-crypto-fx",
    assetId: "eurusd",
    accessType: "Multi-currency FX",
    accessTypeKey: "multi_currency_fx",
    estimatedCostLabel: "Plan-based FX conversion pricing",
    estimatedSpreadRange: "~0.20% to 1.00% depending on plan and timing",
    feeModel: "Conversion cost depends on plan, amount, and execution window",
    recurringSupported: false,
    minimumOrder: "App minimums apply",
    bestFor: "Day-to-day FX access",
    notes: "Useful when you want straightforward EUR/USD conversion access inside a multi-currency app.",
    estimatedCostScore: 0.55,
  },
];

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

export function getInvestmentAccessMatches(
  offers: MarketplaceOffer[],
  assetId: MarketIntelligenceAssetId,
): InvestmentAccessMatch[] {
  const offersById = new Map(
    offers
      .filter(
        (offer) =>
          offer.category === "investments" &&
          offer.attributes?.supportedAssets?.includes(assetId),
      )
      .map((offer) => [offer.id, offer] satisfies [string, MarketplaceOffer]),
  );

  return investmentAccessProfiles
    .filter((profile) => profile.assetId === assetId)
    .map((profile) => {
      const offer = offersById.get(profile.offerId);

      if (!offer) {
        return null;
      }

      return {
        ...profile,
        offer,
      } satisfies InvestmentAccessMatch;
    })
    .filter((match): match is InvestmentAccessMatch => match !== null)
    .sort((left, right) => {
      if (left.estimatedCostScore !== right.estimatedCostScore) {
        return left.estimatedCostScore - right.estimatedCostScore;
      }

      if (left.recurringSupported !== right.recurringSupported) {
        return left.recurringSupported ? -1 : 1;
      }

      return left.offer.providerName.localeCompare(right.offer.providerName);
    });
}
