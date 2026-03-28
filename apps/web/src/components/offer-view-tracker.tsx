"use client";

import type { MarketplaceOffer } from "@payn/types";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

const VIEW_COOLDOWN_MS = 30 * 60 * 1000;

export function OfferViewTracker({
  offer,
  market,
}: {
  offer: MarketplaceOffer;
  market: string;
}) {
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      return;
    }

    const storageKey = `payn:offer-view:${offer.id}`;
    const lastTrackedAt = window.sessionStorage.getItem(storageKey);

    if (lastTrackedAt) {
      const elapsed = Date.now() - Number(lastTrackedAt);

      if (elapsed < VIEW_COOLDOWN_MS) {
        return;
      }
    }

    window.sessionStorage.setItem(storageKey, String(Date.now()));

    void supabase.from("user_activity").insert({
      user_id: user.id,
      action: "offer_view",
      offer_id: offer.id,
      category: offer.category,
      metadata: {
        slug: offer.slug,
        providerName: offer.providerName,
        subtype: offer.attributes?.subtype ?? null,
        market,
        source: "offer_detail",
      },
    });
  }, [market, offer, supabase, user]);

  return null;
}
