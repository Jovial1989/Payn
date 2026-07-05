import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

// UX.4 / UX.5 — Help section layout. A tiny left-rail nav lists the
// help pages (glossary, first-time guide, how-we-pick, how-we-earn)
// and the right pane carries the page content. On mobile the nav
// collapses into a single horizontal pill row so it doesn't dominate
// the screen.
const HELP_NAV = [
  { href: "/help/first-time", label: "First time here?" },
  { href: "/help/glossary", label: "Glossary" },
  { href: "/help/how-we-pick", label: "How we pick" },
  { href: "/help/how-we-earn", label: "How we earn" },
];

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell hideHero>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
            Help
          </p>
          {/* On mobile the nav is a horizontal scroll row; on lg+ it
              becomes a sticky left rail. */}
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {HELP_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-secondary transition-colors hover:border-accent-emerald/40 hover:text-accent-emerald-strong lg:rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <article className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:rounded-[32px] sm:p-10">
          {children}
        </article>
      </div>
    </SiteShell>
  );
}
