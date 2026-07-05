"use client";

import clsx from "clsx";
import type { MarketplaceOffer } from "@payn/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackAnalyticsEvent,
} from "@/lib/analytics";
import { localePath } from "@/lib/locale";
import { getOfferHref } from "@/lib/marketplace";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import { getUiCopy } from "@/lib/ui-copy";

export function SaveOfferButton({
  offer,
  variant = "ghost",
  size = "md",
  className,
  mode = "label",
  stopPropagation = false,
}: {
  offer: MarketplaceOffer;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** "label" (default) renders the full text button used on PDPs. "icon"
   *  renders a compact 32px bookmark glyph used on hover-revealed catalogue
   *  card actions where vertical space is at a premium. */
  mode?: "label" | "icon";
  /** When the button sits inside a row that itself navigates on click
   *  (OfferRowAtlas), parents pass true so we don't fire the row's link. */
  stopPropagation?: boolean;
}) {
  const router = useRouter();
  const { country, locale } = useMarketplacePreferences();
  const uiCopy = getUiCopy(locale);
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
      router.push(localePath(locale, `/login?next=${encodeURIComponent(getOfferHref(offer))}`));
      return;
    }

    if (!isSupabaseConfigured()) {
      router.push(localePath(locale, "/login"));
      return;
    }

    setLoading(true);

    try {
      if (saved) {
        await supabase.from("saved_offers").delete().eq("offer_id", offer.id);
        trackAnalyticsEvent(
          AnalyticsEvent.OfferSavedRemoved,
          buildWebAnalyticsProperties({
            category: offer.category,
            country,
            language: locale,
            loggedIn: Boolean(user),
            offerId: offer.id,
            provider: offer.providerName,
          }),
        );
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
        trackAnalyticsEvent(
          AnalyticsEvent.OfferSaved,
          buildWebAnalyticsProperties({
            category: offer.category,
            country,
            language: locale,
            loggedIn: Boolean(user),
            offerId: offer.id,
            provider: offer.providerName,
          }),
        );
        setSaved(true);
        emitSavedOfferChange(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (stopPropagation) event.stopPropagation();
    void handleToggle();
  };

  if (mode === "icon") {
    // Compact bookmark glyph for catalogue cards. Active state fills the
    // bookmark + tints the surface emerald so the user gets unambiguous
    // feedback without a copy change. Title attribute carries the label that
    // the text-mode button shows inline.
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={saved}
        title={saved ? uiCopy.common.savedOffer : uiCopy.common.saveOffer}
        className={clsx(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
          saved
            ? "border-accent-emerald/40 bg-accent-emerald-soft text-accent-emerald-strong"
            : "border-line bg-white text-ink-tertiary hover:border-accent-emerald/40 hover:text-accent-emerald-strong",
          loading && "opacity-60",
          className,
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M3 1.5h8v11l-4-2.6-4 2.6V1.5z" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={clsx(buttonStyles({ variant, size }), className)}
    >
      {loading ? uiCopy.common.savingOffer : saved ? uiCopy.common.savedOffer : uiCopy.common.saveOffer}
    </button>
  );
}
