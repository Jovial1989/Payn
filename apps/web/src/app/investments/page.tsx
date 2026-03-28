import { redirect } from "next/navigation";
import { localePath } from "@/lib/locale";
import { getMarketCategoryHref } from "@/lib/marketplace";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function InvestmentsPage() {
  const preferences = await getRequestPreferences();
  redirect(localePath(preferences.locale, getMarketCategoryHref(preferences.market, "investments")));
}
