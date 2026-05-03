import {
  canonicalCategories,
  canonicalCountryLabels,
  canonicalCountryOptions,
  canonicalLanguages,
} from "@payn/config";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

export function buildCanonicalCatalogManifest() {
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
    offers: marketplaceOffers,
  };
}
