import { redirect } from "next/navigation";
import { getRequestPreferences } from "@/lib/request-preferences";
import { localePath } from "@/lib/locale";

export default async function DashboardProfilePage() {
  const preferences = await getRequestPreferences();
  redirect(localePath(preferences.locale, "/settings"));
}
