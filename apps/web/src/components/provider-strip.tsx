import { ProviderBadge } from "@/components/provider-logo";
import { getProviderBrand } from "@/lib/provider-brands";

export function ProviderStrip({
  providers,
  compact = false,
}: {
  providers: string[];
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {providers.map((providerName) => (
        <ProviderBadge
          key={providerName}
          providerName={providerName}
          websiteUrl={getProviderBrand(providerName).websiteUrl}
          compact={compact}
        />
      ))}
    </div>
  );
}
