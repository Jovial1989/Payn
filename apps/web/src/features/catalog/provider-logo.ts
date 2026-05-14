import { KNOWN_LOGOS } from "./known-logos.generated";

export function providerToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function getProviderLogoPath(providerName: string): string | null {
  const slug = providerToSlug(providerName);
  return KNOWN_LOGOS.has(slug) ? `/logos/${slug}.png` : null;
}
