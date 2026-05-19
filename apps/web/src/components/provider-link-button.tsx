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
  const [opening, setOpening] = useState(false);
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

  const resolvedUrl = useMemo(() => {
    if (!rawUrl) return null;
    const resolved = buildRedirectTarget({ rawUrl });
    return resolved.ok ? resolved.targetUrl : null;
  }, [rawUrl]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (opening) return;

    if (!resolvedUrl) {
      setToast(unavailableMessage);
      return;
    }

    setOpening(true);
    const openedWindow = window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => setOpening(false), 700);
    if (!openedWindow) {
      setToast(unavailableMessage);
      return;
    }

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

    void fetch("/api/v1/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offer_id: offer.id,
        provider_name: offer.providerName,
        category: offer.category,
        country,
        language,
        is_monetised: Boolean(offer.affiliateLink || offer.linkType === "affiliate_redirect"),
        outbound_url: rawUrl ?? "",
        source_page: source,
      }),
    }).catch(() => {});

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
      <button
        type="button"
        onClick={handleClick}
        className={clsx(providerCtaStyles({ fullWidth }), "pressable", className)}
        disabled={!resolvedUrl || opening}
      >
        {/* External-link glyph — replaces the previous padlock that read as
            "locked content" rather than "opens at provider in new tab". */}
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
          <path d="M11 4h5v5" />
          <path d="M16 4l-7 7" />
          <path d="M14 11v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
        </svg>
        {label}
      </button>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_34px_rgba(17,24,39,0.22)]">
          {toast}
        </div>
      ) : null}
    </>
  );
}
