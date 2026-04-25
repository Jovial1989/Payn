"use client";

import type { MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { providerCtaStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackAnalyticsEvent,
} from "@/lib/analytics";
import { buildRedirectTarget } from "@/lib/external-redirect";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

export function ProviderLinkButton({
  offer,
  label,
  source = "offer_card",
  fullWidth = false,
  className,
}: {
  offer: MarketplaceOffer;
  label: string;
  source?: "offer_card" | "offer_detail" | "offer_detail_sticky";
  fullWidth?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { country, language } = useMarketplacePreferences();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rawUrl =
    offer.providerUrls?.[country] ??
    offer.affiliateLink ??
    offer.providerWebsiteUrl;

  const affiliateParams = useMemo(() => ({
    utm_source: "payn_web",
    utm_medium: source,
    utm_campaign: offer.category,
    aff_offer_id: offer.id,
    aff_provider: offer.providerName,
    aff_country: country,
  }), [source, offer.category, offer.id, offer.providerName, country]);

  const resolvedUrl = useMemo(() => {
    if (!rawUrl) return null;
    const resolved = buildRedirectTarget({ rawUrl, affiliateParams });
    return resolved.ok ? resolved.targetUrl : null;
  }, [rawUrl, affiliateParams]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const doTracking = () => {
    trackAnalyticsEvent(AnalyticsEvent.ProviderClicked, {
      ...buildWebAnalyticsProperties({
        category: offer.category,
        country,
        language,
        loggedIn: Boolean(user),
        offerId: offer.id,
        provider: offer.providerName,
      }),
      source,
    });

    window.dispatchEvent(
      new CustomEvent("payn:provider-click", {
        detail: {
          offerId: offer.id,
          slug: offer.slug,
          providerName: offer.providerName,
          country,
          source,
          href: rawUrl,
        },
      }),
    );

    if (user && isSupabaseConfigured()) {
      void (async () => {
        try {
          await supabase.from("user_activity").insert({
            user_id: user.id,
            action: "provider_click",
            offer_id: offer.id,
            category: offer.category,
            metadata: {
              href: rawUrl,
              source,
              slug: offer.slug,
              providerName: offer.providerName,
              country,
              subtype: offer.attributes?.subtype ?? null,
            },
          });
        } catch {
          // Tracking must never block the provider handoff.
        }
      })();
    }
  };

  const handleClick = () => {
    if (!resolvedUrl) {
      setToast("Provider link is not available yet.");
      return;
    }

    // ─── window.open MUST be called first — before state updates, tracking,
    // or any async work. Browsers end the user-gesture context immediately
    // after the first async boundary, which causes popup blockers to trigger. ───
    const popup = window.open(resolvedUrl, "_blank", "noopener,noreferrer");

    // Track after opening so it never delays or blocks the handoff.
    doTracking();

    if (popup) {
      // New tab opened. Payn stays here. Show a brief success toast.
      setToast(`Opening ${offer.providerName}…`);
    } else {
      // Browser blocked the new tab. Show fallback modal with a direct link.
      setFallbackUrl(resolvedUrl);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={clsx(providerCtaStyles({ fullWidth }), "pressable", className)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mr-2 shrink-0"
        >
          <rect x="4.5" y="9" width="11" height="7.5" rx="2" />
          <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" />
        </svg>
        {label}
      </button>

      {/* Fallback modal — only shown when the browser blocks window.open */}
      {fallbackUrl ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(17,24,39,0.44)] p-4 backdrop-blur-md"
          onClick={() => setFallbackUrl(null)}
        >
          <div
            className="w-full max-w-[360px] rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_60px_rgba(15,23,32,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F3F4F6]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="9" width="11" height="7.5" rx="2" />
                <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            </div>
            <h3 className="mt-4 text-[17px] font-bold tracking-[-0.03em] text-ink">
              Open in a new tab
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Your browser prevented the tab from opening automatically. Click below to visit {offer.providerName}.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={clsx(providerCtaStyles({ fullWidth: true }))}
                onClick={() => setFallbackUrl(null)}
              >
                Open {offer.providerName}
              </a>
              <button
                type="button"
                onClick={() => setFallbackUrl(null)}
                className="pressable inline-flex h-11 w-full items-center justify-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
              >
                Back to Payn
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast — success or error */}
      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_34px_rgba(17,24,39,0.22)]">
          {toast}
        </div>
      ) : null}
    </>
  );
}
