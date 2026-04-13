"use client";

import type { MarketplaceOffer } from "@payn/types";
import clsx from "clsx";
import { useMemo } from "react";
import { providerCtaStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
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
  source?: "offer_card" | "offer_detail";
  fullWidth?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { country } = useMarketplacePreferences();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Country-aware URL resolution: per-country deep link → affiliateLink → brand homepage
  const targetUrl =
    offer.providerUrls?.[country] ??
    offer.affiliateLink ??
    offer.providerWebsiteUrl;

  const handleClick = () => {
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
  };

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={clsx(providerCtaStyles({ fullWidth }), className)}
    >
      {label}
    </a>
  );
}
