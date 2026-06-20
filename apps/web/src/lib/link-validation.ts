// ─── SSRF-safe link resolution ───────────────────────────────────────────────
//
// Shared with the offer reconciler. Used by the discovery engine to verify that
// (a) a provider page is reachable and (b) a FinanceAds tracking URL actually
// redirects to the expected provider domain — so we never publish a monetised
// link that lands somewhere it shouldn't.

export function isInternalHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (["localhost", "0.0.0.0", "metadata.google.internal", "169.254.169.254"].includes(h)) {
    return true;
  }
  if (h === "::1" || h.startsWith("[")) return true;
  const parts = h.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !Number.isNaN(p))) {
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 0) return true;
  }
  return false;
}

export type LinkResolution = {
  /** true when the link is reachable (2xx/3xx) OR bot-protected (alive). */
  alive: boolean;
  status: number | "timeout" | "error";
  /** true for 401/403/429 — page exists but blocks server-side scrapers. */
  botProtected: boolean;
  finalUrl: string;
  finalHost: string | null;
};

/**
 * Follow redirects for `url` and report where it ended up. HTTPS-only, blocks
 * internal hosts at both the initial and final hop.
 */
export async function resolveUrl(url: string, timeoutMs = 12_000): Promise<LinkResolution> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { alive: false, status: "error", botProtected: false, finalUrl: url, finalHost: null };
  }
  if (parsed.protocol !== "https:" || isInternalHost(parsed.hostname)) {
    return { alive: false, status: "error", botProtected: false, finalUrl: url, finalHost: null };
  }

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 Payn-OfferEngine/1.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    let finalHost: string | null = null;
    try {
      const finalParsed = new URL(res.url || url);
      if (finalParsed.protocol !== "https:" || isInternalHost(finalParsed.hostname)) {
        return { alive: false, status: "error", botProtected: false, finalUrl: res.url, finalHost: null };
      }
      finalHost = finalParsed.hostname.toLowerCase();
    } catch {
      finalHost = null;
    }

    const botProtected = res.status === 401 || res.status === 403 || res.status === 429;
    return {
      alive: res.status < 400 || botProtected,
      status: res.status,
      botProtected,
      finalUrl: res.url || url,
      finalHost,
    };
  } catch (e: unknown) {
    const isAbort = e instanceof Error && e.name === "AbortError";
    return {
      alive: false,
      status: isAbort ? "timeout" : "error",
      botProtected: false,
      finalUrl: url,
      finalHost: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a URL and return stripped page text (for Gemini relevance checks).
 * HTTPS-only, blocks internal hosts. Bot-protected pages (401/403/429) come
 * back ok:false but botProtected:true so callers can skip them rather than flag.
 */
export async function fetchPageText(
  url: string,
  timeoutMs = 12_000,
): Promise<{ ok: boolean; status: number | "timeout" | "error"; botProtected: boolean; text: string; finalUrl: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, status: "error", botProtected: false, text: "", finalUrl: url };
  }
  if (parsed.protocol !== "https:" || isInternalHost(parsed.hostname)) {
    return { ok: false, status: "error", botProtected: false, text: "", finalUrl: url };
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 Payn-OfferEngine/1.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });
    try {
      const fin = new URL(res.url || url);
      if (fin.protocol !== "https:" || isInternalHost(fin.hostname)) {
        return { ok: false, status: "error", botProtected: false, text: "", finalUrl: res.url };
      }
    } catch {
      /* keep */
    }
    const botProtected = res.status === 401 || res.status === 403 || res.status === 429;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    return { ok: res.status < 400, status: res.status, botProtected, text, finalUrl: res.url || url };
  } catch (e: unknown) {
    const isAbort = e instanceof Error && e.name === "AbortError";
    return { ok: false, status: isAbort ? "timeout" : "error", botProtected: false, text: "", finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

/** Registrable-domain comparison: does `host` belong to `domain` (or vice-versa)? */
export function hostMatchesDomain(host: string | null, domain: string | null): boolean {
  if (!host || !domain) return false;
  const cleanHost = host.toLowerCase().replace(/^www\./, "");
  let cleanDomain = domain.toLowerCase().trim();
  // Accept a full URL or a bare domain for `domain`.
  try {
    if (cleanDomain.includes("://")) cleanDomain = new URL(cleanDomain).hostname;
  } catch {
    /* keep as-is */
  }
  cleanDomain = cleanDomain.replace(/^www\./, "");
  if (!cleanDomain) return false;
  return (
    cleanHost === cleanDomain ||
    cleanHost.endsWith(`.${cleanDomain}`) ||
    cleanDomain.endsWith(`.${cleanHost}`)
  );
}
