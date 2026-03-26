import { redirect } from "next/navigation";
import { getMarketCategoryHref } from "@/lib/marketplace";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function LoansPage() {
  const preferences = await getRequestPreferences();
  redirect(getMarketCategoryHref(preferences.market, "loans"));
}
