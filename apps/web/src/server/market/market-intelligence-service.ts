import "server-only";

import type { MarketplaceLocale } from "@payn/types";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import {
  getLocalizedInsightValue,
  getLocalizedRecommendations,
  getLocalizedSummary,
  getMarketIntelligenceCopy,
} from "@/lib/market-intelligence-copy";
import {
  getInvestmentAccessMatches,
  marketIntelligenceAssets,
  marketIntelligenceTimeframes,
  type MarketDataPoint,
  type MarketInsightTone,
  type MarketIntelligenceAssetId,
  type MarketIntelligenceDirection,
  type MarketIntelligencePayload,
  type MarketIntelligenceSourceAttempt,
  type MarketIntelligenceTimeframe,
} from "@/lib/market-intelligence";
import { serverEnv } from "@/lib/server-env";

type FinnhubCandleResponse = {
  c?: number[];
  t?: number[];
  s?: string;
};

type AlphaVantageResponse = Record<string, Record<string, Record<string, string>>>;

type TwelveDataResponse = {
  status?: string;
  values?: Array<{
    datetime?: string;
    close?: string;
  }>;
  code?: number;
  message?: string;
};

type YahooFinanceResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
    error?: {
      code?: string;
      description?: string;
    } | null;
  };
};

type MarketSeries = {
  provider: string;
  sourceName: string;
  delayed: boolean;
  symbol: string;
  interval: string;
  requestLabel: string;
  points: MarketDataPoint[];
};

type MarketSeriesAttempt = {
  attempt: MarketIntelligenceSourceAttempt;
  series: MarketSeries | null;
};

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

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function buildAttempt(args: {
  provider: string;
  symbol: string;
  timeframe: MarketIntelligenceTimeframe;
  interval: string;
  requestLabel: string;
  status: MarketIntelligenceSourceAttempt["status"];
  points?: MarketDataPoint[];
  error?: string;
}): MarketIntelligenceSourceAttempt {
  const points = args.points ?? [];

  return {
    provider: args.provider,
    symbol: args.symbol,
    timeframe: args.timeframe,
    interval: args.interval,
    requestLabel: args.requestLabel,
    status: args.status,
    pointCount: points.length,
    firstPoint: points[0],
    lastPoint: points[points.length - 1],
    error: args.error,
  };
}

function maybeLogDebug(enabled: boolean, label: string, value: unknown) {
  if (!enabled) {
    return;
  }

  console.info(`[payn-market] ${label}`, value);
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
): Promise<MarketSeriesAttempt> {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];
  const interval = timeframeConfig.finnhubResolution[asset.kind];
  const symbol = asset.finnhub.symbol;
  const requestLabel = `symbol=${symbol}&resolution=${interval}&days=${timeframeConfig.days}`;

  if (!serverEnv.finnhubApiKey) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Finnhub",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "disabled",
        error: "FINNHUB_API_KEY is not configured",
      }),
    };
  }

  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - timeframeConfig.days * 24 * 60 * 60;
    const url = new URL(`https://finnhub.io/api/v1/${asset.finnhub.endpoint}/candle`);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("resolution", interval);
    url.searchParams.set("from", String(from));
    url.searchParams.set("to", String(to));
    url.searchParams.set("token", serverEnv.finnhubApiKey);

    const response = await fetchJsonWithTimeout<FinnhubCandleResponse>(url.toString(), {
      next: {
        revalidate: timeframe === "1D" ? 120 : 300,
        tags: [`market-intelligence:finnhub:${assetId}:${timeframe}`],
      },
    });

    if (response.s !== "ok" || !response.c?.length || !response.t?.length) {
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Finnhub",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          error: `Finnhub status: ${response.s ?? "unknown"}`,
        }),
      };
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
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Finnhub",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          points: rawPoints,
          error: "Not enough candle points returned",
        }),
      };
    }

    const points = clampPoints(rawPoints, timeframeConfig.points);

    return {
      series: {
        provider: "Finnhub",
        sourceName: "Finnhub",
        delayed: false,
        symbol,
        interval,
        requestLabel,
        points,
      },
      attempt: buildAttempt({
        provider: "Finnhub",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "success",
        points,
      }),
    };
  } catch (error) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Finnhub",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "failed",
        error: formatError(error),
      }),
    };
  }
}

