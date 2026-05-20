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

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => setSlugs([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      slugs,
      toggle,
      remove,
      clear,
      has: (slug: string) => slugs.includes(slug),
      full: slugs.length >= MAX_COMPARE,
      max: MAX_COMPARE,
    }),
    [slugs, toggle, remove, clear],
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
    };
  }
  return ctx;
}
