import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function Page() {
  const [loans, cards, transfers, exchange] = await Promise.all([
    listCategoryOffers("loans"),
    listCategoryOffers("cards"),
    listCategoryOffers("transfers"),
    listCategoryOffers("exchange"),
  ]);

  return (
    <SiteShell
      eyebrow="European Financial Marketplace"
      title="Compare financial products with clarity and confidence."
      description="Compare loans, cards, transfers, and exchange from regulated European providers. Transparent ranking, visible terms, commission disclosed."
      heroTags={[]}
      hideHero
    >
      <HomePage
        counts={{ loans: loans.length, cards: cards.length, transfers: transfers.length, exchange: exchange.length }}
        featuredOffers={[loans[0], cards[0], transfers[0]].filter(Boolean)}
      />
    </SiteShell>
  );
}
