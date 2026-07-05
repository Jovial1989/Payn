import { env } from "@/lib/env";

// ─── FinanceAds affiliate API client ─────────────────────────────────────────
//
// Wraps the two endpoints we use:
//   • GET /programs/partnerships          → which advertisers we're approved with
//   • GET /program/{id}/advertisingmaterials → the tracking (affiliate) links
//
// Auth quirk: the partnerships endpoint accepts a Bearer token, but the
// advertising-materials endpoint only honours `api_key` as a query param. We
// send BOTH on every request so either endpoint is satisfied. The api_key is
// read from env and never logged or returned to the client.
//
// Response envelope is always { success, message: string[], data }. The docs
// imply `tracking` is an array, but the live API returns it as a single object
// { url, target } — we handle both shapes.

const API_BASE = "https://api.financeads.net/api/v1/affiliate";

export type FinanceAdsCommissionBand = {
  min?: number;
  max?: number;
  unit?: string;
} | null;

export type FinanceAdsProgram = {
  id: number;
  name: string;
  descriptionShort: string | null;
  currency: string | null;
  countryIso2: string | null;
  salesArea: string[];
  logoUrl: string | null;
  partnershipStatus: string | null;
  commission: {
    sale: FinanceAdsCommissionBand;
    lead: FinanceAdsCommissionBand;
    fix: FinanceAdsCommissionBand;
  };
  cookieDurationDays: number | null;
};

export type FinanceAdsMaterial = {
  id: number;
  type: string; // "Textlink" | "Banner" | ...
  width: number;
  height: number;
  trackingUrl: string | null;
  viewUrl: string | null;
  description: string;
};

export type PrimaryLink = {
  trackingUrl: string;
  materialId: number;
  type: string;
  description: string;
};

export function financeadsConfigured(): boolean {
  return Boolean(env.financeadsApiKey && env.financeadsAdspace);
}

