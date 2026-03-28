"use client";

import type { MarketplaceOffer } from "@payn/types";
import { useMemo, useState } from "react";
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
  const [opening, setOpening] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const targetUrl = offer.affiliateLink || offer.providerWebsiteUrl;

  const handleClick = () => {
    setOpening(true);
    const popup = window.open(targetUrl, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.href = targetUrl;
    }

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
        } finally {
          setOpening(false);
        }
      })();
      return;
    }

    setOpening(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={opening}
      className={buttonStyles({ variant, size })}
    >
      {opening ? "Opening..." : label}
    </button>
  );
}
