import { redirect } from "next/navigation";
import { getMarketCategoryHref } from "@/lib/marketplace";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function ExchangePage() {
  const preferences = await getRequestPreferences();
  redirect(getMarketCategoryHref(preferences.market, "exchange"));
}
