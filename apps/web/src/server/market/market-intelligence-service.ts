import "server-only";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import {
  getLocalizedInsightValue,
  getLocalizedRecommendations,
  getLocalizedSummary,
  getMarketIntelligenceCopy,
  getProviderSuitabilityNote,
} from "@/lib/market-intelligence-copy";
import {
  marketIntelligenceAssets,
  marketIntelligenceTimeframes,
  type MarketDataPoint,
  type MarketInsightTone,
  type MarketIntelligenceAssetId,
  type MarketIntelligenceDirection,
  type MarketIntelligencePayload,
  type MarketIntelligenceTimeframe,
} from "@/lib/market-intelligence";
import { getOfferHref } from "@/lib/marketplace";
import { localePath } from "@/lib/locale";
import { serverEnv } from "@/lib/server-env";

type FinnhubCandleResponse = {
  c?: number[];
  t?: number[];
  s?: string;
};

type AlphaVantageResponse = Record<string, Record<string, Record<string, string>>>;

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampPoints(points: MarketDataPoint[], limit: number) {
  if (points.length <= limit) {
    return points;
  }

  const step = (points.length - 1) / Math.max(limit - 1, 1);

  return Array.from({ length: limit }, (_, index) => {
    const sourceIndex = Math.round(index * step);
    return points[sourceIndex] ?? points[points.length - 1]!;
  });
}

function getDirection(changePct: number): MarketIntelligenceDirection {
  if (Math.abs(changePct) < 0.15) {
    return "flat";
  }

  return changePct > 0 ? "up" : "down";
}

async function fetchJsonWithTimeout<T>(
  input: string,
  init: RequestInit = {},
  timeoutMs = 4500,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFinnhubSeries(
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
) {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];

  if (!serverEnv.finnhubApiKey) {
    return null;
  }

  const to = Math.floor(Date.now() / 1000);
  const from = to - timeframeConfig.days * 24 * 60 * 60;
  const url = new URL(`https://finnhub.io/api/v1/${asset.finnhub.endpoint}/candle`);
  url.searchParams.set("symbol", asset.finnhub.symbol);
  url.searchParams.set("resolution", timeframeConfig.resolution);
  url.searchParams.set("from", String(from));
  url.searchParams.set("to", String(to));
  url.searchParams.set("token", serverEnv.finnhubApiKey);

  const response = await fetchJsonWithTimeout<FinnhubCandleResponse>(url.toString(), {
    next: { revalidate: 300 },
  });

  if (response.s !== "ok" || !response.c?.length || !response.t?.length) {
    return null;
  }

  const rawPoints = response.c
    .map((value, index) => {
      const timestamp = response.t?.[index];

      if (!Number.isFinite(value) || !timestamp) {
        return null;
      }

      return {
        time: new Date(timestamp * 1000).toISOString(),
        value,
      } satisfies MarketDataPoint;
    })
    .filter((point): point is MarketDataPoint => point !== null);

  if (rawPoints.length < 2) {
    return null;
  }

  return {
    points: clampPoints(rawPoints, timeframeConfig.points),
    sourceName: "Finnhub",
    delayed: false,
  };
}

function extractAlphaSeries(response: AlphaVantageResponse, keys: string[]) {
  for (const key of keys) {
    const series = response[key];
    if (series) {
      return series;
    }
  }

  return null;
}

