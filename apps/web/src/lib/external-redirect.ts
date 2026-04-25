export type RedirectFallbackState = {
  providerName: string;
  targetUrl: string;
  message: string;
  phase: "connecting" | "fallback";
};

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

export function handleExternalRedirect({
  rawUrl,
  providerName,
  affiliateParams,
  onFallback,
  onConnecting,
  onComplete,
}: {
  rawUrl: string;
  providerName: string;
  affiliateParams: Record<string, string | number | boolean | null | undefined>;
  onFallback: (state: RedirectFallbackState) => void;
  onConnecting?: (state: RedirectFallbackState) => void;
  onComplete?: (targetUrl: string) => void;
}) {
  const resolved = buildRedirectTarget({ rawUrl, affiliateParams });

  if (!resolved.ok) {
    onFallback({
      providerName,
      targetUrl: "",
      message: resolved.error,
      phase: "fallback",
    });
    return { ok: false as const, targetUrl: "" };
  }

  const targetUrl = resolved.targetUrl;

  onConnecting?.({
    providerName,
    targetUrl,
    message: `Opening ${providerName}...`,
    phase: "connecting",
  });

  const popup = window.open(targetUrl, "_blank", "noopener,noreferrer");

  if (popup) {
    onComplete?.(targetUrl);
    return { ok: true as const, targetUrl };
  }

  try {
    window.location.href = targetUrl;
    onFallback({
      providerName,
      targetUrl,
      message: "If nothing happens, use Open provider below.",
      phase: "fallback",
    });
    return { ok: true as const, targetUrl };
  } catch {
    onFallback({
      providerName,
      targetUrl,
      message: "Open provider manually to continue.",
      phase: "fallback",
    });
    return { ok: false as const, targetUrl };
  }
}