async function fetchTwelveDataSeries(
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
): Promise<MarketSeriesAttempt> {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];
  const symbol = asset.twelveData?.symbol ?? asset.label;
  const interval = timeframeConfig.twelvedataInterval;
  const requestLabel = `symbol=${symbol}&interval=${interval}&outputsize=${Math.max(
    timeframeConfig.points,
    40,
  )}`;

  if (!serverEnv.twelveDataApiKey || !asset.twelveData) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Twelve Data",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "disabled",
        error: "TWELVE_DATA_API_KEY is not configured",
      }),
    };
  }

  try {
    const url = new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", String(Math.max(timeframeConfig.points, 40)));
    url.searchParams.set("order", "ASC");
    url.searchParams.set("timezone", "UTC");
    url.searchParams.set("apikey", serverEnv.twelveDataApiKey);

    const response = await fetchJsonWithTimeout<TwelveDataResponse>(url.toString(), {
      next: {
        revalidate: timeframe === "1D" ? 180 : 420,
        tags: [`market-intelligence:twelvedata:${assetId}:${timeframe}`],
      },
    });

    if (!response.values?.length || response.status === "error") {
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Twelve Data",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          error: response.message ?? "No values returned",
        }),
      };
    }

    const rawPoints = response.values
      .map((entry) => {
        const value = Number(entry.close);
        if (!Number.isFinite(value) || !entry.datetime) {
          return null;
        }

        return {
          time: new Date(entry.datetime.replace(" ", "T") + "Z").toISOString(),
          value,
        } satisfies MarketDataPoint;
      })
      .filter((point): point is MarketDataPoint => point !== null)
      .sort((left, right) => new Date(left.time).getTime() - new Date(right.time).getTime());

    if (rawPoints.length < 2) {
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Twelve Data",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          points: rawPoints,
          error: "Not enough time series points returned",
        }),
      };
    }

    const points = clampPoints(rawPoints.slice(-Math.max(timeframeConfig.points, 20)), timeframeConfig.points);

    return {
      series: {
        provider: "Twelve Data",
        sourceName: "Twelve Data",
        delayed: true,
        symbol,
        interval,
        requestLabel,
        points,
      },
      attempt: buildAttempt({
        provider: "Twelve Data",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "success",
        points,
      }),
    };
  } catch (error) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Twelve Data",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "failed",
        error: formatError(error),
      }),
    };
  }
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
): Promise<MarketSeriesAttempt> {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];
  const interval = timeframe === "1D" ? "n/a" : timeframeConfig.twelvedataInterval;
  const symbol =
    asset.alphaVantage?.kind === "fx"
      ? `${asset.alphaVantage.fromSymbol}/${asset.alphaVantage.toSymbol}`
      : asset.alphaVantage?.symbol ?? asset.label;
  const requestLabel = `asset=${symbol}&timeframe=${timeframe}`;

  if (!serverEnv.alphaVantageApiKey || !asset.alphaVantage) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Alpha Vantage",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "disabled",
        error: "ALPHA_VANTAGE_API_KEY is not configured",
      }),
    };
  }

  if (timeframe === "1D") {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Alpha Vantage",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "disabled",
        error: "Daily-only endpoint is not used for 1D intraday charts",
      }),
    };
  }

  try {
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
      url.searchParams.set("outputsize", timeframe === "3M" ? "full" : "compact");
    }

    url.searchParams.set("apikey", serverEnv.alphaVantageApiKey);

    const response = await fetchJsonWithTimeout<AlphaVantageResponse>(url.toString(), {
      next: {
        revalidate: 900,
        tags: [`market-intelligence:alphavantage:${assetId}:${timeframe}`],
      },
    });

    const series = extractAlphaSeries(response, [
      "Time Series (Digital Currency Daily)",
      "Time Series FX (Daily)",
      "Time Series (Daily)",
    ]);

    if (!series) {
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Alpha Vantage",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          error: "No time series block returned",
        }),
      };
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
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Alpha Vantage",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          points: rawPoints,
          error: "Not enough daily points returned",
        }),
      };
    }

    const limited = rawPoints.slice(-Math.max(timeframeConfig.points, 14));
    const points = clampPoints(limited, timeframeConfig.points);

    return {
      series: {
        provider: "Alpha Vantage",
        sourceName: "Alpha Vantage",
        delayed: true,
        symbol,
        interval,
        requestLabel,
        points,
      },
      attempt: buildAttempt({
        provider: "Alpha Vantage",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "success",
        points,
      }),
    };
  } catch (error) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Alpha Vantage",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "failed",
        error: formatError(error),
      }),
    };
  }
}