type Envelope<T> = { success?: boolean; message?: string[]; data?: T };

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${API_BASE}${path}`);
  // api_key + adspace go on every request (api_key required by the
  // advertising-materials endpoint, accepted everywhere).
  url.searchParams.set("api_key", env.financeadsApiKey);
  url.searchParams.set("adspace", env.financeadsAdspace);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!financeadsConfigured()) {
    throw new Error("FinanceAds not configured (FINANCEADS_API_KEY / FINANCEADS_ADSPACE)");
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30_000);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), {
      method: "GET",
      signal: ctl.signal,
      headers: {
        Accept: "application/json",
        // Belt-and-suspenders: bearer for endpoints that honour it.
        Authorization: `Bearer ${env.financeadsApiKey}`,
      },
      // Always hit the network — affiliate state changes server-side.
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let parsed: Envelope<T>;
  try {
    parsed = JSON.parse(text) as Envelope<T>;
  } catch {
    throw new Error(`FinanceAds ${path} returned non-JSON (HTTP ${res.status})`);
  }
  if (parsed.success === false) {
    const msg = (parsed.message ?? []).join("; ") || `HTTP ${res.status}`;
    throw new Error(`FinanceAds ${path}: ${msg}`);
  }
  return (parsed.data ?? ({} as T));
}

function pickLocalised(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const preferred = obj.en ?? obj.de ?? Object.values(obj)[0];
    return typeof preferred === "string" ? preferred : null;
  }
  return null;
}

function toBand(value: unknown): FinanceAdsCommissionBand {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  return {
    min: typeof obj.min === "number" ? obj.min : Number(obj.min) || undefined,
    max: typeof obj.max === "number" ? obj.max : Number(obj.max) || undefined,
    unit: typeof obj.unit === "string" ? obj.unit : undefined,
  };
}

/** All advertiser programs we hold an ACCEPTED partnership with. */
export async function fetchAcceptedPrograms(): Promise<FinanceAdsProgram[]> {
  const data = await getJson<{ programs?: unknown[]; count?: number }>(
    "/programs/partnerships",
    { "partnership[status]": "ACCEPTED" },
  );
  const programs = Array.isArray(data.programs) ? data.programs : [];
  return programs.map((raw): FinanceAdsProgram => {
    const p = raw as Record<string, unknown>;
    const commission = (p.commission ?? {}) as Record<string, unknown>;
    const cookie = (p.cookie ?? {}) as Record<string, unknown>;
    const logos = Array.isArray(p.logo_urls) ? (p.logo_urls as Record<string, unknown>[]) : [];
    return {
      id: Number(p.id),
      name: String(p.name ?? "").trim(),
      descriptionShort: pickLocalised(p.description_short),
      currency: typeof p.currency === "string" ? p.currency : null,
      countryIso2: typeof p.country_iso2 === "string" ? p.country_iso2 : null,
      salesArea: Array.isArray(p.sales_area) ? (p.sales_area as unknown[]).map(String) : [],
      logoUrl: logos[0]?.url ? String(logos[0].url) : null,
      partnershipStatus:
        (p.partnership as Record<string, unknown> | undefined)?.status != null
          ? String((p.partnership as Record<string, unknown>).status)
          : null,
      commission: {
        sale: toBand(commission.sale),
        lead: toBand(commission.lead),
        fix: toBand(commission.fix),
      },
      cookieDurationDays:
        cookie.duration != null ? Number(cookie.duration) || null : null,
    };
  });
}

/** Advertising materials (banners + text links) for one program. */
export async function fetchProgramMaterials(programId: number): Promise<FinanceAdsMaterial[]> {
  const data = await getJson<{ advertisingmaterials?: unknown[]; count?: number }>(
    `/program/${programId}/advertisingmaterials`,
    {},
  );
  const materials = Array.isArray(data.advertisingmaterials) ? data.advertisingmaterials : [];
  return materials.map((raw): FinanceAdsMaterial => {
    const m = raw as Record<string, unknown>;
    // tracking may be an object {url,target} (live API) or an array (docs).
    let trackingUrl: string | null = null;
    const tracking = m.tracking;
    if (Array.isArray(tracking) && tracking[0] && typeof tracking[0] === "object") {
      trackingUrl = String((tracking[0] as Record<string, unknown>).url ?? "") || null;
    } else if (tracking && typeof tracking === "object") {
      trackingUrl = String((tracking as Record<string, unknown>).url ?? "") || null;
    }
    return {
      id: Number(m.id),
      type: String(m.type ?? ""),
      width: Number(m.width) || 0,
      height: Number(m.height) || 0,
      trackingUrl,
      viewUrl: typeof m.view_url === "string" ? m.view_url : null,
      description: String(m.description ?? ""),
    };
  });
}

/**
 * Choose the canonical affiliate link for a program. We want a generic,
 * always-valid text link to the provider homepage (mirrors how the curated
 * financeads-monetized.ts entries were built), not a banner image.
 *
 * Preference order:
 *   1. Textlink whose description reads like a homepage/general link
 *   2. Any Textlink with a tracking URL
 *   3. Any material with a tracking URL (banner fallback)
 */
export function pickPrimaryTrackingLink(materials: FinanceAdsMaterial[]): PrimaryLink | null {
  const withUrl = materials.filter((m) => m.trackingUrl);
  if (withUrl.length === 0) return null;

  const textlinks = withUrl.filter((m) => /textlink/i.test(m.type));
  const homepageRe = /home|homepage|startseite|general|generic|main|website|standard/i;

  const homepageTextlink = textlinks.find((m) => homepageRe.test(m.description));
  const chosen = homepageTextlink ?? textlinks[0] ?? withUrl[0];

  return {
    trackingUrl: chosen.trackingUrl as string,
    materialId: chosen.id,
    type: chosen.type,
    description: chosen.description,
  };
}
