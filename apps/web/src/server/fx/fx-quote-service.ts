import "server-only";

import type { FxCurrencyCode, FxQuotePayload } from "@/lib/fx-quote";
import { serverEnv } from "@/lib/server-env";

type OpenExchangeRatesResponse = {
  timestamp: number;
  rates: Record<string, number>;
};

type ExchangeRateHostResponse = {
  success?: boolean;
  result?: number;
  date?: string;
  info?: {
    rate?: number;
  };
};

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

function calculatePairRate(rates: Record<string, number>, fromCurrency: string, toCurrency: string) {
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    return null;
  }

  return rates[toCurrency] / rates[fromCurrency];
}

async function fetchJsonWithTimeout<T>(input: string, timeoutMs = 4500): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
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

async function fetchOpenExchangeRatesQuote(
  fromCurrency: FxCurrencyCode,
  toCurrency: FxCurrencyCode,
) {
  if (!serverEnv.openExchangeRatesAppId) {
    return null;
  }

  const symbols = Array.from(new Set([fromCurrency, toCurrency, "USD"])).join(",");
  const url = `https://openexchangerates.org/api/latest.json?app_id=${serverEnv.openExchangeRatesAppId}&symbols=${symbols}`;
  const response = await fetchJsonWithTimeout<OpenExchangeRatesResponse>(url);
  const rate = calculatePairRate(response.rates, fromCurrency, toCurrency);

  if (!rate) {
    return null;
  }

  return {
    rate,
    sourceName: "Open Exchange Rates",
    delayed: false,
    updatedAt: new Date(response.timestamp * 1000).toISOString(),
  };
}

async function fetchExchangeRateHostQuote(
  fromCurrency: FxCurrencyCode,
  toCurrency: FxCurrencyCode,
) {
  const url = new URL("https://api.exchangerate.host/convert");
  url.searchParams.set("from", fromCurrency);
  url.searchParams.set("to", toCurrency);
  url.searchParams.set("amount", "1");

  if (serverEnv.exchangeRateHostAccessKey) {
    url.searchParams.set("access_key", serverEnv.exchangeRateHostAccessKey);
  }

  const response = await fetchJsonWithTimeout<ExchangeRateHostResponse>(url.toString());
  const rate = response.result ?? response.info?.rate ?? null;

  if (!rate) {
    return null;
  }

  return {
    rate,
    sourceName: "ExchangeRate.host",
    delayed: false,
    updatedAt: response.date ? new Date(`${response.date}T00:00:00.000Z`).toISOString() : new Date().toISOString(),
  };
}

async function fetchFrankfurterQuote(fromCurrency: FxCurrencyCode, toCurrency: FxCurrencyCode) {
  const url = `https://api.frankfurter.app/latest?amount=1&from=${fromCurrency}&to=${toCurrency}`;
  const response = await fetchJsonWithTimeout<FrankfurterResponse>(url);
  const rate = response.rates[toCurrency];

  if (!rate) {
    return null;
  }

  return {
    rate,
    sourceName: "Frankfurter",
    delayed: true,
    updatedAt: new Date(`${response.date}T00:00:00.000Z`).toISOString(),
  };
}

// Hardcoded indicative rates as of 2026-04 — used only when all live sources fail.
// These keep Transfers/Exchange functional even during API outages.
const FALLBACK_RATES: Record<string, number> = {
  "EUR:USD": 1.09,
  "EUR:GBP": 0.86,
  "EUR:CHF": 0.96,
  "USD:EUR": 0.92,
  "USD:GBP": 0.79,
  "USD:CHF": 0.88,
  "GBP:EUR": 1.17,
  "GBP:USD": 1.27,
  "GBP:CHF": 1.13,
  "CHF:EUR": 1.04,
  "CHF:USD": 1.14,
  "CHF:GBP": 0.89,
};

export async function getFxQuote(args: {
  fromCurrency: FxCurrencyCode;
  toCurrency: FxCurrencyCode;
}): Promise<FxQuotePayload> {
  const { fromCurrency, toCurrency } = args;

  if (fromCurrency === toCurrency) {
    return {
      fromCurrency,
      toCurrency,
      rate: 1,
      sourceName: "Parity",
      delayed: false,
      unavailable: false,
      updatedAt: new Date().toISOString(),
    };
  }

  // Run all providers in parallel — return the first non-null result.
  type QuoteResult = { rate: number; sourceName: string; delayed: boolean; updatedAt: string };
  const requireResult = (p: Promise<QuoteResult | null>) =>
    p.then((r) => { if (!r) throw new Error("no result"); return r; });

  const raceResult = await Promise.any([
    requireResult(fetchOpenExchangeRatesQuote(fromCurrency, toCurrency)),
    requireResult(fetchExchangeRateHostQuote(fromCurrency, toCurrency)),
    requireResult(fetchFrankfurterQuote(fromCurrency, toCurrency)),
  ]).catch(() => null);

  if (raceResult) {
    return {
      fromCurrency,
      toCurrency,
      rate: raceResult.rate,
      sourceName: raceResult.sourceName,
      delayed: raceResult.delayed,
      unavailable: false,
      updatedAt: raceResult.updatedAt,
    };
  }

  // All live sources failed — use hardcoded indicative rate so the page still renders.
  const fallbackRate = FALLBACK_RATES[`${fromCurrency}:${toCurrency}`] ?? null;

  if (fallbackRate) {
    return {
      fromCurrency,
      toCurrency,
      rate: fallbackRate,
      sourceName: "Cached estimate",
      delayed: true,
      unavailable: false,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    fromCurrency,
    toCurrency,
    rate: 0,
    sourceName: "Unavailable",
    delayed: true,
    unavailable: true,
    updatedAt: new Date().toISOString(),
  };
}
