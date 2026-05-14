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
import { categoryGroups, marketplaceCategories } from "@/lib/marketplace";
import { getActiveCategoriesForCountry } from "@/lib/countries";

const groupOrderByUserType: Record<string, string[]> = {
  business:  ["business", "borrow", "transfers", "banking", "invest", "lifestyle"],
  freelancer: ["business", "banking", "borrow", "transfers", "lifestyle", "invest"],
  personal:  ["banking", "transfers", "borrow", "invest", "lifestyle", "business"],
};

function sortGroupsByUserType(groups: typeof categoryGroups, userType: string | null | undefined) {
  const order = groupOrderByUserType[userType ?? "personal"] ?? groupOrderByUserType.personal;
  return [...groups].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

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
  if (pathname.includes("/offers/")) return "offers";
  if (pathname.includes("/login")) return "login";
  if (pathname.includes("/signup")) return "signup";
  if (pathname.includes("/discover")) return "discover";
  for (const cat of marketplaceCategories) {
    if (pathname.includes(`/${cat}`)) return cat;
  }
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
          ? "bg-accent-emerald-soft text-accent-emerald-strong shadow-[0_0_0_1px_rgba(15,138,75,0.15)]"
          : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
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
  const isAdmin = user?.email === "admin@admin.com" || user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin";
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const productEntryActionLabel = getProductEntryActionLabel(preferences.locale);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const activeCategories = useMemo(
    () => getActiveCategoriesForCountry(preferences.country),
    [preferences.country],
  );
  const visibleCategoryGroups = useMemo(
    () => sortGroupsByUserType(categoryGroups, profile?.user_type)
      .map((g) => ({ ...g, categories: g.categories.filter((c) => activeCategories.has(c)) }))
      .filter((g) => g.categories.length > 0),
    [activeCategories, profile?.user_type],
  );

  const systemItems = useMemo<AppNavItem[]>(
    () => [
      { id: "dashboard", label: uiCopy.dashboard.navItems.dashboard.label, href: localePath(preferences.locale, "/dashboard") },
      {
        id: "discover",
        label: productEntryActionLabel,
        href: localePath(preferences.locale, "/discover"),
        icon: <SearchIcon className="h-4 w-4 shrink-0" />,
      },
    ],
    [preferences.locale, productEntryActionLabel, uiCopy.dashboard.navItems],
  );

  const settingsItem = useMemo<AppNavItem>(
    () => ({
      id: "settings",
      label: uiCopy.dashboard.navItems.profile.label,
      href: localePath(preferences.locale, "/settings"),
      disabledWhenLoggedOut: true,
    }),
    [preferences.locale, uiCopy.dashboard.navItems],
  );

  const navItems = useMemo<AppNavItem[]>(
    () => [
      ...systemItems,
      ...marketplaceCategories.map((cat) => ({
        id: cat as AppNavItem["id"],
        label: dictionary.categories[cat],
        href: localePath(preferences.locale, `/${cat}`),
      })),
      settingsItem,
    ],
    [dictionary.categories, preferences.locale, systemItems, settingsItem],
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
      settings: uiCopy.dashboard.navItems.profile.label,
      ...Object.fromEntries(marketplaceCategories.map((cat) => [cat, dictionary.categories[cat]])),
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
    router.refresh();
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-ink">
      <div className="mx-auto flex max-w-[1600px] gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:px-5 lg:py-5">
        <aside className="hidden overflow-hidden rounded-[24px] border border-line bg-white shadow-card lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:w-[248px] lg:flex-col">
          <Link href={localePath(preferences.locale, "/")} className="flex items-center gap-3 border-b border-line px-5 py-5 transition-colors hover:bg-bg-surface">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent-emerald/15 bg-accent-emerald-soft">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-emerald-strong" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-ink">Payn</p>
              <p className="text-xs text-ink-tertiary">{uiCopy.common.backToSite}</p>
            </div>
          </Link>

          <div className="hidden flex-1 overflow-y-auto px-3 py-4 lg:block">
            <div className="grid gap-1">
              {systemItems.map((item) => (
                <SidebarLink key={item.id} label={item.label} href={item.href} icon={item.icon}
                  active={item.id === currentSection} onClick={() => undefined} />
              ))}
            </div>
            <div className="mt-3 grid gap-4">
              {visibleCategoryGroups.map((group) => (
                <div key={group.id}>
                  <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {dictionary.sidebarNav[group.labelKey]}
                  </p>
                  <div className="grid gap-0.5">
                    {group.categories.map((cat) => (
                      <SidebarLink key={cat} label={dictionary.categories[cat]}
                        href={localePath(preferences.locale, `/${cat}`)}
                        active={currentSection === cat} onClick={() => undefined} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-1 border-t border-line pt-3">
              <SidebarLink label={settingsItem.label} href={settingsItem.href}
                active={currentSection === "settings"}
                disabled={Boolean(settingsItem.disabledWhenLoggedOut && !user)}
                onClick={() => undefined} />
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
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,340px)] flex-col overflow-y-auto border-r border-line bg-white px-4 py-4 shadow-elevated lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={localePath(preferences.locale, "/")}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent-emerald/15 bg-accent-emerald-soft">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 12L8 4L12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-emerald-strong" />
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                  aria-label="Close navigation"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 grid gap-1">
                {systemItems.map((item) => (
                  <SidebarLink key={item.id} label={item.label} href={item.href} icon={item.icon}
                    active={item.id === currentSection} onClick={() => setMobileNavOpen(false)} />
                ))}
              </div>
              <div className="mt-3 grid gap-4">
                {visibleCategoryGroups.map((group) => (
                  <div key={group.id}>
                    <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                      {dictionary.sidebarNav[group.labelKey]}
                    </p>
                    <div className="grid gap-0.5">
                      {group.categories.map((cat) => (
                        <SidebarLink key={cat} label={dictionary.categories[cat]}
                          href={localePath(preferences.locale, `/${cat}`)}
                          active={currentSection === cat} onClick={() => setMobileNavOpen(false)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-1 border-t border-line pt-3">
                <SidebarLink label={settingsItem.label} href={settingsItem.href}
                  active={currentSection === "settings"}
                  disabled={Boolean(settingsItem.disabledWhenLoggedOut && !user)}
                  onClick={() => setMobileNavOpen(false)} />
              </div>

              <div className="mt-6 grid gap-3 rounded-[22px] border border-line bg-bg-surface px-4 py-4">
                <label className="grid gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {dictionary.nav.country}
                  </span>
                  <select
                    value={preferences.country}
                    onChange={(event) => handleCountryChange(event.target.value)}
                    className="h-11 rounded-[16px] border border-line bg-white px-3 text-sm font-semibold text-ink outline-none"
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
                    className="h-11 rounded-[16px] border border-line bg-white px-3 text-sm font-semibold text-ink outline-none"
                  >
                    {Object.entries(dictionary.locales).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[16px] border border-line bg-white px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{dictionary.nav.currency}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{preferences.currency}</p>
                </div>
              </div>
            </aside>
          </>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-2.5rem)] rounded-[24px] border border-line bg-white shadow-card">
            <header className="border-b border-line bg-white/95 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4 lg:sticky lg:top-0 lg:z-30 lg:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(true);
                      setAccountMenuOpen(false);
                    }}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-bg-surface lg:hidden"
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
                  <label className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm xl:flex">
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

                  <label className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm xl:flex">
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

                  <span className="hidden rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-tertiary sm:inline-flex xl:inline-flex">
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
                        className="flex items-center gap-2 rounded-full border border-line bg-white px-2.5 py-2 transition-colors hover:bg-bg-surface"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-emerald/20 bg-accent-emerald-soft text-xs font-bold text-accent-emerald-strong">
                          {avatarInitials}
                        </span>
                        <span className="hidden max-w-[180px] truncate text-sm font-semibold text-ink sm:inline">
                          {displayName}
                        </span>
                      </button>

                      {accountMenuOpen ? (
                        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 grid min-w-[180px] gap-1 rounded-[18px] border border-line bg-white p-2 shadow-elevated">
                          <Link
                            href={localePath(preferences.locale, "/settings")}
                            onClick={() => setAccountMenuOpen(false)}
                            className="rounded-[14px] px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
                          >
                            {uiCopy.dashboard.navItems.profile.label}
                          </Link>
                          {isAdmin ? (
                            <Link
                              href="/admin"
                              onClick={() => setAccountMenuOpen(false)}
                              className="rounded-[14px] px-3 py-2 text-sm font-semibold text-accent-emerald transition-colors hover:bg-accent-emerald-soft"
                            >
                              Admin panel
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              void handleSignOut();
                            }}
                            className="rounded-[14px] px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
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

            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
