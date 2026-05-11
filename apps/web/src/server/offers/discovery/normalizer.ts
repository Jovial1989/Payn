import type { MarketplaceOffer } from "@payn/types";
import { parseNumber, similarityScore, slugify, stableFingerprint } from "./name-utils";
import type { NormalizedOfferRecord, RawDiscoveredOffer } from "./types";

const sourcePriority = {
  provider: 3,
  affiliate: 2,
  marketplace: 1,
} as const;

export function normalizeRawOffer(raw: RawDiscoveredOffer): NormalizedOfferRecord | null {
  const providerName = raw.providerName?.trim();
  const productName = raw.productName?.trim();
  const category = raw.category;
  const country = raw.country?.toUpperCase();

  if (!providerName || !productName || !category || !country) {
    return null;
  }

  const hasCommercialLink = Boolean(raw.affiliateUrl);
  const confidenceScore = calculateConfidence(raw);

  return {
    id: `discovered-${slugify(providerName)}-${slugify(productName)}-${country}`,
    providerName,
    name: productName,
    category,
    country,
    aprMin: raw.aprMin ?? parseNumber(raw.rate),
    aprMax: raw.aprMax ?? parseNumber(raw.rate),
    fee: raw.fee ?? raw.spread ?? null,
    currency: raw.currency ?? "EUR",
    amountMin: raw.amountMin ?? null,
    amountMax: raw.amountMax ?? null,
    termMin: raw.termMin ?? null,
    termMax: raw.termMax ?? null,
    features: dedupeStrings([...raw.features, ...raw.tags, ...raw.benefits]).slice(0, 8),
    isMonetised: hasCommercialLink,
    affiliateUrl: raw.affiliateUrl ?? null,
    rawTrackingUrl: raw.rawTrackingUrl ?? raw.affiliateUrl ?? null,
    trackingNetwork: raw.trackingNetwork ?? null,
    sourceUrl: raw.sourceUrl,
    sourceType: raw.sourceType,
    lastUpdated: raw.extractedAt,
    confidenceScore,
    informational: !hasCommercialLink,
    estimated: true,
    fingerprint: stableFingerprint(providerName, productName, country),
  };
}

export function dedupeNormalizedOffers(offers: NormalizedOfferRecord[]) {
  const selected: NormalizedOfferRecord[] = [];

  for (const offer of offers) {
    const existingIndex = selected.findIndex(
      (candidate) =>
        candidate.country === offer.country &&
        candidate.category === offer.category &&
        similarityScore(candidate.providerName, offer.providerName) >= 0.82 &&
        similarityScore(candidate.name, offer.name) >= 0.58,
    );

    if (existingIndex === -1) {
      selected.push(offer);
      continue;
    }

    selected[existingIndex] = preferOffer(selected[existingIndex], offer);
  }

  return selected;
}

