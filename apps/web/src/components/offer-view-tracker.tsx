"use client";

import type { MarketplaceOffer } from "@payn/types";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackAnalyticsOnce,
} from "@/lib/analytics";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

const VIEW_COOLDOWN_MS = 30 * 60 * 1000;

export function OfferViewTracker({
  offer,
  country,
  language,
  market,
}: {
  offer: MarketplaceOffer;
  country: string;
  language: string;
  market: string;
}) {
  const { user, loading } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const trackedOfferIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (trackedOfferIdRef.current !== offer.id) {
      trackedOfferIdRef.current = offer.id;
      trackAnalyticsOnce({
        dedupeKey: `offer:${offer.id}`,
        eventName: AnalyticsEvent.OfferDetailsViewed,
        properties: buildWebAnalyticsProperties({
          category: offer.category,
          country,
          language,
          loggedIn: Boolean(user),
          offerId: offer.id,
          provider: offer.providerName,
        }),
      });
    }

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
  }, [country, language, loading, market, offer, supabase, user]);

  return null;
}
