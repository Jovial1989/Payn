"use client";

import clsx from "clsx";
import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import {
  getProductEntryActionLabel,
  SearchIcon,
} from "@/components/product-entry-action";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { trackSignInClicked } from "@/lib/analytics";
import { getDictionary } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";

type AppNavItem = {
  id: "dashboard" | "discover" | MarketplaceCategory | "settings";
  label: string;
  href: string;
  icon?: React.ReactNode;
  disabledWhenLoggedOut?: boolean;
};

type AppSection = AppNavItem["id"] | "offers" | "login" | "signup" | "other";

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function resolveCurrentSection(pathname: string | null): AppSection {
  if (!pathname) return "other";
  if (pathname.includes("/dashboard")) return "dashboard";
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/loans")) return "loans";
  if (pathname.includes("/cards")) return "cards";
  if (pathname.includes("/transfers")) return "transfers";
  if (pathname.includes("/exchange")) return "exchange";
  if (pathname.includes("/insurance")) return "insurance";
  if (pathname.includes("/investments")) return "investments";
  if (pathname.includes("/offers/")) return "offers";
  if (pathname.includes("/login")) return "login";
  if (pathname.includes("/signup")) return "signup";
  if (pathname.includes("/discover")) return "discover";
  return "other";
}

function getSectionTitle(
  section: AppSection,
  labels: Record<string, string>,
  authLabels: { signIn: string; createAccount: string; offerDetails: string },
) {
  if (section === "dashboard") return labels.dashboard;
  if (section === "settings") return labels.settings;
  if (section === "offers") return authLabels.offerDetails;
  if (section === "login") return authLabels.signIn;
  if (section === "signup") return authLabels.createAccount;
  return labels[section] ?? "Payn";
}

