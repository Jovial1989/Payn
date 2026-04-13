import { redirect } from "next/navigation";
import { getRequestPreferences } from "@/lib/request-preferences";
import { localePath } from "@/lib/locale";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const preferences = await getRequestPreferences();
  const { intent } = await searchParams;
  const discoverHref = localePath(preferences.locale, "/discover");

  redirect(intent ? `${discoverHref}?intent=${encodeURIComponent(intent)}` : discoverHref);
}
