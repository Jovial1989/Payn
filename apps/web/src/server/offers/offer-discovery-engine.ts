import { randomUUID } from "node:crypto";
import type { MarketplaceCategory } from "@payn/types";
import { financeadsConfigured } from "@/lib/financeads/client";
import {
  correctProviderUrl,
  discoverMarketOffers,
  researchProgramOffer,
  type GeminiOfferDraft,
} from "@/lib/gemini-discovery";
import { hostMatchesDomain, resolveUrl } from "@/lib/link-validation";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { slugify } from "@/server/offers/discovery/name-utils";
import { runFinanceAdsSync, type ProgramSyncRow } from "@/server/offers/financeads-sync";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// ─── Engine #2: Gemini market discovery ──────────────────────────────────────
//
// Two modes:
//   • "programs" — backfill ACCEPTED FinanceAds programs that have no catalog
//     offer yet. We already hold the partnership + tracking link, so these are
//     monetised. Gemini supplies the product data; we verify the link lands on
//     the right domain before publishing.
//   • "market" — surface real providers in a category we don't list. Matched to
//     a FinanceAds program where one exists (→ monetised), else informational.
//
// Publish bar (decision: auto-publish if verified): confidence ≥ threshold AND
// the provider domain is reachable AND, for monetised offers, the tracking link
// redirects to that domain. Anything short of that is saved as `needs_review`,
// never discarded.

const PROGRAM_PUBLISH_CONFIDENCE = 0.8;
const MARKET_PUBLISH_CONFIDENCE = 0.85;
const MAX_PER_RUN = 14; // keep inside the 300s route ceiling

export type DiscoveryDecision =
  | "published"
  | "needs_review"
  | "skipped_duplicate"
  | "skipped_invalid"
  | "skipped_quota";

/** How many offers the discovery engine has added in the last `days` days. */
export async function countRecentDiscoveries(days = 7): Promise<number> {
  const admin = createSupabaseAdminClient();
  if (!admin) return 0;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  // ISO timestamps compare lexicographically, so a text gte is chronological.
  const { count } = await admin
    .from("product_offers")
    .select("*", { count: "exact", head: true })
    .gte("attributes->discovery->>discoveredAt", since);
  return count ?? 0;
}

export type DiscoveryItem = {
  source: "program" | "market";
  programId: number | null;
  providerName: string;
  providerDomain: string;
  category: MarketplaceCategory;
  title: string;
  countryCodes: string[];
  confidence: number;
  monetized: boolean;
  trackingUrl: string | null;
  domainAlive: boolean;
  trackingMatches: boolean | null;
  verified: boolean;
  decision: DiscoveryDecision;
  reason: string;
  offerId?: string;
  slug?: string;
};

export type DiscoveryReport = {
  configured: boolean;
  applied: boolean;
  mode: "programs" | "market";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  considered: number;
  published: number;
  queued: number;
  skipped: number;
  capped: boolean;
  items: DiscoveryItem[];
};

type ExistingIndex = {
  slugs: Set<string>;
  providerCategories: Set<string>;
};

async function loadExistingIndex(): Promise<{ index: ExistingIndex; providerNames: string[] }> {
  const offers = await listMarketplaceOffers();
  const slugs = new Set<string>();
  const providerCategories = new Set<string>();
  const providerNames = new Set<string>();
  for (const offer of offers) {
    slugs.add(offer.slug);
    providerCategories.add(`${slugify(offer.providerName)}::${offer.category}`);
    providerNames.add(offer.providerName);
  }
  return { index: { slugs, providerCategories }, providerNames: [...providerNames] };
}

