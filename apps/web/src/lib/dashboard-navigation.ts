import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";

export type DashboardView =
  | "dashboard"
  | "discover"
  | MarketplaceCategory
  | "settings";

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
    { id: "settings", label: navItems.profile.label, group: "account", description: navItems.profile.description },
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
  "settings",
]);

export function normalizeDashboardView(value?: string | null): DashboardView {
  if (value && dashboardViewSet.has(value as DashboardView)) {
    return value as DashboardView;
  }

  return "dashboard";
}

export function getActiveDashboardView(pathname: string | null): DashboardView {
  if (!pathname) {
    return "dashboard";
  }

  if (pathname.includes("/settings")) {
    return "settings";
  }

  if (pathname.includes("/dashboard")) {
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
    case "settings":
      path = "/settings";
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
