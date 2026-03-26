import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";

export default async function Page() {
  return (
    <SiteShell hideHero>
      <HomePage />
    </SiteShell>
  );
}
