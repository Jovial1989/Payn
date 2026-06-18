import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { reconcileOfferWithPage } from "@/lib/gemini-reconcile";

// Vercel cap: stay well inside the 300s ceiling.
// 20 offers × ~5s (GET + Gemini) = ~100s, safe.
export const maxDuration = 300;

const BATCH_SIZE = 20;
const SLEEP_MS = 350;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function isInternalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  // Exact matches
  if (["localhost", "0.0.0.0", "metadata.google.internal", "169.254.169.254"].includes(h)) return true;
  // IPv6 loopback
  if (h === "::1" || h.startsWith("[")) return true;
  // Private IPv4 ranges
  const parts = h.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 0) return true;
  }
  return false;
}

/** Fetch a URL and return plain stripped text. Follows redirects. */
async function fetchPageText(url: string): Promise<{
  ok: boolean;
  httpStatus: number | "timeout" | "error";
  text: string;
  finalUrl: string;
}> {
  // SEC-FIX SSRF-001: validate URL before issuing server-side request.
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { ok: false, httpStatus: "error", text: "", finalUrl: url }; }
  if (parsed.protocol !== "https:") return { ok: false, httpStatus: "error", text: "", finalUrl: url };
  if (isInternalHost(parsed.hostname)) return { ok: false, httpStatus: "error", text: "", finalUrl: url };

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12_000);

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 Payn-Reconciler/1.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });
    clearTimeout(timer);

    // Check redirect target too
    if (res.url !== url) {
      try {
        const redir = new URL(res.url);
        if (redir.protocol !== "https:" || isInternalHost(redir.hostname)) {
          return { ok: false, httpStatus: "error", text: "", finalUrl: res.url };
        }
      } catch { return { ok: false, httpStatus: "error", text: "", finalUrl: url }; }
    }

    const html = await res.text();
    // Strip scripts + styles → collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    return {
      ok: res.status < 400,
      httpStatus: res.status,
      text,
      finalUrl: res.url,
    };
  } catch (e: unknown) {
    const isAbort = e instanceof Error && e.name === "AbortError";
    return { ok: false, httpStatus: isAbort ? "timeout" : "error", text: "", finalUrl: url };
  }
}

export type OfferReconcileResult = {
  id: string;
  provider: string;
  title: string;
  category: string;
  is_monetised: boolean;
  url: string;
  http_status: number | "timeout" | "error";
  link_ok: boolean;
  final_url?: string;
  match?: boolean;
  confidence?: number;
  page_title?: string;
  issues?: string[];
  suggested_status?: string;
  gemini_error?: string;
};

