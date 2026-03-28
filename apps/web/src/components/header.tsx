"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceMarket } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { getDictionary } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/locale";
import { getMarketCategoryHref } from "@/lib/marketplace";

const navKeys = ["marketplace", "about", "contact"] as const;
const navPaths: Record<(typeof navKeys)[number], string> = {
  marketplace: "/explore",
  about: "/about",
  contact: "/contact",
};

function UserAvatar({ email, onClick }: { email: string; onClick: () => void }) {
  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-bold text-white transition-colors hover:bg-gray-800"
      aria-label="Account menu"
    >
      {initials}
    </button>
  );
}

function UserDropdown({
  email,
  userType,
  locale,
  onClose,
  onSignOut,
}: {
  email: string;
  userType: string | null;
  locale: MarketplaceLocale;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-2 w-[240px] rounded-2xl border border-line bg-white p-2 shadow-elevated">
        <div className="px-3 py-3">
          <p className="text-sm font-semibold text-ink">{email.split("@")[0]}</p>
          <p className="mt-0.5 text-xs text-ink-tertiary">{email}</p>
          {userType && (
            <p className="mt-1 text-xs text-ink-tertiary capitalize">{userType} account</p>
          )}
        </div>
        <div className="border-t border-line pt-1">
          <Link
            href={localePath(locale, "/dashboard")}
            onClick={onClose}
            className="flex w-full rounded-xl px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href={localePath(locale, "/dashboard?view=saved")}
            onClick={onClose}
            className="flex w-full rounded-xl px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
          >
            Saved offers
          </Link>
          <Link
            href={localePath(locale, "/dashboard?view=profile")}
            onClick={onClose}
            className="flex w-full rounded-xl px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
          >
            Profile
          </Link>
        </div>
        <div className="border-t border-line pt-1">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isSignedIn = Boolean(user);
  const { locale } = preferences;

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

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    window.location.href = localePath(locale, "/");
  };

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex min-h-16 max-w-[1240px] items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <Link href={localePath(locale, "/")} className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-black">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
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
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activePage === key
                    ? "bg-bg-surface text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop market/language selectors */}
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

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            /* Signed-in: avatar with dropdown */
            <div className="relative hidden sm:block">
              <UserAvatar
                email={user!.email ?? "U"}
                onClick={() => setUserMenuOpen((o) => !o)}
              />
              {userMenuOpen && (
                <UserDropdown
                  email={user!.email ?? ""}
                  userType={profile?.user_type ?? null}
                  locale={locale}
                  onClose={() => setUserMenuOpen(false)}
                  onSignOut={handleSignOut}
                />
              )}
            </div>
          ) : (
            /* Anonymous: sign in + CTA */
            <>
              <Link
                href={localePath(locale, "/login")}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
              >
                {dictionary.nav.signIn}
              </Link>
              <Link
                href={localePath(locale, "/signup")}
                className="hidden rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:block"
              >
                {dictionary.nav.compareOptions}
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-line bg-white px-5 pb-5 pt-4 lg:hidden">
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
            {isSignedIn && (
              <Link
                href={localePath(locale, "/dashboard")}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
              >
                Dashboard
              </Link>
            )}
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
            {isSignedIn ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    {(user!.email ?? "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{user!.email?.split("@")[0]}</p>
                    <p className="text-xs text-ink-tertiary">{user!.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={localePath(locale, "/login")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface"
                >
                  {dictionary.nav.signIn}
                </Link>
                <Link
                  href={localePath(locale, "/signup")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-black px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  {dictionary.nav.compareOptions}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
