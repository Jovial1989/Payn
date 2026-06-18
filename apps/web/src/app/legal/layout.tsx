import { SiteShell } from "@/components/site-shell";

// BUG-015 — Shared layout for all /legal/* pages. Wraps them in
// SiteShell so footer/header remain consistent, with a narrow
// `max-w-prose` container for readable line lengths on long-form
// legal text. Title and description are passed from each child page
// via its own metadata + a server-rendered heading block.
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell hideHero>
      <article className="mx-auto w-full max-w-[760px] rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-10 [&_h1]:text-[2rem] [&_h1]:font-bold [&_h1]:tracking-[-0.02em] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-ink-secondary [&_ul]:mt-3 [&_ul]:grid [&_ul]:gap-2 [&_ul]:pl-4 [&_li]:list-disc [&_li]:text-sm [&_li]:text-ink-secondary [&_a]:text-accent-emerald-strong [&_a]:underline">
        {children}
      </article>
    </SiteShell>
  );
}
