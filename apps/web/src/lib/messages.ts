import type { MarketplaceLocale } from "@payn/types";
import en from "@/locales/en.json";
import de from "@/locales/de.json";
import es from "@/locales/es.json";

type Messages = typeof en;

const locales: Partial<Record<MarketplaceLocale, Messages>> = {
  en,
  de,
  es,
};

function mergeDeep<T extends Record<string, unknown>>(base: T, override?: Record<string, unknown>): T {
  if (!override) {
    return base;
  }

  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override)) {
    const baseValue = result[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = mergeDeep(
        baseValue as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  }
  return result as T;
}

export function getMessages(locale: MarketplaceLocale): Messages {
  return mergeDeep(en, locales[locale]);
}
