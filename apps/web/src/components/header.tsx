import type { Route } from "next";
import clsx from "clsx";
import Link from "next/link";

const categories = [
  { href: "/loans" as Route, label: "Loans" },
  { href: "/cards" as Route, label: "Cards" },
  { href: "/transfers" as Route, label: "Transfers" },
  { href: "/exchange" as Route, label: "Exchange" },
];

export function Header({ activeHref }: { activeHref?: Route }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg-deep/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L8 4L12 12" stroke="#040907" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {categories.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                activeHref === item.href
                  ? "bg-primary-soft text-primary"
                  : "text-ink-secondary hover:bg-bg-elevated hover:text-ink",
              )}
            >
              {item.label}
              {activeHref === item.href && (
                <span className="absolute inset-x-3 -bottom-[17px] h-px bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink sm:block"
          >
            Sign in
          </button>
          <button
            type="button"
            className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-bg-deep shadow-glow transition-shadow hover:shadow-glow-strong"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