async function fetchAlphaVantageSeries(
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
) {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];

  if (!serverEnv.alphaVantageApiKey || !asset.alphaVantage || timeframe === "1D") {
    return null;
  }

  const url = new URL("https://www.alphavantage.co/query");

  if (asset.alphaVantage.kind === "digital") {
    url.searchParams.set("function", "DIGITAL_CURRENCY_DAILY");
    url.searchParams.set("symbol", asset.alphaVantage.symbol ?? "");
    url.searchParams.set("market", asset.alphaVantage.market ?? "USD");
  } else if (asset.alphaVantage.kind === "fx") {
    url.searchParams.set("function", "FX_DAILY");
    url.searchParams.set("from_symbol", asset.alphaVantage.fromSymbol ?? "EUR");
    url.searchParams.set("to_symbol", asset.alphaVantage.toSymbol ?? "USD");
  } else {
    url.searchParams.set("function", "TIME_SERIES_DAILY");
    url.searchParams.set("symbol", asset.alphaVantage.symbol ?? "");
    url.searchParams.set("outputsize", "compact");
  }

  url.searchParams.set("apikey", serverEnv.alphaVantageApiKey);

  const response = await fetchJsonWithTimeout<AlphaVantageResponse>(url.toString(), {
    next: { revalidate: 900 },
  });

  const series = extractAlphaSeries(response, [
    "Time Series (Digital Currency Daily)",
    "Time Series FX (Daily)",
    "Time Series (Daily)",
  ]);

  if (!series) {
    return null;
  }

  const rawPoints = Object.entries(series)
    .map(([date, values]) => {
      const candidates = [
        values["4a. close (USD)"],
        values["4b. close (USD)"],
        values["4. close"],
      ];
      const close = Number(candidates.find((value) => value !== undefined));

      if (!Number.isFinite(close)) {
        return null;
      }

      return {
        time: new Date(`${date}T00:00:00.000Z`).toISOString(),
        value: close,
      } satisfies MarketDataPoint;
    })
    .filter((point): point is MarketDataPoint => point !== null)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (rawPoints.length < 2) {
    return null;
  }

  const limited = rawPoints.slice(-Math.max(timeframeConfig.points, 14));

  return {
    points: clampPoints(limited, timeframeConfig.points),
    sourceName: "Alpha Vantage",
    delayed: true,
  };
}

function buildFallbackSeries(
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
) {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];
  const intervalMs =
    (timeframeConfig.days * 24 * 60 * 60 * 1000) / Math.max(timeframeConfig.points - 1, 1);
  const now = Date.now();
  const seed =
    assetId.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) / 100;

  const points = Array.from({ length: timeframeConfig.points }, (_, index) => {
    const progress = index / Math.max(timeframeConfig.points - 1, 1);
    const wave = Math.sin(progress * 10 + seed) * asset.baseValue * 0.012;
    const secondaryWave = Math.cos(progress * 17 + seed) * asset.baseValue * 0.006;
    const drift = asset.baseValue * asset.defaultDrift * (progress - 0.5);
    const value = Math.max(asset.baseValue * 0.2, asset.baseValue + drift + wave + secondaryWave);

    return {
      time: new Date(now - intervalMs * (timeframeConfig.points - index - 1)).toISOString(),
      value: Number(value.toFixed(asset.kind === "fx" ? 4 : 2)),
    } satisfies MarketDataPoint;
  });

  return {
    points,
    sourceName: "Payn snapshot",
    delayed: true,
  };
}

function getInvestmentOfferMap() {
  return new Map(
    marketplaceOffers
      .filter((offer) => offer.category === "investments")
      .map((offer) => [offer.providerName, offer] satisfies [string, MarketplaceOffer]),
  );
}

