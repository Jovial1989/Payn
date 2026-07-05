import type { Metadata } from "next";
import { HeroSection } from "@/components/hero-section";

export const metadata: Metadata = {
  title: "Hero preview · Payn",
  robots: { index: false, follow: false },
};

export default function HeroPreviewPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <HeroSection />
    </main>
  );
}
