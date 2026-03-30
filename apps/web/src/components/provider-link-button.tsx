"use client";

import type { MarketplaceOffer } from "@payn/types";
import { useMemo } from "react";
import { buttonStyles } from "@/components/button";
import { useAuth } from "@/hooks/use-auth";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

export function ProviderLinkButton({
  offer,
  label,
  variant = "secondary",
  size = "md",
  source = "offer_card",
}: {
  offer: MarketplaceOffer;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  source?: "offer_card" | "offer_detail";
}) {
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const targetUrl = offer.affiliateLink || offer.providerWebsiteUrl;

  const handleClick = () => {
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
              providerName: offer.providerName,
              subtype: offer.attributes?.subtype ?? null,
            },
          });

          window.dispatchEvent(
            new CustomEvent("payn:provider-click", {
              detail: {
                offerId: offer.id,
              },
            }),
          );
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
      rel="noopener noreferrer"
      onClick={handleClick}
      className={buttonStyles({ variant, size })}
    >
      {label}
    </a>
  );
}
