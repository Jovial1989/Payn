"use client";

import type { MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { providerCtaStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackAnalyticsEvent,
} from "@/lib/analytics";
import {
  buildRedirectTarget,
  handleExternalRedirect,
  type RedirectFallbackState,
} from "@/lib/external-redirect";
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
  const [errorToast, setErrorToast] = useState<string | null>(null);

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

  useEffect(() => {
    if (!errorToast) return;
    const timeout = window.setTimeout(() => setErrorToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [errorToast]);

  const trackClick = () => {
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
          href: targetUrl,
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
  };

  const openProvider = (event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setRedirectState(null);
    trackClick();

    const resolved = buildRedirectTarget({
      rawUrl: targetUrl,
      affiliateParams,
    });

    if (!resolved.ok) {
      setErrorToast(resolved.error);
      return;
    }

    handleExternalRedirect({
      rawUrl: targetUrl,
      providerName: offer.providerName,
      affiliateParams,
      onConnecting: (state) => setRedirectState(state),
      onComplete: (resolvedUrl) => {
        setRedirectState({
          providerName: offer.providerName,
          targetUrl: resolvedUrl,
          message: "You are leaving Payn to continue.",
          phase: "connecting",
        });
        window.setTimeout(() => setRedirectState(null), 900);
      },
      onFallback: (state) => {
        setRedirectState({
          ...state,
          message: state.message || "Open provider manually to continue.",
          phase: "fallback",
        });
      },
    });
  };

  const manualOpenHref = useMemo(() => {
    const resolved = buildRedirectTarget({
      rawUrl: targetUrl,
      affiliateParams,
    });
    return resolved.ok ? resolved.targetUrl : "";
  }, [affiliateParams, targetUrl]);

  return (
    <>
      <button
        type="button"
        onClick={openProvider}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
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

      {redirectState ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(17,24,39,0.44)] p-4 backdrop-blur-md">
          <div className="w-full max-w-[360px] rounded-[28px] border border-line bg-white p-5 shadow-[0_24px_60px_rgba(15,23,32,0.2)]">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#111827] text-white shadow-[0_14px_34px_rgba(17,24,39,0.18)]">
                <span className="absolute inset-0 rounded-[20px] border border-white/12" />
                <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-[-0.04em] text-ink">
                  Opening {redirectState.providerName}
                </h3>
                <p className="mt-1 text-sm text-ink-secondary">
                  You are leaving Payn to continue.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] bg-bg-surface px-4 py-3 text-sm text-ink-secondary">
              {redirectState.message}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <a
                href={manualOpenHref || "#"}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className={clsx(
                  providerCtaStyles({ fullWidth: true }),
                  !manualOpenHref && "pointer-events-none opacity-50",
                )}
              >
                Open provider
              </a>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setRedirectState(null);
                }}
                className="pressable inline-flex h-11 w-full items-center justify-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
              >
                Back to Payn
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {errorToast ? (
        <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_34px_rgba(17,24,39,0.22)]">
          {errorToast}
        </div>
      ) : null}
    </>
  );
}
