import type { MarketplaceLocale } from "@payn/types";
import { supportedLocales } from "@/lib/marketplace";

export const defaultLocale: MarketplaceLocale = "en";

export function isLocaleSegment(segment: string): segment is MarketplaceLocale {
  return supportedLocales.includes(segment as MarketplaceLocale);
}

export function localePath(locale: MarketplaceLocale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

export function switchLocalePath(currentPathname: string, newLocale: MarketplaceLocale): string {
  const segments = currentPathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocaleSegment(segments[0])) {
    segments[0] = newLocale;
  } else {
    segments.unshift(newLocale);
  }
  return `/${segments.join("/")}`;
}