function buildSignals(
  locale: MarketplaceLocale,
  assetLabel: string,
  direction: MarketIntelligenceDirection,
  values: number[],
) {
  const recentWindow = values.slice(-Math.min(7, values.length));
  const trailingWindow = values.slice(-Math.min(30, values.length));
  const average7d = average(recentWindow);
  const average30d = average(trailingWindow);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const averageMove = average(
    values.slice(1).map((value, index) => Math.abs((value - values[index]!) / values[index]!)),
  );
  const swing = minValue > 0 ? (maxValue - minValue) / minValue : 0;

  const momentumTone: MarketInsightTone =
    values[values.length - 1]! > average7d * 1.015
      ? "positive"
      : values[values.length - 1]! < average7d * 0.985
        ? "caution"
        : "neutral";

  const volatilityTone: MarketInsightTone =
    swing > 0.12 || averageMove > 0.025
      ? "caution"
      : swing > 0.05 || averageMove > 0.012
        ? "neutral"
        : "positive";

  const relativeTrendTone: MarketInsightTone =
    values[values.length - 1]! > average30d * 1.02
      ? "positive"
      : values[values.length - 1]! < average30d * 0.98
        ? "caution"
        : "neutral";

  const summaryTone: MarketInsightTone =
    momentumTone === "positive" && relativeTrendTone === "positive"
      ? "positive"
      : momentumTone === "caution" || relativeTrendTone === "caution"
        ? "caution"
        : "neutral";

  const dictionary = getMarketIntelligenceCopy(locale);

  return {
    volatilityTone,
    summaryTone,
    signals: [
      {
        label: dictionary.insightLabels.momentum,
        value: getLocalizedInsightValue(locale, "momentum", momentumTone),
        tone: momentumTone,
      },
      {
        label: dictionary.insightLabels.volatility,
        value: getLocalizedInsightValue(locale, "volatility", volatilityTone),
        tone: volatilityTone,
      },
      {
        label: dictionary.insightLabels.relativeTrend,
        value: getLocalizedInsightValue(locale, "relativeTrend", relativeTrendTone),
        tone: relativeTrendTone,
      },
      {
        label: dictionary.insightLabels.summary,
        value: getLocalizedSummary(locale, assetLabel, direction, summaryTone),
        tone: summaryTone,
      },
    ],
  };
}

export async function getMarketIntelligence({
  assetId,
  timeframe,
  locale,
}: {
  assetId: MarketIntelligenceAssetId;
  timeframe: MarketIntelligenceTimeframe;
  locale: MarketplaceLocale;
}): Promise<MarketIntelligencePayload> {
  const asset = marketIntelligenceAssets[assetId];
  const dictionary = getMarketIntelligenceCopy(locale);
  const offersByProvider = getInvestmentOfferMap();

  const series =
    (await fetchFinnhubSeries(assetId, timeframe).catch(() => null)) ??
    (await fetchAlphaVantageSeries(assetId, timeframe).catch(() => null)) ??
    buildFallbackSeries(assetId, timeframe);

  const values = series.points.map((point) => point.value);
  const latestPrice = values[values.length - 1] ?? asset.baseValue;
  const initialPrice = values[0] ?? latestPrice;
  const changePct = initialPrice > 0 ? ((latestPrice - initialPrice) / initialPrice) * 100 : 0;
  const direction = getDirection(changePct);
  const { signals, volatilityTone, summaryTone } = buildSignals(
    locale,
    asset.label,
    direction,
    values,
  );

  const availableOn = asset.providerNames
    .map((providerName) => {
      const offer = offersByProvider.get(providerName);

      if (!offer) {
        return null;
      }

      return {
        providerName,
        offerTitle: offer.title,
        href: localePath(locale, getOfferHref(offer)),
        note: getProviderSuitabilityNote(locale, providerName, asset.kind),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    assetId,
    assetLabel: asset.label,
    timeframe,
    latestPrice,
    currency: asset.currency,
    changePct,
    direction,
    points: series.points,
    signals,
    summary: getLocalizedSummary(locale, asset.label, direction, summaryTone),
    recommendations: getLocalizedRecommendations(locale, asset.kind, volatilityTone),
    availableOn,
    sourceLabel: series.delayed
      ? dictionary.source.delayed(series.sourceName)
      : dictionary.source.live(series.sourceName),
    sourceName: series.sourceName,
    stale: series.delayed,
    delayed: series.delayed,
    updatedAt: series.points[series.points.length - 1]?.time ?? new Date().toISOString(),
    statusLabel: series.delayed ? dictionary.delayed : dictionary.live,
    attributionNotice: "Market charts use Lightweight Charts™ by TradingView.",
    attributionLink: "https://www.tradingview.com/",
    attributionLabel: "TradingView",
  };
}

