import { cookies, headers } from "next/headers";
import { detectPreferencesFromAcceptLanguage, normalizeLocale } from "@/lib/marketplace";
import {
  getCountryCurrency,
  normalizeCountrySelection,
  resolveCountryFromLegacyMarket,
  resolveCountryLegacyMarket,
} from "@/lib/countries";

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Locale: prefer middleware header (from URL), then cookie, then Accept-Language
  const middlewareLocale = headerStore.get("x-payn-locale");
  const detected = detectPreferencesFromAcceptLanguage(headerStore.get("accept-language"));
  const locale = normalizeLocale(middlewareLocale ?? cookieStore.get("payn-locale")?.value ?? detected.locale);
  const country = normalizeCountrySelection(
    cookieStore.get("payn-country")?.value ??
      resolveCountryFromLegacyMarket(cookieStore.get("payn-market")?.value ?? detected.market, locale),
    locale,
  );

  return {
    country,
    market: resolveCountryLegacyMarket(country),
    currency: getCountryCurrency(country),
    locale,
  };
}
