import type { Route } from "next";
import Link from "next/link";

const categories = [
  { href: "/loans" as Route, label: "Loans" },
  { href: "/cards" as Route, label: "Cards" },
  { href: "/transfers" as Route, label: "Transfers" },
  { href: "/exchange" as Route, label: "Exchange" },
];

export function SiteShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-[0.18em] text-ink uppercase">
            Payn
          </Link>
          <nav className="flex gap-6 text-sm text-muted">
            {categories.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(25,195,125,0.16),transparent_42%),rgba(14,31,25,0.9)] p-8 shadow-glow">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-semibold text-ink">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
        </section>
        {children}
      </main>
    </div>
  );
}