function SidebarLink({
  label,
  href,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <span className="flex w-full items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold text-ink-tertiary opacity-55">
        {icon}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors",
        active
          ? "bg-black text-white shadow-subtle"
          : "text-ink-secondary hover:bg-[#F3F4F6] hover:text-ink",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const productEntryActionLabel = getProductEntryActionLabel(preferences.locale);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navItems = useMemo<AppNavItem[]>(
    () => [
      { id: "dashboard", label: uiCopy.dashboard.navItems.dashboard.label, href: localePath(preferences.locale, "/dashboard") },
      {
        id: "discover",
        label: productEntryActionLabel,
        href: localePath(preferences.locale, "/discover"),
        icon: <SearchIcon className="h-4 w-4 shrink-0" />,
      },
      { id: "loans", label: dictionary.categories.loans, href: localePath(preferences.locale, "/loans") },
      { id: "cards", label: dictionary.categories.cards, href: localePath(preferences.locale, "/cards") },
      { id: "transfers", label: dictionary.categories.transfers, href: localePath(preferences.locale, "/transfers") },
      { id: "exchange", label: dictionary.categories.exchange, href: localePath(preferences.locale, "/exchange") },
      { id: "insurance", label: dictionary.categories.insurance, href: localePath(preferences.locale, "/insurance") },
      { id: "investments", label: dictionary.categories.investments, href: localePath(preferences.locale, "/investments") },
      {
        id: "settings",
        label: uiCopy.dashboard.navItems.profile.label,
        href: localePath(preferences.locale, "/settings"),
        disabledWhenLoggedOut: true,
      },
    ],
    [dictionary.categories, preferences.locale, productEntryActionLabel, uiCopy.dashboard.navItems],
  );

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
  }, [navItems, router]);

  useEffect(() => {
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  const currentSection = resolveCurrentSection(pathname);
  const sectionLabels = useMemo(
    () => ({
      dashboard: uiCopy.dashboard.navItems.dashboard.label,
      discover: productEntryActionLabel,
      loans: dictionary.categories.loans,
      cards: dictionary.categories.cards,
      transfers: dictionary.categories.transfers,
      exchange: dictionary.categories.exchange,
      insurance: dictionary.categories.insurance,
      investments: dictionary.categories.investments,
      settings: uiCopy.dashboard.navItems.profile.label,
    }),
    [dictionary.categories, productEntryActionLabel, uiCopy.dashboard.navItems],
  );
  const currentSectionTitle = getSectionTitle(currentSection, sectionLabels, {
    signIn: uiCopy.auth.signIn,
    createAccount: uiCopy.auth.createAccount,
    offerDetails: dictionary.offerDetail.detailEyebrow,
  });
  const displayName =
    [profile?.first_name?.trim(), profile?.last_name?.trim()].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Payn";
  const avatarInitials = getInitials(displayName) || "P";
  const handleSignInClick = () => {
    trackSignInClicked({
      country: preferences.country,
      language: preferences.locale,
      loggedIn: false,
    });
  };

  const handleLanguageChange = (nextLocale: typeof preferences.locale) => {
    preferences.setLanguage(nextLocale);
    startTransition(() => {
      router.push(switchLocalePath(pathname ?? localePath(preferences.locale, "/discover"), nextLocale));
    });
  };

  const handleCountryChange = (nextCountry: string) => {
    startTransition(() => {
      preferences.setCountry(nextCountry);
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace(localePath(preferences.locale, "/discover"));
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F7F7F8]">
      <div className="mx-auto flex max-w-[1600px] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:flex-row lg:px-5 lg:py-5">
        <aside className="hidden overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:w-[248px] lg:flex-col">
          <Link href={localePath(preferences.locale, "/")} className="flex items-center gap-3 border-b border-[#ECEDEF] px-5 py-5 transition-colors hover:bg-[#FAFAFA]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-ink">Payn</p>
              <p className="text-xs text-ink-tertiary">{uiCopy.common.backToSite}</p>
            </div>
          </Link>

          <div className="hidden flex-1 overflow-y-auto px-3 py-4 lg:block">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.id}
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  active={item.id === currentSection}
                  disabled={Boolean(item.disabledWhenLoggedOut && !user)}
                  onClick={() => undefined}
                />
              ))}
            </div>
          </div>
        </aside>

        {mobileNavOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,340px)] flex-col overflow-y-auto border-r border-[#EAEAEA] bg-white px-4 py-4 shadow-[0_24px_64px_rgba(17,24,39,0.22)] lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={localePath(preferences.locale, "/")}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold tracking-tight text-ink">Payn</p>
                    <p className="text-xs text-ink-tertiary">{uiCopy.common.backToSite}</p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-[#F3F4F6] hover:text-ink"
                  aria-label="Close navigation"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 grid gap-1">
                {navItems.map((item) => (
                  <SidebarLink
                    key={item.id}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    active={item.id === currentSection}
                    disabled={Boolean(item.disabledWhenLoggedOut && !user)}
                    onClick={() => setMobileNavOpen(false)}
                  />
                ))}
              </div>

              <div className="mt-6 grid gap-3 rounded-[22px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-4">
                <label className="grid gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {dictionary.nav.country}
                  </span>
                  <select
                    value={preferences.country}
                    onChange={(event) => handleCountryChange(event.target.value)}
                    className="h-11 rounded-[16px] border border-[#E3E5E8] bg-white px-3 text-sm font-semibold text-ink outline-none"
                  >
                    {preferences.availableCountries.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {dictionary.nav.language}
                  </span>
                  <select
                    value={preferences.locale}
                    onChange={(event) => handleLanguageChange(event.target.value as typeof preferences.locale)}
                    className="h-11 rounded-[16px] border border-[#E3E5E8] bg-white px-3 text-sm font-semibold text-ink outline-none"
                  >
                    {Object.entries(dictionary.locales).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[16px] border border-[#E3E5E8] bg-white px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{dictionary.nav.currency}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{preferences.currency}</p>
                </div>
              </div>
            </aside>
          </>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-2.5rem)] rounded-[24px] border border-[#EAEAEA] bg-[#FBFBFC] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <header className="border-b border-[#ECEDEF] bg-[#FBFBFC]/95 px-3 py-3 backdrop-blur sm:px-4 sm:py-4 lg:sticky lg:top-0 lg:z-30 lg:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(true);
                      setAccountMenuOpen(false);
                    }}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E3E5E8] bg-white text-ink transition-colors hover:bg-[#F7F7F8] lg:hidden"
                    aria-label="Open navigation"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 6h14M3 10h14M3 14h14" />
                    </svg>
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                      <Link href={localePath(preferences.locale, "/")} className="transition-colors hover:text-ink">
                        {uiCopy.common.home}
                      </Link>
                      <span>/</span>
                      <span className="truncate">{currentSectionTitle}</span>
                    </div>
                    <h1 className="mt-1 truncate text-base font-bold tracking-tight text-ink sm:text-lg">
                      {currentSectionTitle}
                    </h1>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <label className="hidden items-center gap-2 rounded-full border border-[#E3E5E8] bg-white px-3 py-2 text-sm xl:flex">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                      {dictionary.nav.country}
                    </span>
                    <select
                      value={preferences.country}
                      onChange={(event) => handleCountryChange(event.target.value)}
                      className="bg-transparent text-sm font-semibold text-ink outline-none"
                    >
                      {preferences.availableCountries.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="hidden items-center gap-2 rounded-full border border-[#E3E5E8] bg-white px-3 py-2 text-sm xl:flex">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                      {dictionary.nav.language}
                    </span>
                    <select
                      value={preferences.locale}
                      onChange={(event) => handleLanguageChange(event.target.value as typeof preferences.locale)}
                      className="bg-transparent text-sm font-semibold text-ink outline-none"
                    >
                      {Object.entries(dictionary.locales).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span className="hidden rounded-full border border-[#E3E5E8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-tertiary sm:inline-flex xl:inline-flex">
                    {preferences.currency}
                  </span>

                  {user ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen((open) => !open);
                          setMobileNavOpen(false);
                        }}
                        className="flex items-center gap-2 rounded-full border border-[#E3E5E8] bg-white px-2.5 py-2 transition-colors hover:bg-[#F7F7F8]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                          {avatarInitials}
                        </span>
                        <span className="hidden max-w-[180px] truncate text-sm font-semibold text-ink sm:inline">
                          {displayName}
                        </span>
                      </button>

                      {accountMenuOpen ? (
                        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 grid min-w-[180px] gap-1 rounded-[18px] border border-[#EAEAEA] bg-white p-2 shadow-[0_18px_36px_rgba(17,24,39,0.12)]">
                          <Link
                            href={localePath(preferences.locale, "/settings")}
                            onClick={() => setAccountMenuOpen(false)}
                            className="rounded-[14px] px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#F3F4F6]"
                          >
                            {uiCopy.dashboard.navItems.profile.label}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              void handleSignOut();
                            }}
                            className="rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-[#F3F4F6]"
                          >
                            {uiCopy.common.signOut}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      href={localePath(preferences.locale, "/login")}
                      onClick={handleSignInClick}
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      {uiCopy.auth.signIn}
                    </Link>
                  )}
                </div>
              </div>
            </header>

            <div className="p-3 sm:p-5 lg:p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
