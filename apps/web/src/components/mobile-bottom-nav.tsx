"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MarketplaceLocale } from "@payn/types";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { localePath } from "@/lib/locale";

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
      key: "browse",
      label: "Browse",
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
      key: "compare",
      label: "Compare",
      href: localePath(locale, "/discover?intent=compare"),
      match: /\?intent=compare/,
      icon: (
        <Icon>
          <path d="M4 9h13l-3-3M20 15H7l3 3" />
        </Icon>
      ),
    },
    {
      key: "me",
      label: "Me",
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

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-[640px] items-stretch justify-around">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-semibold transition-colors active:scale-[0.96]",
                  isActive
                    ? "text-accent-emerald-strong"
                    : "text-ink-tertiary",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-accent-emerald-soft" : "",
                  ].join(" ")}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
