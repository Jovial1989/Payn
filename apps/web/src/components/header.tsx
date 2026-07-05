"use client";

import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { trackSignInClicked } from "@/lib/analytics";
// WEB.3 — Global Compare indicator in the top header. Mirrors the
// Saved-tab badge in MobileBottomNav so desktop users get the same
// "you have a shortlist" cue right where they're already looking.
import { CompareHeaderChip } from "@/features/compare/compare-header-chip";
import { getDictionary } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/locale";
import { supportedLocales } from "@/lib/marketplace";
import { getUiCopy } from "@/lib/ui-copy";

const navKeys = ["marketplace", "about", "contact"] as const;
const navPaths: Record<(typeof navKeys)[number], string> = {
  marketplace: "/discover",
  about: "/about",
  contact: "/contact",
};

function inferActivePage(pathname: string | null) {
  if (!pathname) return "marketplace" as const;
  if (pathname.includes("/about")) return "about" as const;
  if (pathname.includes("/contact")) return "contact" as const;
  if (pathname.includes("/waitlist")) return "waitlist" as const;
  return "marketplace" as const;
}

export function Header({
  activePage,
  activeCategory,
}: {
  activePage?: "marketplace" | "about" | "contact" | "waitlist";
  activeCategory?: MarketplaceCategory;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const isSignedIn = Boolean(user);
  const isAdmin = user?.app_metadata?.role === "admin"; // SEC-FIX PAYN-A13: only app_metadata is server-set
  const { locale } = preferences;
  const resolvedActivePage = activePage ?? inferActivePage(pathname);
  const authStateLabel = useMemo(
    () => (isSignedIn ? uiCopy.header.loggedInState : uiCopy.common.guest),
    [isSignedIn, uiCopy.common.guest, uiCopy.header.loggedInState],
  );

  // Derive display name + initials from profile or email fallback
  const displayName = useMemo(() => {
    if (profile?.first_name || profile?.last_name) {
      return [profile.first_name, profile.last_name].filter(Boolean).join(" ");
    }
    return user?.email?.split("@")[0] ?? "";
  }, [profile, user]);

  const avatarInitials = useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.first_name) return profile.first_name[0].toUpperCase();
    return (user?.email?.[0] ?? "P").toUpperCase();
  }, [profile, user]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [avatarMenuOpen]);
  const handleSignInClick = () => {
    if (isSignedIn) {
      return;
    }

    trackSignInClicked({
      country: preferences.country,
      language: preferences.locale,
      loggedIn: false,
    });
  };

  const handleLocaleChange = (nextLocale: MarketplaceLocale) => {
    preferences.setLocale(nextLocale);
    startTransition(() => {
      router.push(switchLocalePath(pathname, nextLocale));
    });
  };

  const handleCountryChange = (nextCountry: string) => {
    preferences.setCountry(nextCountry);

    if (activePage === "marketplace" && activeCategory) {
      startTransition(() => {
        router.push(localePath(locale, `/${activeCategory}`));
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:min-h-[72px] lg:gap-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            href={localePath(locale, "/")}
            className="flex items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Payn — home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-accent-emerald/15 bg-accent-emerald-soft shadow-[0_10px_24px_rgba(15,138,75,0.10)]">
              {/* P2.11 — The previous mark was a bare chevron path
                  (M4 12L8 4L12 12) which read as a back-arrow because
                  it has no anchor or context. We now draw a small
                  upward "growth" symbol: a horizontal baseline + the
                  V peak + a filled dot at the apex. The baseline gives
                  the glyph weight on the bottom so it can't be
                  confused with a navigation control. */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3.5 14H14.5"
                  stroke="#0F8A4B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4.5 11.5L9 4.5L13.5 11.5"
                  stroke="#0F8A4B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="4.5" r="1.4" fill="#0F8A4B" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navKeys.map((key) => {
              const label =
                key === "marketplace" ? (
                  dictionary.nav.marketplace
                ) : key === "about" ? (
                  dictionary.nav.about
                ) : (
                  dictionary.nav.contact
                );

              return (
                <Link
                  key={key}
                  href={localePath(locale, navPaths[key])}
                  data-active={resolvedActivePage === key}
                  className={clsx(
                    "nav-link inline-flex items-center gap-2 pb-1 text-sm font-medium",
                    resolvedActivePage === key ? "text-ink" : "text-ink-secondary hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="nav-link inline-flex items-center gap-1.5 rounded-full bg-accent-emerald-soft px-3 py-1 text-sm font-semibold text-accent-emerald-strong hover:bg-accent-emerald/10"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-line bg-white px-2 py-1 shadow-subtle lg:flex">
            <label className="relative flex items-center gap-2 pl-2 pr-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.nav.country}
              </span>
              <select
                value={preferences.country}
                onChange={(event) => handleCountryChange(event.target.value)}
                className="appearance-none bg-transparent text-sm font-medium text-ink outline-none"
                aria-label={dictionary.nav.country}
              >
                {preferences.availableCountries.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink-tertiary"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>

            <span className="mx-1 h-5 w-px bg-line" />

            <label className="relative flex items-center gap-2 pl-2 pr-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.nav.language}
              </span>
              <select
                value={preferences.locale}
                onChange={(event) => handleLocaleChange(event.target.value as MarketplaceLocale)}
                className="appearance-none bg-transparent text-sm font-medium text-ink outline-none"
                aria-label={dictionary.nav.language}
              >
                {supportedLocales.map((value) => (
                  <option key={value} value={value}>
                    {dictionary.locales[value]}
                  </option>
                ))}
              </select>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink-tertiary"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
          </div>

          {/* WEB.3 — Compare chip sits between the country/lang picker
              and the auth pill. Renders nothing when the compare set
              is empty, so it doesn't take up space until the user has
              actually picked something. */}
          <CompareHeaderChip locale={locale} />

          {isSignedIn ? (
            <div ref={avatarMenuRef} className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setAvatarMenuOpen((o) => !o)}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-[13px] font-semibold text-ink shadow-subtle transition-all hover:border-accent-emerald/40 hover:shadow-card"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-emerald-soft text-[11px] font-bold text-accent-emerald-strong">
                  {avatarInitials}
                </span>
                <span className="max-w-[120px] truncate">{displayName}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className={clsx("text-ink-tertiary transition-transform", avatarMenuOpen && "rotate-180")}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {avatarMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-line bg-white p-1.5 shadow-card">
                  <div className="border-b border-line px-3 py-2 mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Account</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">{user?.email}</p>
                  </div>
                  <Link
                    href={localePath(locale, "/dashboard")}
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-bg-surface"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setAvatarMenuOpen(false);
                      await signOut?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={localePath(locale, "/login")}
              onClick={handleSignInClick}
              className="hidden items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-surface lg:inline-flex"
            >
              {dictionary.nav.signIn}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink lg:hidden"
            aria-label={mobileMenuOpen ? uiCopy.header.closeMenuLabel : uiCopy.header.openMenuLabel}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-line bg-white/95 px-4 pb-4 pt-3 shadow-card sm:px-5 lg:hidden">
          <nav className="grid gap-1">
            {navKeys.map((key) => {
              const label =
                key === "marketplace" ? (
                  dictionary.nav.marketplace
                ) : key === "about" ? (
                  dictionary.nav.about
                ) : (
                  dictionary.nav.contact
                );

              return (
                <Link
                  key={key}
                  href={localePath(locale, navPaths[key])}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "pressable inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    resolvedActivePage === key
                      ? "bg-bg-surface text-ink"
                      : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="pressable inline-flex items-center gap-2 rounded-2xl bg-accent-emerald-soft px-4 py-3 text-sm font-semibold text-accent-emerald-strong"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Admin
              </Link>
            )}
          </nav>

          <div className="mt-4 rounded-[26px] border border-line bg-white p-4 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {isSignedIn ? (
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-emerald-soft text-[11px] font-bold text-accent-emerald-strong">
                    {avatarInitials}
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    {authStateLabel}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-secondary">
                    {isSignedIn ? (user?.email ?? displayName) : preferences.countryLabel}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isSignedIn ? (
                  <>
                    <Link
                      href={localePath(locale, "/dashboard")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full bg-accent-emerald-soft px-4 py-2 text-sm font-medium text-accent-emerald-strong transition-colors hover:bg-accent-emerald-soft/80"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await signOut?.();
                      }}
                      className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href={localePath(locale, "/login")}
                    onClick={() => {
                      handleSignInClick();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-surface"
                  >
                    {dictionary.nav.signIn}
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {dictionary.nav.country}
                </span>
                <select
                  value={preferences.country}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none"
                >
                  {preferences.availableCountries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {dictionary.nav.language}
                </span>
                <select
                  value={preferences.locale}
                  onChange={(event) => handleLocaleChange(event.target.value as MarketplaceLocale)}
                  className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none"
                >
                  {supportedLocales.map((value) => (
                    <option key={value} value={value}>
                      {dictionary.locales[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
