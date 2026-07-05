import type { MetadataRoute } from "next";
import { marketplaceCategories, supportedLocales } from "@/lib/marketplace";

// Pass B (SEO net-new). Enumerates the canonical FLAT surface only:
// per-locale category routes (`/<locale>/<cat>`), the `/discover` hub,
// the key marketing pages, and the legal pages — for each of the 4
// locales the app actually serves (`supportedLocales`: en, de, es, fr).
//
// Deliberately excluded: `/explore/*` (Pass A 301'd these into flat),
// `/[country]/[category]`, and all admin / api / auth / dashboard /
// settings surfaces (also blocked in robots.ts).
//
// URLs are root-relative and resolved against `metadataBase`
// (https://payn.online) set in the root layout, so the emitted sitemap
// is absolute without hardcoding the origin here.

const BASE_URL = "https://payn.online";

// Marketing pages that live at `/<locale>/<path>`. Empty string == the
// locale home (`/<locale>`).
const marketingPaths = ["", "about", "how-we-rank", "how-we-make-money"] as const;

// Legal pages present under `app/legal/*`.
const legalPaths = [
  "legal/imprint",
  "legal/privacy",
  "legal/terms",
  "legal/cookies",
  "legal/affiliate-disclosure",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of supportedLocales) {
    // Locale home — highest priority, refreshed often.
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    });

    // Discover hub.
    entries.push({
      url: `${BASE_URL}/${locale}/discover`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    });

    // Flat category routes — the core indexable surface.
    for (const category of marketplaceCategories) {
      entries.push({
        url: `${BASE_URL}/${locale}/${category}`,
        lastModified,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // Marketing pages (skip "" — that's the home, already added above).
    for (const path of marketingPaths) {
      if (path === "") continue;
      entries.push({
        url: `${BASE_URL}/${locale}/${path}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }

    // Legal pages — rarely change, lowest priority.
    for (const path of legalPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}/${path}`,
        lastModified,
        changeFrequency: "yearly",
        priority: 0.3,
      });
    }
  }

  return entries;
}
