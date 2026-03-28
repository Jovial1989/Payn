import { cookies, headers } from "next/headers";
import { detectPreferencesFromAcceptLanguage, normalizeLocale, normalizeMarket } from "@/lib/marketplace";

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Locale: prefer middleware header (from URL), then cookie, then Accept-Language
  const middlewareLocale = headerStore.get("x-payn-locale");
  const detected = detectPreferencesFromAcceptLanguage(headerStore.get("accept-language"));

  return {
    market: normalizeMarket(cookieStore.get("payn-market")?.value ?? detected.market),
    locale: normalizeLocale(middlewareLocale ?? cookieStore.get("payn-locale")?.value ?? detected.locale),
  };
}
