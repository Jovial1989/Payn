import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { StartFlow } from "@/features/start/start-flow";

export const metadata: Metadata = {
  title: "What do you want to do? — Payn",
  description:
    "Tick a few boxes and Payn shows you the cheapest option for each thing — free, no signup, no spam.",
};

// UX.2 — /start onboarding. The simplest possible entry: a checkbox
// list of "things people actually want to do with money", no email,
// no profile, no signup. Selections route the user to the matching
// /explore/<bucket>?context=... situational bucket page (or a combined
// /start/pack starter-pack if they tick several). The page is
// server-rendered (SiteShell wrapping a Client Component for the form
// state) so it works for crawlers and no-JS visitors.
// TASK-310 (PR-V3-06) replaced the V1-era /i-want-to/* destinations
// — see next.config.ts for the 301 table.
export default function StartPage() {
  return (
    <SiteShell hideHero>
      <StartFlow />
    </SiteShell>
  );
}
