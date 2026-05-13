import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";
import { getActiveHighlights } from "@/features/highlights/get-active-highlights";
import { getRequestPreferences } from "@/lib/request-preferences";

export default async function Page() {
  const prefs = await getRequestPreferences();
  const highlights = await getActiveHighlights(prefs.country);

  return (
    <SiteShell hideHero>
      <HomePage highlights={highlights} />
    </SiteShell>
  );
}
