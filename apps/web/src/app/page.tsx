import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";

export default function Page() {
  return (
    <SiteShell
      eyebrow="European fintech marketplace"
      title="Intent-led discovery for loans, cards, transfers, and FX."
      description="Production foundation for a trust-first marketplace that starts with affiliate monetization and grows into lead capture, broker routing, and embedded partner journeys."
    >
      <HomePage />
    </SiteShell>
  );
}

