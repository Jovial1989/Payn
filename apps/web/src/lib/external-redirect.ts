export function normalizeRedirectTarget(rawUrl: string) {
  const parsed = new URL(rawUrl, window.location.origin);
  if (parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }
  return parsed.toString();
}

export function buildRedirectTarget({
  rawUrl,
}: {
  rawUrl: string;
}) {
  try {
    const targetUrl = normalizeRedirectTarget(rawUrl);
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
