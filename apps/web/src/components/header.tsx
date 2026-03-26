"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceMarket } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { getDictionary } from "@/lib/i18n";
import { getMarketCategoryHref } from "@/lib/marketplace";

const navItems = [
  { href: "/explore", key: "marketplace" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({
  activePage,
  activeCategory,
}: {
  activePage?: "marketplace" | "about" | "contact" | "waitlist";
  activeCategory?: MarketplaceCategory;
}) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const signInHref = user ? "/dashboard" : "/login";
  const getStartedHref =
    user && profile?.onboarding_completed ? "/dashboard" : "/signup";

  const handleLocaleChange = (nextLocale: MarketplaceLocale) => {
    preferences.setLocale(nextLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleMarketChange = (nextMarket: MarketplaceMarket) => {
    preferences.setMarket(nextMarket);

    if (activePage === "marketplace" && activeCategory) {
      startTransition(() => {
        router.push(getMarketCategoryHref(nextMarket, activeCategory));
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex min-h-16 max-w-[1240px] items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const label =
              item.key === "marketplace"
                ? dictionary.nav.marketplace
                : item.key === "about"
                  ? dictionary.nav.about
                  : dictionary.nav.contact;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activePage === item.key
                    ? "bg-bg-surface text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <label className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-secondary">
            <span>{dictionary.nav.country}</span>
            <select
              value={preferences.market}
              onChange={(event) => handleMarketChange(event.target.value as MarketplaceMarket)}
              className="bg-transparent text-sm font-medium text-ink outline-none"
            >
              {Object.entries(dictionary.markets).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-secondary">
            <span>{dictionary.nav.language}</span>
            <select
              value={preferences.locale}
              onChange={(event) => handleLocaleChange(event.target.value as MarketplaceLocale)}
              className="bg-transparent text-sm font-medium text-ink outline-none"
            >
              {Object.entries(dictionary.locales).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={signInHref}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
          >
            {user ? dictionary.nav.dashboard : dictionary.nav.signIn}
          </Link>
          <Link
            href={getStartedHref}
            className="hidden rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:block"
          >
            {user && profile?.onboarding_completed ? dictionary.nav.dashboard : dictionary.nav.compareOptions}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-bg-surface lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
        <div className="border-t border-line bg-white px-5 pb-5 pt-4 lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const label =
                item.key === "marketplace"
                  ? dictionary.nav.marketplace
                  : item.key === "about"
                    ? dictionary.nav.about
                    : dictionary.nav.contact;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    activePage === item.key
                      ? "bg-bg-surface text-ink"
                      : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 grid gap-3 border-t border-line pt-4">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
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
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
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

          <div className="mt-4 grid gap-2 border-t border-line pt-4">
            <Link
              href={signInHref}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface"
            >
              {user ? dictionary.nav.dashboard : dictionary.nav.signIn}
            </Link>
            <Link
              href={getStartedHref}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full bg-black px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {user && profile?.onboarding_completed ? dictionary.nav.dashboard : dictionary.nav.compareOptions}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
