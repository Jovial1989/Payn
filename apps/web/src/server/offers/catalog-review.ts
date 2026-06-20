import { randomUUID } from "node:crypto";
import type { MarketplaceOffer } from "@payn/types";
import {
  fetchAcceptedPrograms,
  fetchProgramMaterials,
  financeadsConfigured,
  pickPrimaryTrackingLink,
  type FinanceAdsProgram,
} from "@/lib/financeads/client";
import { reconcileOfferWithPage } from "@/lib/gemini-reconcile";
import { fetchPageText, resolveUrl } from "@/lib/link-validation";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { normalizeName } from "@/server/offers/discovery/name-utils";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// ─── Catalog Review engine ───────────────────────────────────────────────────
//
// The "is every offer still relevant?" auditor. Runs every 3 days and:
//   1. Link health      — every affiliate link is HTTP-checked (bot-aware).
//   2. Monetisation gaps — every provider is cross-referenced against our
//      accepted FinanceAds partnerships; a partner offer that isn't monetised
//      (or carries a stale link) is auto-healed with the live tracking link.
//   3. Relevance         — a rotating batch is deep-checked with Gemini against
//      the live page (does the link still describe this product?).
//   4. Hygiene           — stale, duplicate, missing-geo, thin-content flags.
//
// Output: a per-offer relevance score (0–100) and one catalog **health score**
// — the headline metric we track over time. Safe fixes auto-apply to the DB;
// everything else is reported.

const LINK_CONCURRENCY = 16;
const DEEP_BATCH = 16;
const STALE_DAYS = 180;
const MAX_AUTO_FIX = 30;

type OfferIssue =
  | "dead_link"
  | "monetization_gap"
  | "wrong_partner_link"
  | "stale"
  | "duplicate"
  | "missing_geo"
  | "thin_content"
  | "irrelevant";

type DbRow = { id: string; slug: string; status: string; attributes: Record<string, unknown> | null };

export type OfferReview = {
  slug: string;
  provider: string;
  title: string;
  category: string;
  monetized: boolean;
  inDb: boolean;
  linkStatus: number | "timeout" | "error";
  linkOk: boolean;
  botProtected: boolean;
  partnerProgramId: number | null;
  issues: OfferIssue[];
  relevanceScore: number;
  deep?: { match: boolean; confidence: number; issues: string[] };
  fixed: string[];
};

export type CatalogReviewReport = {
  configured: boolean;
  applied: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  healthScore: number;
  totals: {
    offers: number;
    linkOk: number;
    deadLinks: number;
    botBlocked: number;
    monetizationGaps: number;
    stale: number;
    duplicates: number;
    thinContent: number;
    deepChecked: number;
    relevanceFails: number;
  };
  partnersAccepted: number;
  monetizationCoveragePct: number;
  autoFixed: { relinked: number; flaggedDead: number };
  worstOffers: OfferReview[];
  monetizationGaps: { provider: string; category: string; programId: number; inDb: boolean }[];
};

