import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";

export default function Page() {
  return (
    <SiteShell
      eyebrow="European Financial Marketplace"
      title="Compare financial products with clarity and confidence."
      description="Loans, cards, transfers, and exchange from Europe's regulated providers. Transparent ranking, visible terms, commission always disclosed."
      heroTags={["Independent comparison", "Updated regularly", "Commission disclosed"]}
    >
      <HomePage />
    </SiteShell>
  );
}