function providerMark(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Verify a draft's domain is reachable, and (if monetised) that the tracking link lands there. */
async function validateDraft(draft: GeminiOfferDraft, trackingUrl: string | null) {
  let providerUrl = `https://${draft.providerDomain}`;
  let domainRes = await resolveUrl(providerUrl);
  let corrected: string | null = null;

  // Self-correction: if the proposed provider page doesn't render, ask grounded
  // Gemini for the correct current official URL and re-verify (up to 2 tries).
  // A link is only ever accepted after it passes resolveUrl — so a hallucinated
  // or dead URL can never reach the catalog.
  let tries = 0;
  while (!domainRes.alive && tries < 2) {
    tries += 1;
    const fix = await correctProviderUrl({
      providerName: draft.providerName,
      providerDomain: draft.providerDomain,
      category: draft.category,
      badUrl: providerUrl,
      reason: `status ${domainRes.status}`,
    });
    if (!fix || fix === providerUrl) break;
    const recheck = await resolveUrl(fix);
    if (recheck.alive) {
      providerUrl = fix;
      domainRes = recheck;
      corrected = fix;
      break;
    }
    providerUrl = fix; // feed the next correction attempt the latest failed URL
    domainRes = recheck;
  }
  const domainAlive = domainRes.alive;

  let trackingMatches: boolean | null = null;
  if (trackingUrl) {
    const trackRes = await resolveUrl(trackingUrl);
    // The tracking URL 30x-redirects through FinanceAds to the provider.
    trackingMatches =
      trackRes.alive && hostMatchesDomain(trackRes.finalHost, draft.providerDomain);
  }
  return { providerUrl, domainAlive, trackingMatches, corrected };
}

function buildInsertRow(args: {
  draft: GeminiOfferDraft;
  providerUrl: string;
  trackingUrl: string | null;
  monetized: boolean;
  status: "active" | "needs_review";
  programRow: ProgramSyncRow | null;
  source: "program" | "market";
}) {
  const { draft, providerUrl, trackingUrl, monetized, status, programRow, source } = args;
  const now = new Date().toISOString();
  const slug = slugify(`${draft.providerName}-${draft.title}`) || slugify(draft.providerName);
  const id = randomUUID();

  const attributes: Record<string, unknown> = {
    monetized,
    affiliate: monetized,
    isPartner: monetized,
    dataSource: monetized ? "affiliate" : "marketplace",
    confidenceScore: draft.confidence,
    searchTags: draft.searchTags,
    informational: !monetized,
    discovery: {
      engine: "gemini-2.5-flash",
      source,
      reasoning: draft.reasoning,
      discoveredAt: now,
    },
    ...(monetized && programRow
      ? {
          financeads: {
            programId: programRow.programId,
            programName: programRow.programName,
            materialId: programRow.materialId,
            country: programRow.country,
            cookieDays: programRow.cookieDays,
            commission: programRow.commission,
            syncedAt: now,
          },
        }
      : {}),
  };

  return {
    id,
    slug,
    provider_name: draft.providerName,
    provider_mark: providerMark(draft.providerName),
    provider_website_url: providerUrl,
    title: draft.title,
    subtitle: draft.subtitle,
    category: draft.category,
    country_codes: draft.countryCodes.length ? draft.countryCodes : ["EU"],
    affiliate_link: trackingUrl ?? providerUrl,
    link_type: "affiliate_redirect",
    affiliate_priority_score: monetized ? 0.9 : 0.4,
    best_for: draft.bestFor,
    metrics: draft.metrics,
    attributes,
    bullets: null,
    is_monetised: monetized,
    status,
    last_ai_enrichment_at: now,
    updated_at: now,
  };
}

async function runProgramBackfill({ apply, maxNew = Infinity }: { apply: boolean; maxNew?: number }): Promise<DiscoveryReport> {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const items: DiscoveryItem[] = [];
  let inserted = 0;

  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client unavailable");

  // Find programs we're partnered with but don't list, that have a tracking link.
  const sync = await runFinanceAdsSync({ apply: false });
  const candidates = sync.rows.filter((r) => r.outcome === "unmatched" && r.trackingUrl);
  const capped = candidates.length > MAX_PER_RUN;
  const slice = candidates.slice(0, MAX_PER_RUN);

  const { index } = await loadExistingIndex();

  for (const programRow of slice) {
    const draft = await researchProgramOffer({
      programName: programRow.programName,
      country: programRow.country,
      commission: programRow.commission,
      descriptionShort: null,
    });

    if (!draft) {
      items.push(invalidItem("program", programRow, "Gemini could not resolve a provider"));
      continue;
    }

    const slug = slugify(`${draft.providerName}-${draft.title}`) || slugify(draft.providerName);
    const provCat = `${slugify(draft.providerName)}::${draft.category}`;
    if (index.slugs.has(slug) || index.providerCategories.has(provCat)) {
      items.push(dupeItem("program", programRow, draft));
      continue;
    }

    const { providerUrl, domainAlive, trackingMatches } = await validateDraft(
      draft,
      programRow.trackingUrl,
    );
    const verified =
      draft.confidence >= PROGRAM_PUBLISH_CONFIDENCE && domainAlive && trackingMatches === true;
    const status: "active" | "needs_review" = verified ? "active" : "needs_review";

    const item: DiscoveryItem = {
      source: "program",
      programId: programRow.programId,
      providerName: draft.providerName,
      providerDomain: draft.providerDomain,
      category: draft.category,
      title: draft.title,
      countryCodes: draft.countryCodes,
      confidence: draft.confidence,
      monetized: true,
      trackingUrl: programRow.trackingUrl,
      domainAlive,
      trackingMatches,
      verified,
      decision: verified ? "published" : "needs_review",
      reason: verified
        ? "Partnered + link verified to provider domain"
        : reviewReason(draft.confidence, PROGRAM_PUBLISH_CONFIDENCE, domainAlive, trackingMatches),
      slug,
    };

    if (apply) {
      if (inserted >= maxNew) {
        item.decision = "skipped_quota";
        item.reason = `weekly new-offer quota reached (${maxNew})`;
      } else {
        const row = buildInsertRow({
          draft,
          providerUrl,
          trackingUrl: programRow.trackingUrl,
          monetized: true,
          status,
          programRow,
          source: "program",
        });
        const { error } = await admin.from("product_offers").insert(row);
        if (error) {
          item.decision = "skipped_invalid";
          item.reason = `DB insert failed: ${error.message}`;
        } else {
          inserted += 1;
          item.offerId = row.id;
          index.slugs.add(slug);
          index.providerCategories.add(provCat);
        }
      }
    }

    items.push(item);
  }

  if (apply) {
    await admin.from("admin_audit_log").insert({
      action: "offer_discovery_programs",
      metadata: {
        considered: slice.length,
        published: items.filter((i) => i.decision === "published").length,
        queued: items.filter((i) => i.decision === "needs_review").length,
      },
    });
  }

  return summarize("programs", apply, startedAt, started, slice.length, capped, items);
}

async function runMarketDiscovery({
  apply,
  categories,
  country,
  maxNew = Infinity,
}: {
  apply: boolean;
  categories: MarketplaceCategory[];
  country: string;
  maxNew?: number;
}): Promise<DiscoveryReport> {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const items: DiscoveryItem[] = [];
  let inserted = 0;

  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client unavailable");

  const { index, providerNames } = await loadExistingIndex();

  // Pull the FinanceAds sync once so we can monetise any market find we're
  // already partnered with.
  const sync = financeadsConfigured() ? await runFinanceAdsSync({ apply: false }) : null;

  let considered = 0;
  let capped = false;

  for (const category of categories) {
    if (items.length >= MAX_PER_RUN) {
      capped = true;
      break;
    }
    const drafts = await discoverMarketOffers({
      category,
      country,
      existingProviders: providerNames,
      limit: 6,
    });

    for (const draft of drafts) {
      if (items.length >= MAX_PER_RUN) {
        capped = true;
        break;
      }
      considered += 1;

      const slug = slugify(`${draft.providerName}-${draft.title}`) || slugify(draft.providerName);
      const provCat = `${slugify(draft.providerName)}::${draft.category}`;
      if (index.slugs.has(slug) || index.providerCategories.has(provCat)) {
        items.push(dupeItemFromDraft("market", draft));
        continue;
      }

      // Is there a FinanceAds program for this provider? → monetise it.
      const programRow = matchDraftToProgram(draft, sync?.rows ?? []);
      const trackingUrl = programRow?.trackingUrl ?? null;
      const monetized = Boolean(trackingUrl);

      const { providerUrl, domainAlive, trackingMatches } = await validateDraft(draft, trackingUrl);
      const verified =
        draft.confidence >= MARKET_PUBLISH_CONFIDENCE &&
        domainAlive &&
        (!monetized || trackingMatches === true);
      const status: "active" | "needs_review" = verified ? "active" : "needs_review";

      const item: DiscoveryItem = {
        source: "market",
        programId: programRow?.programId ?? null,
        providerName: draft.providerName,
        providerDomain: draft.providerDomain,
        category: draft.category,
        title: draft.title,
        countryCodes: draft.countryCodes,
        confidence: draft.confidence,
        monetized,
        trackingUrl,
        domainAlive,
        trackingMatches,
        verified,
        decision: verified ? "published" : "needs_review",
        reason: verified
          ? monetized
            ? "Matched a FinanceAds program + link verified"
            : "Domain verified (informational, not monetised)"
          : reviewReason(draft.confidence, MARKET_PUBLISH_CONFIDENCE, domainAlive, trackingMatches),
        slug,
      };

      if (apply) {
        if (inserted >= maxNew) {
          item.decision = "skipped_quota";
          item.reason = `weekly new-offer quota reached (${maxNew})`;
        } else {
          const row = buildInsertRow({
            draft,
            providerUrl,
            trackingUrl,
            monetized,
            status,
            programRow,
            source: "market",
          });
          const { error } = await admin.from("product_offers").insert(row);
          if (error) {
            item.decision = "skipped_invalid";
            item.reason = `DB insert failed: ${error.message}`;
          } else {
            inserted += 1;
            item.offerId = row.id;
            index.slugs.add(slug);
            index.providerCategories.add(provCat);
          }
        }
      }

      items.push(item);
    }
  }

  if (apply) {
    await admin.from("admin_audit_log").insert({
      action: "offer_discovery_market",
      metadata: {
        categories,
        country,
        published: items.filter((i) => i.decision === "published").length,
        queued: items.filter((i) => i.decision === "needs_review").length,
      },
    });
  }

  return summarize("market", apply, startedAt, started, considered, capped, items);
}

function matchDraftToProgram(draft: GeminiOfferDraft, rows: ProgramSyncRow[]): ProgramSyncRow | null {
  const target = slugify(draft.providerName);
  let best: ProgramSyncRow | null = null;
  for (const row of rows) {
    if (!row.trackingUrl) continue;
    const core = slugify(row.programName);
    if (core.includes(target) || target.includes(core)) {
      best = row;
      break;
    }
  }
  return best;
}

function reviewReason(
  confidence: number,
  bar: number,
  domainAlive: boolean,
  trackingMatches: boolean | null,
): string {
  const reasons: string[] = [];
  if (confidence < bar) reasons.push(`confidence ${confidence.toFixed(2)} < ${bar}`);
  if (!domainAlive) reasons.push("provider domain unreachable");
  if (trackingMatches === false) reasons.push("tracking link did not resolve to provider domain");
  return reasons.join("; ") || "held for review";
}

function invalidItem(source: "program" | "market", row: ProgramSyncRow, reason: string): DiscoveryItem {
  return {
    source,
    programId: row.programId,
    providerName: row.programName,
    providerDomain: "",
    category: "banking",
    title: row.programName,
    countryCodes: [],
    confidence: 0,
    monetized: true,
    trackingUrl: row.trackingUrl,
    domainAlive: false,
    trackingMatches: null,
    verified: false,
    decision: "skipped_invalid",
    reason,
  };
}

function dupeItem(source: "program" | "market", row: ProgramSyncRow, draft: GeminiOfferDraft): DiscoveryItem {
  return {
    source,
    programId: row.programId,
    providerName: draft.providerName,
    providerDomain: draft.providerDomain,
    category: draft.category,
    title: draft.title,
    countryCodes: draft.countryCodes,
    confidence: draft.confidence,
    monetized: true,
    trackingUrl: row.trackingUrl,
    domainAlive: false,
    trackingMatches: null,
    verified: false,
    decision: "skipped_duplicate",
    reason: "Provider already in catalog",
  };
}

function dupeItemFromDraft(source: "program" | "market", draft: GeminiOfferDraft): DiscoveryItem {
  return {
    source,
    programId: null,
    providerName: draft.providerName,
    providerDomain: draft.providerDomain,
    category: draft.category,
    title: draft.title,
    countryCodes: draft.countryCodes,
    confidence: draft.confidence,
    monetized: false,
    trackingUrl: null,
    domainAlive: false,
    trackingMatches: null,
    verified: false,
    decision: "skipped_duplicate",
    reason: "Provider already in catalog",
  };
}

function summarize(
  mode: "programs" | "market",
  applied: boolean,
  startedAt: string,
  started: number,
  considered: number,
  capped: boolean,
  items: DiscoveryItem[],
): DiscoveryReport {
  return {
    configured: financeadsConfigured(),
    applied,
    mode,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    considered,
    published: items.filter((i) => i.decision === "published").length,
    queued: items.filter((i) => i.decision === "needs_review").length,
    skipped: items.filter((i) => i.decision.startsWith("skipped")).length,
    capped,
    items,
  };
}

export async function runOfferDiscovery(opts: {
  apply?: boolean;
  mode?: "programs" | "market";
  categories?: MarketplaceCategory[];
  country?: string;
  /** Cap on net-new offers added this run (used by the weekly cron quota). */
  maxNew?: number;
}): Promise<DiscoveryReport> {
  const apply = opts.apply ?? false;
  const mode = opts.mode ?? "programs";
  const maxNew = opts.maxNew ?? Infinity;
  if (mode === "market") {
    const categories =
      opts.categories && opts.categories.length > 0 ? opts.categories : (["transfers", "cards", "savings"] as MarketplaceCategory[]);
    return runMarketDiscovery({ apply, categories, country: opts.country ?? "EU", maxNew });
  }
  return runProgramBackfill({ apply, maxNew });
}
