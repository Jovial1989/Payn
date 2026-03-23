import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";

export default function Page() {
  return (
    <SiteShell
      eyebrow="European financial marketplace"
      title="Compare loans, cards, transfers, and exchange products with clearer product information."
      description="Payn is built for trustworthy comparison, visible provider terms, and ranking logic that is easier to understand before you click out."
      heroTags={["Independent comparison", "Updated regularly", "Commission disclosed"]}
    >
      <HomePage />
    </SiteShell>
  );
}
