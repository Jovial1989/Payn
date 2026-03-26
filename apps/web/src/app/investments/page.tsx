import { redirect } from "next/navigation";
import { getMarketCategoryHref } from "@/lib/marketplace";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function InvestmentsPage() {
  const preferences = await getRequestPreferences();
  redirect(getMarketCategoryHref(preferences.market, "investments"));
}
