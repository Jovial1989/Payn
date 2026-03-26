import { cookies, headers } from "next/headers";
import { detectPreferencesFromAcceptLanguage, normalizeLocale, normalizeMarket } from "@/lib/marketplace";

export async function getRequestPreferences() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const detected = detectPreferencesFromAcceptLanguage(headerStore.get("accept-language"));

  return {
    market: normalizeMarket(cookieStore.get("payn-market")?.value ?? detected.market),
    locale: normalizeLocale(cookieStore.get("payn-locale")?.value ?? detected.locale),
  };
}
