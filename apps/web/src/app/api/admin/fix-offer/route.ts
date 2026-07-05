import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import {
  suggestCorrectedLinks,
  extractOfferUpdateFromPage,
  type OfferUpdatePayload,
} from "@/lib/gemini-offer-fix";

export const maxDuration = 120;

// ── SSRF guard (same as reconcile-offers) ─────────────────────────────────────

function isInternalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (["localhost", "0.0.0.0", "metadata.google.internal", "169.254.169.254"].includes(h)) return true;
  if (h === "::1" || h.startsWith("[")) return true;
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

async function fetchPageText(url: string): Promise<{
  ok: boolean;
  text: string;
  finalUrl: string;
  httpStatus: number | "error" | "timeout";
}> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { ok: false, text: "", finalUrl: url, httpStatus: "error" }; }
  if (parsed.protocol !== "https:") return { ok: false, text: "", finalUrl: url, httpStatus: "error" };
  if (isInternalHost(parsed.hostname)) return { ok: false, text: "", finalUrl: url, httpStatus: "error" };

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12_000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 Payn-Reconciler/1.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });
    clearTimeout(timer);

    if (res.url !== url) {
      try {
        const redir = new URL(res.url);
        if (redir.protocol !== "https:" || isInternalHost(redir.hostname)) {
          return { ok: false, text: "", finalUrl: res.url, httpStatus: "error" };
        }
      } catch { return { ok: false, text: "", finalUrl: url, httpStatus: "error" }; }
    }

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    return { ok: res.status < 400, text, finalUrl: res.url, httpStatus: res.status };
  } catch (e: unknown) {
    const isAbort = e instanceof Error && e.name === "AbortError";
    return { ok: false, text: "", finalUrl: url, httpStatus: isAbort ? "timeout" : "error" };
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export type FixOfferResponse = {
  success: boolean;
  offer_id: string;
  tried_urls?: string[];
  chosen_url?: string;
  page_title?: string;
  changes?: string[];
  confidence?: number;
  error?: string;
};

type SupabaseAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin client unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as {
    offerId?: string;
    mode?: "ai-search" | "manual";
    newUrl?: string;
  };

  const { offerId, mode = "manual", newUrl } = body;

  if (!offerId || typeof offerId !== "string") {
    return NextResponse.json({ error: "offerId required" }, { status: 400 });
  }
  if (mode === "manual" && (!newUrl || typeof newUrl !== "string")) {
    return NextResponse.json({ error: "newUrl required for manual mode" }, { status: 400 });
  }

  // Fetch offer from DB
  const { data: row, error: fetchErr } = await admin
    .from("product_offers")
    .select("id, provider_name, title, subtitle, category, affiliate_link, metrics, attributes, status")
    .eq("id", offerId)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: fetchErr?.message ?? "Offer not found" }, { status: 404 });
  }

  const offer = {
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    category: String(row.category ?? ""),
    providerName: String(row.provider_name ?? ""),
    existingAffiliateLink: String(row.affiliate_link ?? ""),
    metrics: Array.isArray(row.metrics) ? (row.metrics as { label: string; value: string }[]) : [],
    attributes: (row.attributes as Record<string, unknown>) ?? {},
  };

  // ── AI-SEARCH MODE: Gemini suggests URLs, we try each ────────────────────────
  if (mode === "ai-search") {
    const { suggested_urls } = await suggestCorrectedLinks(offer);
    if (suggested_urls.length === 0) {
      return NextResponse.json<FixOfferResponse>({
        success: false,
        offer_id: offerId,
        tried_urls: [],
        error: "Gemini could not suggest any URLs for this offer",
      });
    }

    const tried: string[] = [];
    for (const url of suggested_urls) {
      tried.push(url);
      const page = await fetchPageText(url);
      if (!page.ok || page.text.length < 200) continue;

      // Quick check: does the page mention the provider/product?
      const textLower = page.text.toLowerCase();
      const providerWords = offer.providerName.toLowerCase().split(" ");
      const titleWords = offer.title.toLowerCase().split(" ").filter((w) => w.length > 3);
      const providerMatch = providerWords.some((w) => textLower.includes(w));
      const titleMatch = titleWords.some((w) => textLower.includes(w));
      if (!providerMatch || !titleMatch) continue;

      // Good page — extract updated offer data
      const update = await extractOfferUpdateFromPage(
        {
          title: offer.title,
          subtitle: offer.subtitle,
          category: offer.category,
          providerName: offer.providerName,
          metrics: offer.metrics,
          attributes: offer.attributes,
        },
        page.text,
        page.finalUrl,
      );

      if (update.confidence < 0.5) continue;

      const { error: applyErr } = await applyUpdate(admin, offerId, update);
      if (applyErr) {
        return NextResponse.json<FixOfferResponse>(
          { success: false, offer_id: offerId, tried_urls: tried, error: `DB update failed: ${applyErr}` },
          { status: 500 },
        );
      }
      return NextResponse.json<FixOfferResponse>({
        success: true,
        offer_id: offerId,
        tried_urls: tried,
        chosen_url: page.finalUrl,
        page_title: update.page_title,
        changes: update.changes,
        confidence: update.confidence,
      });
    }

    return NextResponse.json<FixOfferResponse>({
      success: false,
      offer_id: offerId,
      tried_urls: tried,
      error: "None of the suggested URLs matched this product with sufficient confidence",
    });
  }

  // ── MANUAL MODE: user-supplied URL ────────────────────────────────────────────
  const url = newUrl!;
  let parsedUrl: URL;
  try { parsedUrl = new URL(url); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Only HTTPS URLs are accepted" }, { status: 400 });
  }

  const page = await fetchPageText(url);

  // Many provider sites (Revolut, Wise, etc.) block server-side scraping via
  // Cloudflare / bot protection — they return 403/429 even though the page is
  // perfectly accessible in a browser. In manual mode the admin explicitly
  // confirmed the URL is correct, so we save the affiliate_link regardless and
  // skip Gemini extraction when we can't read the page.
  const botBlocked =
    !page.ok &&
    (page.httpStatus === 403 || page.httpStatus === 429 || page.httpStatus === 401);

  if (!page.ok && !botBlocked) {
    return NextResponse.json<FixOfferResponse>({
      success: false,
      offer_id: offerId,
      tried_urls: [url],
      error: `Page not reachable (HTTP ${page.httpStatus})`,
    });
  }

  // If we got a readable page, extract updated offer data via Gemini.
  // Otherwise (bot-blocked) just update the affiliate_link and mark status ok.
  if (page.ok && page.text.length >= 200) {
    const update = await extractOfferUpdateFromPage(
      {
        title: offer.title,
        subtitle: offer.subtitle,
        category: offer.category,
        providerName: offer.providerName,
        metrics: offer.metrics,
        attributes: offer.attributes,
      },
      page.text,
      page.finalUrl,
    );

    const { error: applyErr } = await applyUpdate(admin, offerId, update);
    if (applyErr) {
      return NextResponse.json<FixOfferResponse>(
        { success: false, offer_id: offerId, tried_urls: [url], error: `DB update failed: ${applyErr}` },
        { status: 500 },
      );
    }
    return NextResponse.json<FixOfferResponse>({
      success: true,
      offer_id: offerId,
      tried_urls: [url],
      chosen_url: page.finalUrl,
      page_title: update.page_title,
      changes: update.changes,
      confidence: update.confidence,
    });
  }

  // Bot-protected page — save the link, keep existing title/subtitle/metrics.
  // status MUST be a valid enum value ('active' = live), NOT "ok".
  const { error: linkErr } = await admin
    .from("product_offers")
    .update({
      affiliate_link: url,
      status: "active",
      notes: `Link updated manually (${new Date().toISOString().slice(0, 10)}) — page bot-protected, conditions not re-verified`,
    })
    .eq("id", offerId);

  if (linkErr) {
    return NextResponse.json<FixOfferResponse>(
      { success: false, offer_id: offerId, tried_urls: [url], error: `DB update failed: ${linkErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json<FixOfferResponse>({
    success: true,
    offer_id: offerId,
    tried_urls: [url],
    chosen_url: url,
    page_title: "",
    changes: ["affiliate_link updated (page bot-protected — conditions not re-verified)"],
    confidence: 0,
  });
}

async function applyUpdate(
  admin: SupabaseAdminClient,
  offerId: string,
  update: OfferUpdatePayload,
): Promise<{ error: string | null }> {
  // NOTE: product_offers.status is constrained to
  // ('active','inactive','needs_review','archived') — "ok" is NOT valid and
  // would silently reject the entire UPDATE. A successfully fixed offer is
  // "active" (live, published).
  const { error } = await admin
    .from("product_offers")
    .update({
      affiliate_link: update.affiliate_link,
      title: update.title,
      subtitle: update.subtitle,
      metrics: update.metrics,
      attributes: update.attributes,
      status: "active",
      notes:
        update.changes.length > 0
          ? `Auto-fixed (${new Date().toISOString().slice(0, 10)}): ${update.changes.slice(0, 3).join("; ")}`
          : `Auto-verified (${new Date().toISOString().slice(0, 10)})`,
    })
    .eq("id", offerId);
  return { error: error?.message ?? null };
}