async function fetchYahooFinanceSeries(
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
): Promise<MarketSeriesAttempt> {
  const asset = marketIntelligenceAssets[assetId];
  const timeframeConfig = marketIntelligenceTimeframes[timeframe];
  const symbol = asset.yahooFinance.symbol;
  const interval = timeframeConfig.yahooInterval;
  const now = Math.floor(Date.now() / 1000);
  const from = now - timeframeConfig.days * 24 * 60 * 60;
  const requestLabel = `symbol=${symbol}&interval=${interval}&period1=${from}&period2=${now}`;

  try {
    const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
    url.searchParams.set("interval", interval);
    url.searchParams.set("period1", String(from));
    url.searchParams.set("period2", String(now));
    url.searchParams.set("includePrePost", "false");
    url.searchParams.set("events", "div,splits");

    const response = await fetchJsonWithTimeout<YahooFinanceResponse>(url.toString(), {
      next: {
        revalidate: timeframe === "1D" ? 240 : 600,
        tags: [`market-intelligence:yahoo:${assetId}:${timeframe}`],
      },
    });

    const result = response.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const closes = result?.indicators?.quote?.[0]?.close ?? [];

    if (!result || timestamps.length === 0 || closes.length === 0) {
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Yahoo Finance",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          error: response.chart?.error?.description ?? "No chart data returned",
        }),
      };
    }

    const rawPoints = timestamps
      .map((timestamp, index) => {
        const close = closes[index];

        if (!timestamp || close == null || !Number.isFinite(close)) {
          return null;
        }

        return {
          time: new Date(timestamp * 1000).toISOString(),
          value: close,
        } satisfies MarketDataPoint;
      })
      .filter((point): point is MarketDataPoint => point !== null);

    if (rawPoints.length < 2) {
      return {
        series: null,
        attempt: buildAttempt({
          provider: "Yahoo Finance",
          symbol,
          timeframe,
          interval,
          requestLabel,
          status: "empty",
          points: rawPoints,
          error: "Not enough chart points returned",
        }),
      };
    }

    const points = clampPoints(rawPoints, timeframeConfig.points);

    return {
      series: {
        provider: "Yahoo Finance",
        sourceName: "Yahoo Finance",
        delayed: true,
        symbol,
        interval,
        requestLabel,
        points,
      },
      attempt: buildAttempt({
        provider: "Yahoo Finance",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "success",
        points,
      }),
    };
  } catch (error) {
    return {
      series: null,
      attempt: buildAttempt({
        provider: "Yahoo Finance",
        symbol,
        timeframe,
        interval,
        requestLabel,
        status: "failed",
        error: formatError(error),
      }),
    };
  }
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

async function resolveSeries(
  assetId: MarketIntelligenceAssetId,
  timeframe: MarketIntelligenceTimeframe,
  debug: boolean,
) {
  const attempts: MarketIntelligenceSourceAttempt[] = [];
  const chain = [
    () => fetchFinnhubSeries(assetId, timeframe),
    () => fetchTwelveDataSeries(assetId, timeframe),
    () => fetchAlphaVantageSeries(assetId, timeframe),
    () => fetchYahooFinanceSeries(assetId, timeframe),
  ] as const;

  for (const load of chain) {
    const result = await load();
    attempts.push(result.attempt);
    maybeLogDebug(debug, "source-attempt", result.attempt);

    if (result.series && result.series.points.length >= 2) {
      return { series: result.series, attempts };
    }
  }

  return { series: null, attempts };
}

