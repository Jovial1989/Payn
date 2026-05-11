import {
  canonicalCategories,
  canonicalCountryLabels,
  canonicalCountryOptions,
  canonicalLanguages,
} from "@payn/config";
import { listProductOffers } from "@/server/offers/offer-importer";

export async function buildCanonicalCatalogManifest() {
  return {
    generatedAt: new Date().toISOString(),
    languages: canonicalLanguages,
    countries: canonicalCountryOptions.map((country) => ({
      ...country,
      labels: Object.fromEntries(
        Object.entries(canonicalCountryLabels).map(([locale, labels]) => [
          locale,
          labels[country.value] ?? country.label,
        ]),
      ),
    })),
    categories: canonicalCategories,
    offers: await listProductOffers(),
  };
}
