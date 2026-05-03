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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/86 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:min-h-[72px] lg:gap-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link href={localePath(locale, "/")} className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 shadow-[0_0_28px_rgba(34,211,238,0.16)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="#e2f8ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100">Payn</span>
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
                    resolvedActivePage === key ? "text-slate-100" : "text-slate-400 hover:text-slate-100",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 shadow-[0_16px_36px_rgba(0,0,0,0.18)] lg:flex">
            <label className="relative flex items-center gap-2 pl-2 pr-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {dictionary.nav.country}
              </span>
              <select
                value={preferences.country}
                onChange={(event) => handleCountryChange(event.target.value)}
                className="appearance-none bg-transparent text-sm font-medium text-slate-100 outline-none"
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
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>

            <span className="mx-1 h-5 w-px bg-white/10" />

            <label className="relative flex items-center gap-2 pl-2 pr-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {dictionary.nav.language}
              </span>
              <select
                value={preferences.locale}
                onChange={(event) => handleLocaleChange(event.target.value as MarketplaceLocale)}
                className="appearance-none bg-transparent text-sm font-medium text-slate-100 outline-none"
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
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-500"
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
                ? "border-cyan-400/25 bg-cyan-400/12 text-cyan-100 hover:bg-cyan-400/18"
                : "border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]",
            )}
          >
            <span className={clsx("text-[10px] font-semibold uppercase tracking-[0.16em]", isSignedIn ? "text-cyan-200/70" : "text-slate-500")}>
              {authStateLabel}
            </span>
            <span>{isSignedIn ? uiCopy.dashboard.navItems.dashboard.label : dictionary.nav.signIn}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/[0.06] lg:hidden"
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
        <div className="border-t border-white/10 bg-zinc-950/95 px-4 pb-4 pt-3 sm:px-5 lg:hidden">
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
                      ? "bg-white/[0.08] text-slate-100"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {authStateLabel}
                </p>
                <p className="mt-1 text-sm text-slate-400">
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
                    ? "bg-cyan-400/12 text-cyan-100 hover:bg-cyan-400/18"
                    : "border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]",
                )}
              >
                {isSignedIn ? uiCopy.dashboard.navItems.dashboard.label : dictionary.nav.signIn}
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {dictionary.nav.country}
                </span>
                <select
                  value={preferences.country}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-slate-100 outline-none"
                >
                  {preferences.availableCountries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {dictionary.nav.language}
                </span>
                <select
                  value={preferences.locale}
                  onChange={(event) => handleLocaleChange(event.target.value as MarketplaceLocale)}
                  className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-slate-100 outline-none"
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
