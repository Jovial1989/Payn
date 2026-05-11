import type { OfferDiscoverySource } from "./types";

const userAgent = "PaynOfferDiscovery/0.2 (+https://payn.online)";

export type FetchResult = {
  url: string;
  body: string;
  contentType: string;
  lastModified: string | null;
  cached: boolean;
};

export async function fetchSource(source: OfferDiscoverySource): Promise<FetchResult> {
  const allowed = await isRobotsAllowed(source.url);
  if (!allowed) {
    throw new Error("Blocked by robots.txt policy");
  }

  const response = await fetch(source.url, {
    headers: {
      accept:
        source.crawlStrategy === "api"
          ? "application/json,text/plain;q=0.8"
          : "text/html,application/xhtml+xml,text/plain;q=0.8",
      "user-agent": userAgent,
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with HTTP ${response.status}`);
  }

  return {
    url: response.url || source.url,
    body: await response.text(),
    contentType: response.headers.get("content-type") ?? "",
    lastModified: response.headers.get("last-modified"),
    cached: response.headers.get("x-vercel-cache") === "HIT",
  };
}

async function isRobotsAllowed(url: string) {
  const parsed = new URL(url);
  const robotsUrl = `${parsed.origin}/robots.txt`;
  try {
    const response = await fetch(robotsUrl, {
      headers: { "user-agent": userAgent },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return true;
    const body = await response.text();
    const path = parsed.pathname || "/";
    return !body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .some((line) => {
        const lower = line.toLowerCase();
        if (!lower.startsWith("disallow:")) return false;
        const rule = line.slice("disallow:".length).trim();
        return rule === "/" || (rule.length > 1 && path.startsWith(rule));
      });
  } catch {
    return false;
  }
}