function tokens(s: string): Set<string> {
  return new Set(normalizeName(s).split(" ").filter(Boolean));
}
function containment(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  const inter = [...ta].filter((t) => tb.has(t)).length;
  return inter / Math.min(ta.size, tb.size);
}
function matchProgram(providerName: string, title: string, programs: FinanceAdsProgram[]): FinanceAdsProgram | null {
  let best: FinanceAdsProgram | null = null;
  let bestScore = 0.8;
  for (const p of programs) {
    const score = Math.max(containment(p.name, providerName), containment(p.name, title));
    if (score >= bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function daysSince(iso?: string | null): number {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 86_400_000;
}

function scoreOffer(r: OfferReview): number {
  if (r.issues.includes("dead_link")) return 0;
  let s = 100;
  if (r.issues.includes("irrelevant")) s -= 50;
  if (r.issues.includes("monetization_gap")) s -= 20;
  if (r.issues.includes("wrong_partner_link")) s -= 10;
  if (r.issues.includes("stale")) s -= 10;
  if (r.issues.includes("missing_geo")) s -= 10;
  if (r.issues.includes("thin_content")) s -= 10;
  if (r.issues.includes("duplicate")) s -= 5;
  return Math.max(0, Math.min(100, s));
}

function dbRowFromOffer(offer: MarketplaceOffer, trackingUrl: string, program: FinanceAdsProgram, existingId?: string) {
  const now = new Date().toISOString();
  return {
    id: existingId ?? randomUUID(),
    slug: offer.slug,
    provider_name: offer.providerName,
    provider_mark: offer.providerMark || offer.providerName.slice(0, 2).toUpperCase(),
    provider_website_url: offer.providerWebsiteUrl || "",
    title: offer.title,
    subtitle: offer.subtitle || "",
    category: offer.category,
    country_codes: offer.countryCodes?.length ? offer.countryCodes : ["EU"],
    affiliate_link: trackingUrl,
    link_type: "affiliate_redirect",
    affiliate_priority_score: Math.max(offer.affiliatePriorityScore ?? 0, 0.9),
    best_for: offer.bestFor ?? [],
    metrics: offer.metrics ?? [],
    bullets: offer.bullets ?? null,
    is_monetised: true,
    status: "active",
    attributes: {
      ...(offer.attributes ?? {}),
      monetized: true,
      affiliate: true,
      isPartner: true,
      dataSource: "affiliate",
      financeads: {
        programId: program.id,
        programName: program.name,
        country: program.countryIso2,
        cookieDays: program.cookieDurationDays,
        syncedAt: now,
      },
      review: { lastReviewedAt: now },
    },
    updated_at: now,
  };
}

export async function runCatalogReview({ apply = false }: { apply?: boolean } = {}): Promise<CatalogReviewReport> {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client unavailable");

  const [offers, programs, dbRes] = await Promise.all([
    listMarketplaceOffers(),
    financeadsConfigured() ? fetchAcceptedPrograms().catch(() => []) : Promise.resolve([]),
    admin.from("product_offers").select("id, slug, status, attributes"),
  ]);
  const dbBySlug = new Map<string, DbRow>();
  for (const row of (dbRes.data ?? []) as DbRow[]) dbBySlug.set(row.slug, row);

  // duplicate detection: provider+category seen more than once
  const provCatCount = new Map<string, number>();
  for (const o of offers) {
    const k = `${normalizeName(o.providerName)}::${o.category}`;
    provCatCount.set(k, (provCatCount.get(k) ?? 0) + 1);
  }

  // 1) cheap pass over EVERY offer: link health + partner match + hygiene
  const reviews = await mapWithConcurrency(offers, LINK_CONCURRENCY, async (offer): Promise<OfferReview> => {
    const link = offer.affiliateLink || offer.providerWebsiteUrl || "";
    const res = link ? await resolveUrl(link) : { alive: false, status: "error" as const, botProtected: false, finalHost: null, finalUrl: "" };
    const monetized = Boolean(offer.attributes?.monetized);
    const program = matchProgram(offer.providerName, offer.title, programs);
    const issues: OfferIssue[] = [];

    if (!res.alive && !res.botProtected) issues.push("dead_link");
    if (program && !monetized) issues.push("monetization_gap");
    if (program && monetized && link && !link.includes("financeads.net")) issues.push("wrong_partner_link");
    if (daysSince(offer.updatedAt) > STALE_DAYS) issues.push("stale");
    if (!offer.countryCodes || offer.countryCodes.length === 0) issues.push("missing_geo");
    if (!offer.metrics || offer.metrics.length === 0 || !offer.subtitle) issues.push("thin_content");
    if ((provCatCount.get(`${normalizeName(offer.providerName)}::${offer.category}`) ?? 0) > 1) issues.push("duplicate");

    const review: OfferReview = {
      slug: offer.slug,
      provider: offer.providerName,
      title: offer.title,
      category: offer.category,
      monetized,
      inDb: dbBySlug.has(offer.slug),
      linkStatus: res.status,
      linkOk: res.alive,
      botProtected: res.botProtected,
      partnerProgramId: program?.id ?? null,
      issues,
      relevanceScore: 0,
      fixed: [],
    };
    review.relevanceScore = scoreOffer(review);
    return review;
  });

  const reviewBySlug = new Map(reviews.map((r) => [r.slug, r]));
  const offerBySlug = new Map(offers.map((o) => [o.slug, o]));

  // 2) deep relevance — rotating batch of alive offers, least-recently reviewed first
  const deepCandidates = reviews
    .filter((r) => r.linkOk && !r.botProtected && !r.issues.includes("dead_link"))
    .sort((a, b) => {
      const aT = daysSince((dbBySlug.get(a.slug)?.attributes?.review as { lastReviewedAt?: string } | undefined)?.lastReviewedAt);
      const bT = daysSince((dbBySlug.get(b.slug)?.attributes?.review as { lastReviewedAt?: string } | undefined)?.lastReviewedAt);
      return bT - aT; // oldest (largest daysSince) first
    })
    .slice(0, DEEP_BATCH);

  await mapWithConcurrency(deepCandidates, 4, async (r) => {
    const offer = offerBySlug.get(r.slug);
    if (!offer) return;
    const page = await fetchPageText(offer.affiliateLink || offer.providerWebsiteUrl || "");
    if (!page.ok || page.botProtected || page.text.length < 200) return; // can't verify
    try {
      const verdict = await reconcileOfferWithPage(
        {
          title: offer.title,
          subtitle: offer.subtitle,
          category: offer.category,
          providerName: offer.providerName,
          affiliateLink: offer.affiliateLink,
          metrics: offer.metrics ?? [],
          attributes: (offer.attributes ?? {}) as Record<string, unknown>,
        },
        page.text,
      );
      r.deep = { match: verdict.match, confidence: verdict.confidence, issues: verdict.issues };
      if (!verdict.match && verdict.confidence >= 0.7) {
        r.issues.push("irrelevant");
        r.relevanceScore = scoreOffer(r);
      }
    } catch {
      /* skip on Gemini error */
    }
  });

  // 3) auto-fix (DB-safe) + monetisation gap healing
  let relinked = 0;
  let flaggedDead = 0;
  const trackingCache = new Map<number, string | null>();
  async function trackingFor(programId: number): Promise<string | null> {
    if (trackingCache.has(programId)) return trackingCache.get(programId)!;
    let url: string | null = null;
    try {
      const primary = pickPrimaryTrackingLink(await fetchProgramMaterials(programId));
      url = primary?.trackingUrl ?? null;
    } catch {
      url = null;
    }
    trackingCache.set(programId, url);
    return url;
  }

  if (apply) {
    const now = new Date().toISOString();
    let fixes = 0;
    // 3a) heal monetisation gaps + wrong partner links (static or DB) by upserting a DB row
    for (const r of reviews) {
      if (fixes >= MAX_AUTO_FIX) break;
      if (!r.partnerProgramId) continue;
      if (!r.issues.includes("monetization_gap") && !r.issues.includes("wrong_partner_link")) continue;
      const program = programs.find((p) => p.id === r.partnerProgramId);
      const offer = offerBySlug.get(r.slug);
      if (!program || !offer) continue;
      const trackingUrl = await trackingFor(program.id);
      if (!trackingUrl) continue;
      // only heal when the live tracking link actually resolves
      const tr = await resolveUrl(trackingUrl);
      if (!tr.alive) continue;
      const existing = dbBySlug.get(r.slug);
      const row = dbRowFromOffer(offer, trackingUrl, program, existing?.id);
      const { error } = existing
        ? await admin.from("product_offers").update(row).eq("id", existing.id)
        : await admin.from("product_offers").insert(row);
      if (!error) {
        relinked += 1;
        fixes += 1;
        r.fixed.push("monetised with live partner link");
      }
    }
    // 3b) flag dead links on DB-resident offers for human review
    for (const r of reviews) {
      if (!r.issues.includes("dead_link")) continue;
      const existing = dbBySlug.get(r.slug);
      if (!existing || existing.status === "needs_review") continue;
      const { error } = await admin
        .from("product_offers")
        .update({ status: "needs_review", notes: `Catalog review ${now.slice(0, 10)}: link ${r.linkStatus}` })
        .eq("id", existing.id);
      if (!error) {
        flaggedDead += 1;
        r.fixed.push("flagged needs_review (dead link)");
      }
    }
    // 3c) stamp lastReviewedAt on deep-reviewed DB offers (for rotation)
    for (const r of deepCandidates) {
      const existing = dbBySlug.get(r.slug);
      if (!existing) continue;
      const attrs = { ...(existing.attributes ?? {}), review: { lastReviewedAt: now, relevanceScore: r.relevanceScore } };
      await admin.from("product_offers").update({ attributes: attrs }).eq("id", existing.id);
    }
  }

  // 4) aggregate + health score
  const partnerEligible = reviews.filter((r) => r.partnerProgramId);
  const monetizedPartners = partnerEligible.filter((r) => r.monetized && !r.issues.includes("wrong_partner_link"));
  const healthScore = reviews.length
    ? Math.round(reviews.reduce((sum, r) => sum + r.relevanceScore, 0) / reviews.length)
    : 0;

  const gaps = reviews
    .filter((r) => r.issues.includes("monetization_gap") && r.partnerProgramId && r.fixed.length === 0)
    .map((r) => ({ provider: r.provider, category: r.category, programId: r.partnerProgramId as number, inDb: r.inDb }));

  const report: CatalogReviewReport = {
    configured: financeadsConfigured(),
    applied: apply,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    healthScore,
    totals: {
      offers: reviews.length,
      linkOk: reviews.filter((r) => r.linkOk).length,
      deadLinks: reviews.filter((r) => r.issues.includes("dead_link")).length,
      botBlocked: reviews.filter((r) => r.botProtected).length,
      monetizationGaps: reviews.filter((r) => r.issues.includes("monetization_gap")).length,
      stale: reviews.filter((r) => r.issues.includes("stale")).length,
      duplicates: reviews.filter((r) => r.issues.includes("duplicate")).length,
      thinContent: reviews.filter((r) => r.issues.includes("thin_content")).length,
      deepChecked: deepCandidates.filter((r) => r.deep).length,
      relevanceFails: reviews.filter((r) => r.issues.includes("irrelevant")).length,
    },
    partnersAccepted: programs.length,
    monetizationCoveragePct: partnerEligible.length
      ? Math.round((monetizedPartners.length / partnerEligible.length) * 100)
      : 100,
    autoFixed: { relinked, flaggedDead },
    worstOffers: reviews
      .filter((r) => r.issues.length > 0)
      .sort((a, b) => a.relevanceScore - b.relevanceScore)
      .slice(0, 40),
    monetizationGaps: gaps,
  };

  if (apply) {
    await admin.from("admin_audit_log").insert({
      action: "catalog_review",
      metadata: {
        healthScore: report.healthScore,
        coverage: report.monetizationCoveragePct,
        deadLinks: report.totals.deadLinks,
        gaps: report.totals.monetizationGaps,
        relinked,
        flaggedDead,
      },
    });
  }

  return report;
}
