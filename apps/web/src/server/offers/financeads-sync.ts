import { env } from "@/lib/env";
import {
  fetchAcceptedPrograms,
  fetchProgramMaterials,
  financeadsConfigured,
  pickPrimaryTrackingLink,
  type FinanceAdsProgram,
} from "@/lib/financeads/client";
import { isBlockedProvider } from "@/lib/blocked-providers";
import { resolveUrl } from "@/lib/link-validation";
import { normalizeName } from "@/server/offers/discovery/name-utils";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// ─── Engine #1: FinanceAds → catalog sync ────────────────────────────────────
//
// Pulls every ACCEPTED partnership + its canonical tracking link, matches each
// program to the provider's product_offers rows, and (on apply) marks those
// offers monetised with the *live* affiliate link. Dry-run first, then apply —
// so a human eyeballs the match report before any link is written.

const MATCH_THRESHOLD = 0.8;
const MATERIAL_CONCURRENCY = 5;
const MONETISED_PRIORITY_FLOOR = 0.9;

type OfferRow = {
  id: string;
  slug: string;
  provider_name: string;
  title: string;
  category: string;
  affiliate_link: string | null;
  is_monetised: boolean | null;
  attributes: Record<string, unknown> | null;
  affiliate_priority_score: number | string | null;
  status: string;
};

export type MatchedOffer = {
  id: string;
  slug: string;
  providerName: string;
  title: string;
  category: string;
  currentLink: string;
  alreadyMonetised: boolean;
  willChange: boolean;
  score: number;
};

export type ProgramSyncRow = {
  programId: number;
  programName: string;
  providerCore: string;
  country: string | null;
  commission: string;
  cookieDays: number | null;
  trackingUrl: string | null;
  materialId: number | null;
  outcome: "matched" | "no_material" | "unmatched" | "error";
  matchedOffers: MatchedOffer[];
  error?: string;
};

export type FinanceAdsSyncReport = {
  configured: boolean;
  applied: boolean;
  adspace: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  programsTotal: number;
  withTrackingLink: number;
  matchedPrograms: number;
  unmatchedPrograms: number;
  offersUpdated: number;
  rows: ProgramSyncRow[];
};