export async function getMarketIntelligence({
  assetId,
  timeframe,
  locale,
  debug = false,
}: {
  assetId: MarketIntelligenceAssetId;
  timeframe: MarketIntelligenceTimeframe;
  locale: MarketplaceLocale;
  debug?: boolean;
}): Promise<MarketIntelligencePayload> {
  const asset = marketIntelligenceAssets[assetId];
  const dictionary = getMarketIntelligenceCopy(locale);
  const [{ series, attempts }, marketplaceOffers] = await Promise.all([
    resolveSeries(assetId, timeframe, debug),
    listMarketplaceOffers(),
  ]);

  const availableOn = getInvestmentAccessMatches(
    marketplaceOffers.filter((offer) => offer.category === "investments"),
    assetId,
  ).map((match) => ({
    providerName: match.offer.providerName,
    offerTitle: match.offer.title,
    providerUrl: match.offer.providerWebsiteUrl,
    offerHref: match.offer.providerWebsiteUrl,
    accessType: match.accessType,
    estimatedCostLabel: match.estimatedCostLabel,
    feeModel: match.feeModel,
    estimatedSpreadRange: match.estimatedSpreadRange,
    recurringSupported: match.recurringSupported,
    minimumOrder: match.minimumOrder,
    bestFor: match.bestFor,
    notes: match.notes,
    estimatedCostScore: match.estimatedCostScore,
  }));

  if (!series) {
    const payload: MarketIntelligencePayload = {
      assetId,
      assetLabel: asset.label,
      timeframe,
      latestPrice: 0,
      currency: asset.currency,
      changePct: 0,
      direction: "flat",
      points: [],
      signals: [],
      summary: dictionary.unavailableBody,
      recommendations: [],
      availableOn,
      sourceLabel: dictionary.unavailableBody,
      sourceName: "Unavailable",
      stale: true,
      delayed: true,
      unavailable: true,
      updatedAt: new Date().toISOString(),
      statusLabel: dictionary.unavailable,
      attributionNotice: "Market charts use Lightweight Charts™ by TradingView.",
      attributionLink: "https://www.tradingview.com/",
      attributionLabel: "TradingView",
      debug: debug
        ? {
            assetId,
            timeframe,
            attempts,
          }
        : undefined,
    };

    maybeLogDebug(debug, "resolved-unavailable", payload.debug);
    return payload;
  }

  const values = series.points.map((point) => point.value);
  const latestPrice = values[values.length - 1] ?? 0;
  const initialPrice = values[0] ?? latestPrice;
  const changePct = initialPrice > 0 ? ((latestPrice - initialPrice) / initialPrice) * 100 : 0;
  const direction = getDirection(changePct);
  const { signals, volatilityTone, summaryTone } = buildSignals(locale, asset.label, direction, values);

  const payload: MarketIntelligencePayload = {
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
    unavailable: false,
    updatedAt: series.points[series.points.length - 1]?.time ?? new Date().toISOString(),
    statusLabel: series.delayed ? dictionary.delayed : dictionary.live,
    attributionNotice: "Market charts use Lightweight Charts™ by TradingView.",
    attributionLink: "https://www.tradingview.com/",
    attributionLabel: "TradingView",
    debug: debug
      ? {
          assetId,
          timeframe,
          attempts,
        }
      : undefined,
  };

  maybeLogDebug(debug, "resolved-series", {
    assetId,
    timeframe,
    source: series.sourceName,
    symbol: series.symbol,
    interval: series.interval,
    points: series.points.length,
    firstPoint: series.points[0],
    lastPoint: series.points[series.points.length - 1],
  });

  return payload;
}
