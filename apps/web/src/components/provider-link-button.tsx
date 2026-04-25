"use client";

import type { MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { providerCtaStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackAnalyticsEvent,
} from "@/lib/analytics";
import { handleExternalRedirect, type RedirectFallbackState } from "@/lib/external-redirect";
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
  const [redirectState, setRedirectState] = useState<RedirectFallbackState | null>(null);
  const [copyComplete, setCopyComplete] = useState(false);

  // Country-aware URL resolution: per-country deep link → affiliateLink → brand homepage
  const targetUrl =
    offer.providerUrls?.[country] ??
    offer.affiliateLink ??
    offer.providerWebsiteUrl;

  const affiliateParams = {
    utm_source: "payn_web",
    utm_medium: source,
    utm_campaign: offer.category,
    aff_offer_id: offer.id,
    aff_provider: offer.providerName,
    aff_country: country,
  };

  const handleClick = async () => {
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

    // Fire client-side event for any analytics listener (all users)
    window.dispatchEvent(
      new CustomEvent("payn:provider-click", {
        detail: {
          offerId: offer.id,
          slug: offer.slug,
          providerName: offer.providerName,
          country,
          source,
          href: targetUrl,
        },
      }),
    );

    // Persist to Supabase for authenticated users
    if (user && isSupabaseConfigured()) {
      void (async () => {
        try {
          await supabase.from("user_activity").insert({
            user_id: user.id,
            action: "provider_click",
            offer_id: offer.id,
            category: offer.category,
            metadata: {
              href: targetUrl,
              source,
              slug: offer.slug,
              providerName: offer.providerName,
              country,
              subtype: offer.attributes?.subtype ?? null,
            },
          });
        } catch {
          // Tracking should never block the provider handoff.
        }
      })();
    }

    await handleExternalRedirect({
      rawUrl: targetUrl,
      providerName: offer.providerName,
      affiliateParams,
      onConnecting: (state) => setRedirectState(state),
      onComplete: () => {
        window.setTimeout(() => setRedirectState(null), 180);
      },
      onFallback: (state) => setRedirectState(state),
    });
  };

  const handleCopy = async () => {
    if (!redirectState) return;
    await navigator.clipboard.writeText(redirectState.targetUrl);
    setCopyComplete(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCopyComplete(false);
          void handleClick();
        }}
        className={clsx(providerCtaStyles({ fullWidth }), className)}
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

      {redirectState ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(17,24,39,0.48)] p-4 backdrop-blur-md">
          <div className="w-full max-w-[440px] rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_60px_rgba(15,23,32,0.2)]">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#111827] text-white shadow-[0_14px_34px_rgba(17,24,39,0.18)]">
              <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            </div>
            <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-ink">
              Opening {redirectState.providerName}...
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Securely redirecting you to the provider.
            </p>
            <p className="mt-4 rounded-[18px] bg-bg-surface px-4 py-3 text-sm leading-relaxed text-ink-secondary">
              {redirectState.message}
            </p>
            {redirectState.phase === "fallback" ? (
              <>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <a
                    href={redirectState.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={providerCtaStyles({ fullWidth: true })}
                  >
                    Open in browser
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className={clsx(providerCtaStyles({ fullWidth: true }), "border border-line bg-white text-ink hover:bg-bg-surface")}
                  >
                    {copyComplete ? "Link copied" : "Copy link"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setRedirectState(null)}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                >
                    Back to Payn
                  </button>
                </>
              ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