/** token-set containment: |A∩B| / min(|A|,|B|) — "wise" ⊂ "wise international" = 1. */
function containment(a: string, b: string): number {
  const ta = new Set(normalizeName(a).split(" ").filter(Boolean));
  const tb = new Set(normalizeName(b).split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  const inter = [...ta].filter((t) => tb.has(t)).length;
  return inter / Math.min(ta.size, tb.size);
}

function scoreProgramAgainstOffer(program: FinanceAdsProgram, offer: OfferRow): number {
  const byProvider = containment(program.name, offer.provider_name);
  const byTitle = containment(program.name, offer.title);
  return Math.max(byProvider, byTitle);
}

function commissionSummary(p: FinanceAdsProgram): string {
  const fmt = (label: string, band: FinanceAdsProgram["commission"]["sale"]) => {
    if (!band || (band.min == null && band.max == null)) return null;
    const unit = band.unit ?? "";
    const lo = band.min ?? 0;
    const hi = band.max ?? lo;
    const range = lo === hi ? `${lo}${unit}` : `${lo}–${hi}${unit}`;
    return `${range} ${label}`;
  };
  const parts = [
    fmt("sale", p.commission.sale),
    fmt("lead", p.commission.lead),
    fmt("fix", p.commission.fix),
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Run the FinanceAds sync. `apply: false` (default) only reports; `apply: true`
 * writes monetised links to product_offers.
 */
export async function runFinanceAdsSync({
  apply = false,
}: { apply?: boolean } = {}): Promise<FinanceAdsSyncReport> {
  const startedAt = new Date().toISOString();
  const started = Date.now();

  const base = (extra: Partial<FinanceAdsSyncReport>): FinanceAdsSyncReport => ({
    configured: financeadsConfigured(),
    applied: apply,
    adspace: env.financeadsAdspace,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    programsTotal: 0,
    withTrackingLink: 0,
    matchedPrograms: 0,
    unmatchedPrograms: 0,
    offersUpdated: 0,
    rows: [],
    ...extra,
  });

  if (!financeadsConfigured()) {
    return base({});
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client unavailable");
  }

  // 1) Live programs + offers in parallel.
  const [programs, offerResult] = await Promise.all([
    fetchAcceptedPrograms(),
    admin
      .from("product_offers")
      .select(
        "id, slug, provider_name, title, category, affiliate_link, is_monetised, attributes, affiliate_priority_score, status",
      )
      .neq("status", "archived"),
  ]);

  if (offerResult.error) {
    throw new Error(`Supabase read failed: ${offerResult.error.message}`);
  }
  const offers = (offerResult.data ?? []) as OfferRow[];

  // 2) Resolve the canonical tracking link for each program (bounded parallel).
  const rows = await mapWithConcurrency(programs, MATERIAL_CONCURRENCY, async (program): Promise<ProgramSyncRow> => {
    const rowBase: ProgramSyncRow = {
      programId: program.id,
      programName: program.name,
      providerCore: normalizeName(program.name),
      country: program.countryIso2,
      commission: commissionSummary(program),
      cookieDays: program.cookieDurationDays,
      trackingUrl: null,
      materialId: null,
      outcome: "unmatched",
      matchedOffers: [],
    };

    let trackingUrl: string | null = null;
    let materialId: number | null = null;
    try {
      const materials = await fetchProgramMaterials(program.id);
      const primary = pickPrimaryTrackingLink(materials);
      if (primary) {
        // Validate the link actually lands somewhere real before we trust it.
        // Catches dead-ends like an "unauthorised-ad" page (200 but useless)
        // or a 404 landing, so the sync never writes a broken affiliate link.
        const check = await resolveUrl(primary.trackingUrl);
        if (check.alive) {
          trackingUrl = primary.trackingUrl;
          materialId = primary.materialId;
        } else {
          return {
            ...rowBase,
            outcome: "no_material",
            error: `tracking link dead-ends (status ${check.status}) → not applied`,
          };
        }
      }
    } catch (e) {
      return { ...rowBase, outcome: "error", error: e instanceof Error ? e.message : "materials fetch failed" };
    }

    if (!trackingUrl) {
      return { ...rowBase, outcome: "no_material" };
    }

    // 3) Match this program to provider offers.
    const matched: MatchedOffer[] = offers
      .map((offer) => ({ offer, score: scoreProgramAgainstOffer(program, offer) }))
      .filter(({ offer, score }) => score >= MATCH_THRESHOLD && !isBlockedProvider(offer.provider_name))
      .map(({ offer, score }) => {
        const alreadyMonetised =
          Boolean(offer.is_monetised) || Boolean(offer.attributes?.monetized);
        const linkDiffers = (offer.affiliate_link ?? "") !== trackingUrl;
        return {
          id: offer.id,
          slug: offer.slug,
          providerName: offer.provider_name,
          title: offer.title,
          category: offer.category,
          currentLink: offer.affiliate_link ?? "",
          alreadyMonetised,
          willChange: linkDiffers || !alreadyMonetised,
          score: Number(score.toFixed(2)),
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      ...rowBase,
      trackingUrl,
      materialId,
      outcome: matched.length > 0 ? "matched" : "unmatched",
      matchedOffers: matched,
    };
  });

  // 4) Apply: write monetised links to the matched offers that need it.
  let offersUpdated = 0;
  if (apply) {
    const now = new Date().toISOString();
    for (const row of rows) {
      if (row.outcome !== "matched" || !row.trackingUrl) continue;
      for (const m of row.matchedOffers) {
        if (!m.willChange) continue;
        const offer = offers.find((o) => o.id === m.id);
        const prevAttrs = (offer?.attributes ?? {}) as Record<string, unknown>;
        const prevScore = Number(offer?.affiliate_priority_score) || 0;
        const attributes: Record<string, unknown> = {
          ...prevAttrs,
          monetized: true,
          affiliate: true,
          isPartner: true,
          dataSource: "affiliate",
          financeads: {
            programId: row.programId,
            programName: row.programName,
            materialId: row.materialId,
            country: row.country,
            cookieDays: row.cookieDays,
            commission: row.commission,
            syncedAt: now,
          },
        };
        const { error } = await admin
          .from("product_offers")
          .update({
            affiliate_link: row.trackingUrl,
            is_monetised: true,
            link_type: "affiliate_redirect",
            affiliate_priority_score: Math.max(prevScore, MONETISED_PRIORITY_FLOOR),
            attributes,
            updated_at: now,
          })
          .eq("id", m.id);
        if (!error) offersUpdated += 1;
      }
    }

    // Audit trail + bust the 1h catalog cache so changes surface immediately.
    await admin.from("admin_audit_log").insert({
      action: "financeads_sync",
      metadata: {
        programs: rows.length,
        offers_updated: offersUpdated,
        adspace: env.financeadsAdspace,
      },
    });
  }

  const withTrackingLink = rows.filter((r) => r.trackingUrl).length;
  const matchedPrograms = rows.filter((r) => r.outcome === "matched").length;

  return base({
    programsTotal: programs.length,
    withTrackingLink,
    matchedPrograms,
    unmatchedPrograms: rows.filter((r) => r.outcome === "unmatched").length,
    offersUpdated,
    rows,
  });
}
