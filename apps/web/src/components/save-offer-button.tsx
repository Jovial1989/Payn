"use client";

import type { MarketplaceOffer } from "@payn/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { useAuth } from "@/hooks/use-auth";
import { getOfferHref } from "@/lib/marketplace";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

export function SaveOfferButton({
  offer,
  variant = "secondary",
  size = "md",
}: {
  offer: MarketplaceOffer;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const emitSavedOfferChange = (nextSaved: boolean) => {
    window.dispatchEvent(
      new CustomEvent("payn:saved-offers-changed", {
        detail: {
          offerId: offer.id,
          saved: nextSaved,
        },
      }),
    );
  };

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      if (!user || !isSupabaseConfigured()) {
        setSaved(false);
        return;
      }

      const { data } = await supabase
        .from("saved_offers")
        .select("id")
        .eq("offer_id", offer.id)
        .maybeSingle();

      if (!cancelled) {
        setSaved(Boolean(data));
      }
    };

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [offer.id, supabase, user]);

  const handleToggle = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(getOfferHref(offer))}`);
      return;
    }

    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      if (saved) {
        await supabase.from("saved_offers").delete().eq("offer_id", offer.id);
        setSaved(false);
        emitSavedOfferChange(false);
      } else {
        await supabase.from("saved_offers").upsert(
          {
            user_id: user.id,
            offer_id: offer.id,
            category: offer.category,
          },
          { onConflict: "user_id,offer_id" },
        );
        setSaved(true);
        emitSavedOfferChange(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={buttonStyles({ variant, size })}
    >
      {loading ? "Saving..." : saved ? "Saved" : "Save offer"}
    </button>
  );
}
