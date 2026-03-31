import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";

export type DashboardView =
  | "dashboard"
  | "discover"
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
    {
      id: "discover",
      label: navItems.discover.label,
      group: "core",
      description: navItems.discover.description,
    },
    { id: "loans", label: navItems.loans.label, group: "products", description: navItems.loans.description },
    { id: "cards", label: navItems.cards.label, group: "products", description: navItems.cards.description },
    { id: "transfers", label: navItems.transfers.label, group: "products", description: navItems.transfers.description },
    { id: "exchange", label: navItems.exchange.label, group: "products", description: navItems.exchange.description },
    { id: "insurance", label: navItems.insurance.label, group: "products", description: navItems.insurance.description },
    {
      id: "investments",
      label: navItems.investments.label,
      group: "products",
      description: navItems.investments.description,
    },
    { id: "profile", label: navItems.profile.label, group: "account", description: navItems.profile.description },
  ];
}

const dashboardViewSet = new Set<DashboardView>([
  "dashboard",
  "discover",
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

const productCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

export function getActiveDashboardView(pathname: string | null, value?: string | null): DashboardView {
  if (!pathname) {
    return "dashboard";
  }

  for (const category of productCategories) {
    if (pathname.endsWith(`/${category}`) || pathname.includes(`/${category}/`)) {
      return category;
    }
  }

  if (pathname.includes("/discover")) {
    return "discover";
  }

  if (pathname.includes("/dashboard")) {
    if (value === "profile") {
      return "profile";
    }
    return "dashboard";
  }

  return "dashboard";
}

export function getDashboardHref(view: DashboardView, locale?: MarketplaceLocale) {
  let path: string;

  switch (view) {
    case "dashboard":
      path = "/dashboard";
      break;
    case "discover":
      path = "/discover";
      break;
    case "profile":
      path = "/dashboard?view=profile";
      break;
    case "loans":
    case "cards":
    case "transfers":
    case "exchange":
    case "insurance":
    case "investments":
      path = `/${view}`;
      break;
    default:
      path = "/dashboard";
  }

  return locale ? localePath(locale, path) : path;
}
