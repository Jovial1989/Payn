import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { SiteShell } from "@/components/site-shell";
import { WaitlistForm } from "@/components/waitlist-form";
import { getDictionary } from "@/lib/i18n";
import { getRequestPreferences } from "@/lib/request-preferences";

function getInitialPlatform(value?: string): "ios" | "android" | "both" {
  if (value === "ios" || value === "android" || value === "both") {
    return value;
  }

  return "both";
}

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; source?: string }>;
}) {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);
  const { platform, source } = await searchParams;
  const initialPlatform = getInitialPlatform(platform);

  return (
    <SiteShell
      activePage="waitlist"
      eyebrow={dictionary.nav.mobileWaitlist}
      title={dictionary.home.appTitle}
      description={dictionary.home.appDescription}
      heroTags={["Real waitlist", "Platform choice", "No fake store links"]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <WaitlistForm initialPlatform={initialPlatform} source={source ?? "waitlist-page"} />

        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            What happens next
          </p>
          <div className="mt-5 grid gap-4">
            {[
              {
                title: "You choose the platform",
                text: "Use one form for iPhone, Android, or both instead of dead-end App Store or Google Play buttons.",
              },
              {
                title: "We keep the web experience live",
                text: "The website remains the primary product while the mobile release is prepared.",
              },
              {
                title: "You still control the next click",
                text: "Browse comparisons, review tradeoffs, and open provider sites only when the offer still fits.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-line bg-[#FCFCFB] p-5">
                <h2 className="text-base font-bold text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">Store pages are not live yet.</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-800/90">
              That is why Payn now uses this waitlist route instead of pretend download buttons.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonStyles({ variant: "primary", size: "lg" })}>
              {dictionary.nav.marketplace}
            </Link>
            <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              {dictionary.nav.contact}
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