export function mergeWithCuratedOffer(
  discovered: NormalizedOfferRecord,
  curated?: MarketplaceOffer,
): MarketplaceOffer {
  const monetisedCurated = Boolean(
    curated?.attributes?.monetized || curated?.attributes?.affiliate,
  );

  return {
    id: curated?.id ?? discovered.id,
    slug: curated?.slug ?? slugify(`${discovered.providerName}-${discovered.name}`),
    category: discovered.category,
    countryCodes: curated?.countryCodes ?? [discovered.country],
    providerMark:
      curated?.providerMark ?? discovered.providerName.slice(0, 2).toUpperCase(),
    providerName: curated?.providerName ?? discovered.providerName,
    title: curated?.title ?? discovered.name,
    subtitle:
      curated?.subtitle ??
      "Market data estimate. Final rates and terms are confirmed by the provider.",
    metrics: curated?.metrics?.length ? curated.metrics : buildMetrics(discovered),
    bestFor: curated?.bestFor?.length
      ? curated.bestFor
      : discovered.isMonetised
        ? ["Best option", "Partner offer"]
        : ["Market data", "Estimated"],
    providerWebsiteUrl: curated?.providerWebsiteUrl ?? discovered.sourceUrl,
    affiliateLink: monetisedCurated && curated
      ? curated.affiliateLink
      : discovered.affiliateUrl ?? discovered.sourceUrl,
    providerUrls: curated?.providerUrls,
    linkType: curated?.linkType ?? "affiliate_redirect",
    affiliatePriorityScore:
      curated?.affiliatePriorityScore ??
      (discovered.isMonetised ? 0.45 : Math.max(0.05, discovered.confidenceScore / 5)),
    updatedAt: discovered.lastUpdated,
    attributes: {
      ...curated?.attributes,
      monetized: monetisedCurated || discovered.isMonetised,
      affiliate: curated?.attributes?.affiliate ?? discovered.isMonetised,
      informational: !monetisedCurated && !discovered.isMonetised,
      sourceUrl: discovered.sourceUrl,
      dataSource: discovered.sourceType,
      lastCheckedAt: discovered.lastUpdated,
      confidenceScore: discovered.confidenceScore,
      searchTags: dedupeStrings([
        ...(curated?.attributes?.searchTags ?? []),
        ...discovered.features,
        discovered.sourceType === "provider" ? "official provider" : "market data",
      ]),
    },
  };
}

export function findMatchingCuratedOffer(
  discovered: NormalizedOfferRecord,
  curatedOffers: MarketplaceOffer[],
) {
  return curatedOffers.find(
    (offer) =>
      offer.category === discovered.category &&
      similarityScore(offer.providerName, discovered.providerName) >= 0.82 &&
      similarityScore(offer.title, discovered.name) >= 0.45,
  );
}

function preferOffer(left: NormalizedOfferRecord, right: NormalizedOfferRecord) {
  if (left.isMonetised !== right.isMonetised) {
    return left.isMonetised ? left : right;
  }

  const leftSource = sourcePriority[left.sourceType];
  const rightSource = sourcePriority[right.sourceType];
  if (leftSource !== rightSource) {
    return rightSource > leftSource ? right : left;
  }

  if (left.confidenceScore !== right.confidenceScore) {
    return right.confidenceScore > left.confidenceScore ? right : left;
  }

  return right.lastUpdated > left.lastUpdated ? right : left;
}

function calculateConfidence(raw: RawDiscoveredOffer) {
  let score = raw.reliabilityScore || 0.35;
  score += raw.sourceType === "provider" ? 0.12 : 0;
  score += raw.aprMin !== null && raw.aprMin !== undefined ? 0.08 : 0;
  score += raw.fee ? 0.06 : 0;
  score += raw.amountMin || raw.amountMax ? 0.05 : 0;
  score += raw.termMin || raw.termMax ? 0.05 : 0;
  score += raw.affiliateUrl ? 0.04 : 0;
  score += Math.min(raw.confidenceHints.length * 0.02, 0.1);
  return Math.min(0.98, Number(score.toFixed(2)));
}

function buildMetrics(offer: NormalizedOfferRecord): MarketplaceOffer["metrics"] {
  return [
    { label: offer.isMonetised ? "Status" : "Market data", value: offer.isMonetised ? "Partner offer" : "Estimated" },
    offer.aprMin !== null ? { label: "APR", value: `${offer.aprMin}%` } : null,
    offer.fee ? { label: "Fee", value: offer.fee } : null,
    offer.amountMax ? { label: "Amount", value: `${offer.currency} ${offer.amountMin ?? 0} - ${offer.amountMax}` } : null,
    offer.termMax ? { label: "Term", value: `${offer.termMin ?? 0} - ${offer.termMax} months` } : null,
    { label: "Updated", value: offer.lastUpdated.slice(0, 10) },
  ].filter(Boolean) as MarketplaceOffer["metrics"];
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
