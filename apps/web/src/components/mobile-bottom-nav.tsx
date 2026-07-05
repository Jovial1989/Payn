"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MarketplaceLocale } from "@payn/types";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { localePath } from "@/lib/locale";
// WEB.1 — Bottom nav reads the compare set so the Saved icon can
// light up with a small emerald count badge whenever the user has 1+
// offers picked. Same nav-as-status-indicator pattern as MOB.8.
import { useCompare } from "@/features/compare/compare-store";

// ─── MobileBottomNav ───────────────────────────────────────────────────────────
//
// Five-icon iOS-style bottom tab bar shown below md (hidden on tablet+).
// Replaces the desktop top-row utility nav on small screens — fingers
// can reach the bottom edge of the phone in a way they cannot reach the
// top-left hamburger.
//
// The five tabs:
//   1. Home     — landing page
//   2. Browse   — discover hub (all categories + search)
//   3. Saved    — user's saved offers (lives behind auth — anonymous
//                 users get sent to the login screen with a redirect
//                 back here)
//   4. Compare  — TBD; currently routes to Discover. Placeholder until
//                 the compare-drawer surface ships.
//   5. Me       — profile / settings if signed in; else login screen.
//
// The active tab is computed from the pathname so deep-links light up the
// right icon. Each item respects the user's locale so /en/discover, /de/
// discover etc. all work.
//
// Bottom-area safe-area-inset is honoured via env(safe-area-inset-bottom)
// so iPhone home-bar doesn't overlap the icons.

interface NavItem {
  key: string;
  label: string;
  href: string;
  /** Sub-paths whose pathname should mark this tab active. Order doesn't
   *  matter — first regex match wins across the whole nav. */
  match: RegExp;
  /** Inline SVG path/glyph — keeps the nav zero-extra-request and lets
   *  us hit a strict optical baseline. */
  icon: React.ReactNode;
}

const Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  />
);

function buildItems(locale: MarketplaceLocale, isAuthed: boolean): NavItem[] {
  const next = (path: string) =>
    isAuthed ? path : `/login?next=${encodeURIComponent(path)}`;
  // BUG-030 — Web mobile nav had 5 items (Home / Browse / Saved /
  // Compare / Me) which diverged from the Flutter app's 4-tab nav
  // (Home / Explore / Saved / Profile). Compare is a *mode* (a drawer
  // / floating bar over results), not a destination — it doesn't earn
  // a permanent slot in primary nav. Browse renamed to Explore and
  // Me renamed to Profile so the two surfaces share vocabulary.
  return [
    {
      key: "home",
      label: "Home",
      href: localePath(locale, "/"),
      match: /^\/[a-z]{2}\/?$/,
      icon: (
        <Icon>
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" />
        </Icon>
      ),
    },
    {
      key: "explore",
      label: "Explore",
      href: localePath(locale, "/discover"),
      match: /\/(discover|explore|cards|loans|transfers|savings|insurance|investments|banking|crypto|business|travel)/,
      icon: (
        <Icon>
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l4 4" />
        </Icon>
      ),
    },
    {
      key: "saved",
      label: "Saved",
      href: localePath(locale, isAuthed ? "/dashboard" : next("/dashboard")),
      match: /\/(dashboard|offers)/,
      icon: (
        <Icon>
          <path d="M5 3h14v18l-7-4.5L5 21V3z" />
        </Icon>
      ),
    },
    {
      key: "profile",
      label: "Profile",
      href: localePath(locale, isAuthed ? "/settings" : "/login"),
      match: /\/(settings|login|signup|profile)/,
      icon: (
        <Icon>
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20a7 7 0 0114 0" />
        </Icon>
      ),
    },
  ];
}

export function MobileBottomNav() {
  const { locale } = useMarketplacePreferences();
  const { user } = useAuth();
  const pathname = usePathname() ?? "/";
  const items = buildItems(locale, Boolean(user));
  const activeKey = items.find((i) => i.match.test(pathname))?.key ?? "home";
  // WEB.1 — Saved tab "lights up" with a small emerald count badge
  // whenever the user has 1+ offers in their Compare set. Mirrors the
  // Flutter nav badge (MOB.8) so the cross-platform pattern stays in
  // sync: Saved icon = "you have a shortlist waiting".
  const { slugs: compareSlugs } = useCompare();
  const compareCount = compareSlugs.length;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/*
        WEB.8 — Strict alignment per MOB.13. The old layout had:
          • `<ul>` using `justify-around`, which adds half-gaps at each
            edge and pushes the first/last tab inward asymmetrically.
          • Variable-height Links because labels wrap differently per
            locale (DE/FR labels can run two lines while EN stays one).
          • `active:scale-[0.96]` on the whole Link, which physically
            squashed the icon + label on press — the user reads that
            as "icon shifted, not centered".
        Now: ul is a fixed-height row; each li is `flex-1` so every tab
        is exactly viewport_width / N wide; each Link is `h-full` +
        `items-center justify-center` so the content is anchored to
        the geometric centre of its tab; no scale transforms.
      */}
      <ul className="mx-auto flex h-[60px] max-w-[640px] items-stretch justify-stretch">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const showBadge = item.key === "saved" && compareCount > 0;
          return (
            <li key={item.key} className="flex flex-1 items-stretch">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "text-accent-emerald-strong"
                    : "text-ink-tertiary",
                ].join(" ")}
              >
                <span
                  className={[
                    "relative flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-accent-emerald-soft" : "",
                  ].join(" ")}
                >
                  {item.icon}
                  {showBadge ? (
                    <span
                      aria-label={`${compareCount} in Compare`}
                      className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-accent-emerald px-1 text-[9px] font-extrabold leading-none text-white"
                    >
                      {compareCount}
                    </span>
                  ) : null}
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
