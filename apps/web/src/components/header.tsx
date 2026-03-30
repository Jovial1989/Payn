"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceMarket } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { getDictionary } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/locale";
import { getMarketCategoryHref } from "@/lib/marketplace";
import { getUiCopy } from "@/lib/ui-copy";

const navKeys = ["marketplace", "about", "contact"] as const;
const navPaths: Record<(typeof navKeys)[number], string> = {
  marketplace: "/explore",
  about: "/about",
  contact: "/contact",
};

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
  const authStateLabel = useMemo(
    () => (isSignedIn ? uiCopy.header.loggedInState : uiCopy.common.guest),
    [isSignedIn, uiCopy.common.guest, uiCopy.header.loggedInState],
  );

  const handleLocaleChange = (nextLocale: MarketplaceLocale) => {
    preferences.setLocale(nextLocale);
    startTransition(() => {
      router.push(switchLocalePath(pathname, nextLocale));
    });
  };

  const handleMarketChange = (nextMarket: MarketplaceMarket) => {
    preferences.setMarket(nextMarket);

    if (activePage === "marketplace" && activeCategory) {
      startTransition(() => {
        router.push(localePath(locale, getMarketCategoryHref(nextMarket, activeCategory)));
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex min-h-[72px] max-w-[1240px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <Link href={localePath(locale, "/")} className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navKeys.map((key) => {
              const label =
                key === "marketplace"
                  ? dictionary.nav.marketplace
                  : key === "about"
                    ? dictionary.nav.about
                    : dictionary.nav.contact;

              return (
                <Link
                  key={key}
                  href={localePath(locale, navPaths[key])}
                  className={clsx(
                    "relative pb-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:rounded-full after:transition-opacity",
                    activePage === key
                      ? "text-ink after:bg-black/85 after:opacity-100"
                      : "text-ink-secondary after:opacity-0 hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center rounded-full border border-black/6 bg-white/88 px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:flex">
            <label className="relative flex items-center gap-2 pl-2 pr-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                {dictionary.nav.country}
              </span>
              <select
                value={preferences.market}
                onChange={(event) => handleMarketChange(event.target.value as MarketplaceMarket)}
                className="appearance-none bg-transparent text-sm font-medium text-ink outline-none"
                aria-label={dictionary.nav.country}
              >
                {Object.entries(dictionary.markets).map(([value, label]) => (
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

            <span className="mx-1 h-5 w-px bg-black/8" />

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
            className={clsx(
              "hidden items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors lg:inline-flex",
              isSignedIn
                ? "border-black bg-black text-white hover:bg-gray-800"
                : "border-line bg-white text-ink hover:bg-bg-surface",
            )}
          >
            <span className={clsx("text-[10px] font-semibold uppercase tracking-[0.16em]", isSignedIn ? "text-white/65" : "text-ink-tertiary")}>
              {authStateLabel}
            </span>
            <span>{isSignedIn ? uiCopy.dashboard.navItems.dashboard.label : dictionary.nav.signIn}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-bg-surface lg:hidden"
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
        <div className="border-t border-black/5 bg-white/95 px-5 pb-5 pt-4 lg:hidden">
          <nav className="grid gap-1">
            {navKeys.map((key) => {
              const label =
                key === "marketplace"
                  ? dictionary.nav.marketplace
                  : key === "about"
                    ? dictionary.nav.about
                    : dictionary.nav.contact;

              return (
                <Link
                  key={key}
                  href={localePath(locale, navPaths[key])}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    activePage === key
                      ? "bg-bg-surface text-ink"
                      : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-[26px] border border-line bg-[#F6F7F8] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {authStateLabel}
                </p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {dictionary.markets[preferences.market]}
                </p>
              </div>
              <Link
                href={localePath(locale, isSignedIn ? "/dashboard" : "/login")}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isSignedIn
                    ? "bg-black text-white hover:bg-gray-800"
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
                  value={preferences.market}
                  onChange={(event) => handleMarketChange(event.target.value as MarketplaceMarket)}
                  className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none"
                >
                  {Object.entries(dictionary.markets).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
