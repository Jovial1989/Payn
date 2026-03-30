import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";

export type DashboardView =
  | "dashboard"
  | MarketplaceCategory
  | "profile";

export interface DashboardNavItem {
  id: DashboardView;
  label: string;
  group: "core" | "products" | "account";
  description: string;
}

export function getDashboardNavItems(locale: MarketplaceLocale): DashboardNavItem[] {
  const navItems = getUiCopy(locale).dashboard.navItems;

  return [
    {
      id: "dashboard",
      label: navItems.dashboard.label,
      group: "core",
      description: navItems.dashboard.description,
    },
    { id: "loans", label: navItems.loans.label, group: "products", description: navItems.loans.description },
    { id: "cards", label: navItems.cards.label, group: "products", description: navItems.cards.description },
    { id: "transfers", label: navItems.transfers.label, group: "products", description: navItems.transfers.description },
    { id: "exchange", label: navItems.exchange.label, group: "products", description: navItems.exchange.description },
    { id: "insurance", label: navItems.insurance.label, group: "products", description: navItems.insurance.description },
    { id: "investments", label: navItems.investments.label, group: "products", description: navItems.investments.description },
    { id: "profile", label: navItems.profile.label, group: "account", description: navItems.profile.description },
  ];
}

const dashboardViewSet = new Set<DashboardView>([
  "dashboard",
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
  "profile",
]);

export function normalizeDashboardView(value?: string | null): DashboardView {
  if (value && dashboardViewSet.has(value as DashboardView)) {
    return value as DashboardView;
  }

  return "dashboard";
}

export function getActiveDashboardView(pathname: string | null, value?: string | null): DashboardView {
  if (!pathname || !pathname.includes("/dashboard")) {
    return "dashboard";
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (lastSegment && dashboardViewSet.has(lastSegment as DashboardView) && lastSegment !== "dashboard") {
    return lastSegment as DashboardView;
  }

  return normalizeDashboardView(value);
}

export function getDashboardHref(view: DashboardView, locale?: MarketplaceLocale) {
  const path = view === "dashboard" ? "/dashboard" : `/dashboard?view=${view}`;
  return locale ? localePath(locale, path) : path;
}
