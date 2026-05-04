"use client";

import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { trackSignInClicked } from "@/lib/analytics";
import { getDictionary } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/locale";
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
  const { user } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSignedIn = Boolean(user);
  const { locale } = preferences;
  const resolvedActivePage = activePage ?? inferActivePage(pathname);
  const authStateLabel = useMemo(
    () => (isSignedIn ? uiCopy.header.loggedInState : uiCopy.common.guest),
    [isSignedIn, uiCopy.common.guest, uiCopy.header.loggedInState],
  );
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
          <Link href={localePath(locale, "/")} className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-accent-emerald/15 bg-accent-emerald-soft shadow-[0_10px_24px_rgba(15,138,75,0.10)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="#0F8A4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                {Object.entries(dictionary.locales).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
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

          <Link
            href={localePath(locale, isSignedIn ? "/dashboard" : "/login")}
            onClick={handleSignInClick}
            className={clsx(
              "hidden items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors lg:inline-flex",
              isSignedIn
                ? "border-accent-emerald/25 bg-accent-emerald-soft text-accent-emerald-strong hover:bg-accent-emerald-soft/80"
                : "border-line bg-white text-ink hover:bg-bg-surface",
            )}
          >
            <span className={clsx("text-[10px] font-semibold uppercase tracking-[0.16em]", isSignedIn ? "text-accent-emerald" : "text-ink-tertiary")}>
              {authStateLabel}
            </span>
            <span>{isSignedIn ? uiCopy.dashboard.navItems.dashboard.label : dictionary.nav.signIn}</span>
          </Link>

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
          </nav>

          <div className="mt-4 rounded-[26px] border border-line bg-white p-4 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {authStateLabel}
                </p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {preferences.countryLabel}
                </p>
              </div>
              <Link
                href={localePath(locale, isSignedIn ? "/dashboard" : "/login")}
                onClick={() => {
                  handleSignInClick();
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isSignedIn
                    ? "bg-accent-emerald-soft text-accent-emerald-strong hover:bg-accent-emerald-soft/80"
                    : "border border-line bg-white text-ink hover:bg-bg-surface",
                )}
              >
                {isSignedIn ? uiCopy.dashboard.navItems.dashboard.label : dictionary.nav.signIn}
              </Link>
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
                  {Object.entries(dictionary.locales).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
