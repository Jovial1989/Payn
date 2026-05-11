import type { MarketplaceCategory } from "@payn/types";
import { parseNumber } from "./name-utils";
import type { FetchResult } from "./fetcher";
import type { OfferDiscoverySource, ParserResult, RawDiscoveredOffer } from "./types";

export async function parseSource(
  source: OfferDiscoverySource,
  fetched: FetchResult,
): Promise<ParserResult> {
  const started = Date.now();
  try {
    const offers = await selectParser(source, fetched);
    return {
      offers,
      errors: [],
      metadata: {
        parser: source.crawlStrategy,
        durationMs: Date.now() - started,
        fetchedUrl: fetched.url,
        cached: fetched.cached,
      },
    };
  } catch (error) {
    return {
      offers: fallbackParse(source, fetched),
      errors: [error instanceof Error ? error.message : "Unknown parser error"],
      metadata: {
        parser: "fallback",
        durationMs: Date.now() - started,
        fetchedUrl: fetched.url,
        cached: fetched.cached,
      },
    };
  }
}

async function selectParser(source: OfferDiscoverySource, fetched: FetchResult) {
  if (source.crawlStrategy === "api" || fetched.contentType.includes("json")) {
    return parseApi(source, fetched);
  }

  return parseHtml(source, fetched);
}

function parseApi(source: OfferDiscoverySource, fetched: FetchResult) {
  const json = JSON.parse(fetched.body) as unknown;
  const rows = Array.isArray(json)
    ? json
    : typeof json === "object" && json && "offers" in json && Array.isArray(json.offers)
      ? json.offers
      : [];

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .slice(0, 50)
    .map((row) =>
      buildRawOffer(source, {
        providerName: stringField(row, ["providerName", "provider", "bank", "issuer"]) ?? source.name,
        productName: stringField(row, ["productName", "name", "title"]) ?? source.name,
        category: categoryField(row, ["category"]) ?? source.categories[0],
        country: stringField(row, ["country", "countryCode"]) ?? source.country,
        apr: stringField(row, ["apr", "rate", "interestRate"]),
        fee: stringField(row, ["fee", "fees", "monthlyFee", "annualFee"]),
        amount: stringField(row, ["amount", "amountRange"]),
        term: stringField(row, ["term", "termRange"]),
        features: arrayField(row, ["features", "tags", "benefits"]),
        affiliateUrl: stringField(row, ["affiliateUrl", "affiliate_link", "trackingUrl"]),
      }),
    );
}

function parseHtml(source: OfferDiscoverySource, fetched: FetchResult) {
  const text = htmlToText(fetched.body);
  const config = source.parserConfig;
  const providerName = stringConfig(config, "providerName") ?? source.name;
  const productName = stringConfig(config, "productName") ?? inferProductName(text, source);

  return [
    buildRawOffer(source, {
      providerName,
      productName,
      category: source.categories[0],
      country: source.country,
      apr: firstMatch(text, /(?:APR|TAEG|TAPR|interest rate|eff\.?\s*Jahreszins)[^\d]{0,32}(\d+(?:[.,]\d+)?\s?%)/i),
      fee: firstMatch(text, /(?:fee|fees|commission|comisión|commissione|Gebühr)[^\d€$£]{0,32}([€$£]?\s?\d+(?:[.,]\d+)?\s?%?)/i),
      spread: firstMatch(text, /(?:spread|markup|marge)[^\d]{0,32}(\d+(?:[.,]\d+)?\s?%)/i),
      amount: firstMatch(text, /([€$£]\s?\d[\d.,]+\s?(?:-|to|bis|à)\s?[€$£]?\s?\d[\d.,]+)/i),
      term: firstMatch(text, /(\d+\s?(?:-|to|bis|à)\s?\d+\s?(?:months|Monate|meses|mois|mesi))/i),
      features: extractFeatures(text),
      affiliateUrl: stringConfig(config, "affiliateUrl"),
    }),
  ];
}

function fallbackParse(source: OfferDiscoverySource, fetched: FetchResult) {
  const text = htmlToText(fetched.body);
  return [
    buildRawOffer(source, {
      providerName: source.name,
      productName: source.name,
      category: source.categories[0],
      country: source.country,
      features: extractFeatures(text).slice(0, 3),
    }),
  ];
}

function buildRawOffer(
  source: OfferDiscoverySource,
  input: {
    providerName: string;
    productName: string;
    category: MarketplaceCategory;
    country: string;
    apr?: string | null;
    fee?: string | null;
    spread?: string | null;
    amount?: string | null;
    term?: string | null;
    features?: string[];
    affiliateUrl?: string | null;
  },
): RawDiscoveredOffer {
  const affiliateUrl = input.affiliateUrl ?? null;
  return {
    sourceId: source.id,
    sourceUrl: source.url,
    sourceType: source.sourceType,
    reliabilityScore: source.reliabilityScore,
    providerName: input.providerName,
    productName: input.productName,
    category: input.category,
    country: input.country.toUpperCase(),
    aprMin: parseNumber(input.apr),
    aprMax: parseNumber(input.apr),
    spread: input.spread,
    fee: input.fee,
    currency: inferCurrency(input.amount ?? input.fee ?? ""),
    amountMin: parseRange(input.amount).min,
    amountMax: parseRange(input.amount).max,
    termMin: parseRange(input.term).min,
    termMax: parseRange(input.term).max,
    features: input.features ?? [],
    tags: input.features ?? [],
    benefits: input.features ?? [],
    affiliateUrl,
    rawTrackingUrl: affiliateUrl,
    trackingNetwork: inferTrackingNetwork(affiliateUrl),
    extractedAt: new Date().toISOString(),
    confidenceHints: [
      input.apr ? "rate" : "",
      input.fee ? "fee" : "",
      input.amount ? "amount" : "",
      input.term ? "term" : "",
      affiliateUrl ? "affiliate" : "",
    ].filter(Boolean),
  };
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .slice(0, 24000);
}

function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim() ?? null;
}

function parseRange(value: string | null | undefined) {
  if (!value) return { min: null, max: null };
  const numbers = [...value.matchAll(/\d+(?:[.,]\d+)?/g)].map((match) =>
    Number(match[0].replace(",", ".")),
  );
  return {
    min: numbers[0] ?? null,
    max: numbers[1] ?? numbers[0] ?? null,
  };
}

function inferCurrency(value: string) {
  if (value.includes("$")) return "USD";
  if (value.includes("£")) return "GBP";
  return "EUR";
}

function inferTrackingNetwork(url: string | null | undefined) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("financeads")) return "financeads";
  if (lower.includes("impact.com") || lower.includes("impactradius")) return "impact";
  return lower.includes("utm_") ? "custom" : "direct";
}

function extractFeatures(text: string) {
  const features = [
    /instant[^,.]{0,30}/i,
    /no fee[^,.]{0,30}/i,
    /free[^,.]{0,30}/i,
    /same day[^,.]{0,30}/i,
    /travel insurance[^,.]{0,30}/i,
  ]
    .map((pattern) => text.match(pattern)?.[0]?.trim())
    .filter(Boolean) as string[];
  return [...new Set(features)].slice(0, 5);
}

function inferProductName(text: string, source: OfferDiscoverySource) {
  const title = firstMatch(text, /^(.{12,90}?)(?:\s[-|]\s|\.)/);
  return title ?? source.name;
}

function stringField(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function categoryField(row: Record<string, unknown>, keys: string[]) {
  const value = stringField(row, keys);
  return value as MarketplaceCategory | null;
}

function arrayField(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (Array.isArray(value)) return value.map(String);
  }
  return [];
}

function stringConfig(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
