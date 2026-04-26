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
  const [toast, setToast] = useState<string | null>(null);
  const unavailableMessage =
    language === "de"
      ? "Dieser Anbieterlink ist derzeit nicht verfügbar."
      : language === "es"
        ? "Este enlace del proveedor no está disponible por ahora."
        : language === "fr"
          ? "Ce lien fournisseur n'est pas disponible pour le moment."
          : language === "it"
            ? "Questo link del provider non è disponibile al momento."
            : language === "pt"
              ? "Este link do fornecedor não está disponível neste momento."
              : "This provider link is not available right now.";

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

  // Computed once — the fully-resolved HTTPS affiliate URL.
  const resolvedUrl = useMemo(() => {
    if (!rawUrl) return null;
    const resolved = buildRedirectTarget({ rawUrl, affiliateParams });
    return resolved.ok ? resolved.targetUrl : null;
  }, [rawUrl, affiliateParams]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!resolvedUrl) {
      // No URL — block navigation and show error.
      e.preventDefault();
      setToast(unavailableMessage);
      return;
    }
    // Navigation proceeds via the anchor's href + target="_blank".
    // We only fire tracking here — it never blocks or delays the tab open.
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

  return (
    <>
      {/*
        Using <a target="_blank"> instead of <button> + window.open.
        Native anchor link clicks with target="_blank" are NEVER blocked
        by browser popup blockers. window.open() from a JS handler can be.
        Payn stays open in the current tab; provider opens in a new one.
      */}
      <a
        href={resolvedUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={clsx(providerCtaStyles({ fullWidth }), "pressable", className)}
        aria-disabled={!resolvedUrl}
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
      </a>

      {/* Error toast — shown only when the provider URL is missing */}
      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_34px_rgba(17,24,39,0.22)]">
          {toast}
        </div>
      ) : null}
    </>
  );
}
