"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

// ─── Compare store ───────────────────────────────────────────────────────────
//
// Tracks which offers the user is comparing. State is the list of slugs
// (small, serialisable, hydratable from the static catalog by anyone who
// needs the full offer payload). Persisted to localStorage so the
// selection survives a refresh or a navigation between bucket → PDP →
// back to bucket.
//
// Capped at 3 offers. Two is the natural sweet spot for a side-by-side
// table; three is the most we can fit without the comparison table
// becoming a scroll-fest on a 13" laptop. Anything more reads as a
// catalogue, not a comparison.

const MAX_COMPARE = 3;
const STORAGE_KEY = "payn:compare";

interface CompareContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  full: boolean;
  max: number;
  // WEB.5 — Category the current compare set is locked to (the
  // category of the first offer added). Cross-category compare is
  // blocked: the user gets feedback that swapping categories means
  // clearing the set first. Null when the set is empty.
  lockedCategory: string | null;
  // True when the offer can be added (same category as locked set,
  // not already full). Lets callers gray out the per-row Compare
  // toggle ahead of time instead of relying on the toggle silently
  // refusing.
  canAdd: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  // Hydrate from localStorage once on mount. We don't hydrate inside
  // useState's lazy init because SSR can't read localStorage — would
  // produce a hydration mismatch warning. Brief flash of empty state
  // on first paint is acceptable for this surface.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
        setSlugs(parsed.slice(0, MAX_COMPARE));
      }
    } catch {
      // Ignore — localStorage might be disabled (Safari ITP private mode).
    }
  }, []);

  // Persist on every change. Use try/catch in case storage quota is hit
  // or localStorage is unavailable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      // Quota or privacy mode — drop silently.
    }
  }, [slugs]);

  // WEB.5 — Derive the locked category from the first offer in the
  // set. Empty set → null (anything can be added). Non-empty → only
  // offers in the same category can be added; trying to add a
  // different category is silently ignored at the store level (the
  // callers also short-circuit via `canAdd` so the icon goes
  // disabled).
  const lockedCategory = useMemo<string | null>(() => {
    if (slugs.length === 0) return null;
    const first = marketplaceOffers.find((o) => o.slug === slugs[0]);
    return first?.category ?? null;
  }, [slugs]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      // Cross-category guard. If the set is non-empty and the new
      // offer belongs to a different category, refuse — comparing a
      // savings account against a travel insurance policy has no
      // shared axis to rank on, so the result reads as nonsense.
      if (prev.length > 0) {
        const firstCategory = marketplaceOffers.find(
          (o) => o.slug === prev[0],
        )?.category;
        const nextCategory = marketplaceOffers.find(
          (o) => o.slug === slug,
        )?.category;
        if (firstCategory && nextCategory && firstCategory !== nextCategory) {
          return prev;
        }
      }
      return [...prev, slug];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => setSlugs([]), []);

  const canAdd = useCallback(
    (slug: string) => {
      if (slugs.includes(slug)) return true; // remove is always allowed
      if (slugs.length >= MAX_COMPARE) return false;
      if (slugs.length === 0) return true;
      const target = marketplaceOffers.find((o) => o.slug === slug);
      return target?.category === lockedCategory;
    },
    [slugs, lockedCategory],
  );

  const value = useMemo<CompareContextValue>(
    () => ({
      slugs,
      toggle,
      remove,
      clear,
      has: (slug: string) => slugs.includes(slug),
      full: slugs.length >= MAX_COMPARE,
      max: MAX_COMPARE,
      lockedCategory,
      canAdd,
    }),
    [slugs, toggle, remove, clear, lockedCategory, canAdd],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    // Fallback no-op store so callers don't crash if the provider is
    // missing on a route (e.g. logged-out marketing surfaces).
    return {
      slugs: [],
      toggle: () => undefined,
      remove: () => undefined,
      clear: () => undefined,
      has: () => false,
      full: false,
      max: MAX_COMPARE,
      lockedCategory: null,
      canAdd: () => true,
    };
  }
  return ctx;
}
