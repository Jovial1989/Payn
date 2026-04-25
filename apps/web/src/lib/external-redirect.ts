export function appendAffiliateParams(
  rawUrl: string,
  affiliateParams: Record<string, string | number | boolean | null | undefined>,
) {
  const parsed = new URL(rawUrl, window.location.origin);
  if (parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }

  Object.entries(affiliateParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      parsed.searchParams.set(key, String(value));
    }
  });

  return parsed.toString();
}

export function buildRedirectTarget({
  rawUrl,
  affiliateParams,
}: {
  rawUrl: string;
  affiliateParams: Record<string, string | number | boolean | null | undefined>;
}) {
  try {
    const targetUrl = appendAffiliateParams(rawUrl, affiliateParams);
    const parsed = new URL(targetUrl);

    if (parsed.protocol !== "https:") {
      return {
        ok: false as const,
        error: "Only secure provider links can be opened from Payn.",
      };
    }

    return { ok: true as const, targetUrl };
  } catch {
    return {
      ok: false as const,
      error: "This provider link is unavailable right now.",
    };
  }
}