export type ReconcileResponse = {
  checked: number;
  ok: number;
  mismatches: number;
  dead: number;
  errors: number;
  flagged: number;
  results: OfferReconcileResult[];
};

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client unavailable" }, { status: 503 });
  }

  // Body params
  const body = await request.json().catch(() => ({})) as {
    offerIds?: string[];
    autoFlag?: boolean;
    batchOffset?: number;
  };
  // SEC-FIX PAYN-014: sanitise batchOffset to prevent unexpected range queries.
  const offerIds: string[] | undefined = body.offerIds;
  // SEC-FIX PAYN-A09: validate and cap offerIds to prevent BATCH_SIZE bypass
  if (offerIds !== undefined) {
    if (!Array.isArray(offerIds)) {
      return NextResponse.json({ error: "offerIds must be an array" }, { status: 400 });
    }
    if (offerIds.length > BATCH_SIZE) {
      return NextResponse.json({ error: `offerIds may not exceed ${BATCH_SIZE}` }, { status: 400 });
    }
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (offerIds.some((id) => typeof id !== "string" || !UUID_RE.test(id))) {
      return NextResponse.json({ error: "offerIds must be valid UUIDs" }, { status: 400 });
    }
  }
  const autoFlag: boolean = body.autoFlag ?? false;
  const batchOffset: number = Math.max(0, Math.min(Math.floor(Number(body.batchOffset) || 0), 1_000_000));

  // Pull offers
  let q = admin
    .from("product_offers")
    .select("id, provider_name, title, subtitle, category, is_monetised, affiliate_link, metrics, attributes, status")
    .neq("affiliate_link", "")
    .not("affiliate_link", "is", null)
    .order("affiliate_priority_score", { ascending: false })
    .range(batchOffset, batchOffset + BATCH_SIZE - 1);

  if (offerIds?.length) {
    q = admin
      .from("product_offers")
      .select("id, provider_name, title, subtitle, category, is_monetised, affiliate_link, metrics, attributes, status")
      .in("id", offerIds);
  }

  const { data: rows, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const offers = rows ?? [];
  const results: OfferReconcileResult[] = [];

  for (const row of offers) {
    const url = String(row.affiliate_link ?? "");
    if (!url) continue;

    const page = await fetchPageText(url);

    const base: OfferReconcileResult = {
      id: String(row.id),
      provider: String(row.provider_name ?? ""),
      title: String(row.title ?? ""),
      category: String(row.category ?? ""),
      is_monetised: Boolean(row.is_monetised),
      url,
      http_status: page.httpStatus,
      link_ok: page.ok,
      final_url: page.finalUrl !== url ? page.finalUrl : undefined,
    };

    if (!page.ok) {
      // 403/429/401 = bot-protection (Cloudflare etc.) — the page exists but
      // blocks server-side scrapers. Treat as "link alive, content unverifiable"
      // so we don't repeatedly flag manually-fixed monetized affiliate links.
      const isBotBlocked =
        page.httpStatus === 403 ||
        page.httpStatus === 429 ||
        page.httpStatus === 401;

      if (isBotBlocked) {
        results.push({
          ...base,
          link_ok: true,   // link is alive
          match: undefined, // can't verify — skip Gemini
          issues: [`Bot-protected (HTTP ${page.httpStatus}) — content not verifiable server-side`],
        });
        await sleep(SLEEP_MS);
        continue;
      }

      const deadResult: OfferReconcileResult = {
        ...base,
        match: false,
        suggested_status: page.httpStatus === "timeout" ? "needs_review" : "archived",
        issues: [`Link ${page.httpStatus}: page not reachable`],
      };
      results.push(deadResult);

      if (autoFlag && deadResult.suggested_status === "archived") {
        await admin
          .from("product_offers")
          .update({ status: "needs_review", notes: `Reconciler: ${deadResult.issues?.[0]}` })
          .eq("id", row.id);
      }

      await sleep(SLEEP_MS);
      continue;
    }

    try {
      const verdict = await reconcileOfferWithPage(
        {
          title: String(row.title ?? ""),
          subtitle: String(row.subtitle ?? ""),
          category: String(row.category ?? ""),
          providerName: String(row.provider_name ?? ""),
          affiliateLink: url,
          metrics: Array.isArray(row.metrics)
            ? (row.metrics as { label: string; value: string }[])
            : [],
          attributes: (row.attributes as Record<string, unknown>) ?? {},
        },
        page.text,
      );

      const fullResult: OfferReconcileResult = {
        ...base,
        match: verdict.match,
        confidence: verdict.confidence,
        page_title: verdict.page_title,
        issues: verdict.issues,
        suggested_status: verdict.suggested_status,
      };
      results.push(fullResult);

      // Auto-flag mismatches in DB
      if (autoFlag && !verdict.match && verdict.suggested_status !== "ok") {
        await admin
          .from("product_offers")
          .update({
            status: "needs_review",
            notes: `Reconciler (${new Date().toISOString().slice(0, 10)}): ${verdict.issues.slice(0, 2).join("; ")}`,
          })
          .eq("id", row.id);
      }
    } catch (err) {
      results.push({
        ...base,
        gemini_error: err instanceof Error ? err.message : "Unknown Gemini error",
        suggested_status: "needs_review",
      });
    }

    await sleep(SLEEP_MS);
  }

  const flagged = results.filter(
    (r) => autoFlag && r.match === false,
  ).length;

  const summary: Omit<ReconcileResponse, "results"> = {
    checked: results.length,
    ok: results.filter((r) => r.match !== false && r.link_ok).length,
    mismatches: results.filter((r) => r.match === false && r.link_ok).length,
    dead: results.filter((r) => !r.link_ok).length,
    errors: results.filter((r) => !!r.gemini_error).length,
    flagged,
  };

  // Persist summary to audit log
  await admin.from("admin_audit_log").insert({
    action: "reconcile_offers",
    metadata: { ...summary, auto_flag: autoFlag, batch_offset: batchOffset },
  });

  return NextResponse.json({ ...summary, results } satisfies ReconcileResponse);
}
