import { DiscoverPageView } from "@/components/discover-page-view";
import { isMarketplaceCategory } from "@/lib/marketplace";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;

  return (
    <DiscoverPageView
      initialIntent={intent && isMarketplaceCategory(intent) ? intent : undefined}
    />
  );
}
