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

export async function handleExternalRedirect({
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
  onComplete?: () => void;
}) {
  const targetUrl = appendAffiliateParams(rawUrl, affiliateParams);
  const parsed = new URL(targetUrl);

  if (parsed.protocol !== "https:") {
    onFallback({
      providerName,
      targetUrl,
      message: "This secure link could not be opened.",
      phase: "fallback",
    });
    return { ok: false, targetUrl };
  }

  onConnecting?.({
    providerName,
    targetUrl,
    message: `Opening ${providerName}...`,
    phase: "connecting",
  });

  const popup = window.open("", "_blank", "noopener,noreferrer");

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1500);
  });

  if (popup && !popup.closed) {
    popup.location.href = targetUrl;
    onComplete?.();
  }

  window.setTimeout(() => {
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      onFallback({
        providerName,
        targetUrl,
        message: "Still opening. Use the backup link if needed.",
        phase: "fallback",
      });
    }
  }, 2000);

  return { ok: Boolean(popup), targetUrl };
}
