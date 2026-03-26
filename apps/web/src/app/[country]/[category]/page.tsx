import { notFound } from "next/navigation";
import { CategoryPageContent } from "@/components/category-page-content";
import { SiteShell } from "@/components/site-shell";
import { isMarketplaceCategory, isSupportedMarket } from "@/lib/marketplace";
import { listCategoryOffers } from "@/server/catalog/catalog-service";

export default async function CountryCategoryPage({
  params,
}: {
  params: Promise<{ country: string; category: string }>;
}) {
  const { country, category } = await params;

  if (!isSupportedMarket(country) || !isMarketplaceCategory(category)) {
    notFound();
  }

  const offers = await listCategoryOffers(category);

  return (
    <SiteShell
      activePage="marketplace"
      activeCategory={category}
      hideHero
    >
      <CategoryPageContent
        category={category}
        offers={offers}
        market={country}
      />
    </SiteShell>
  );
}
