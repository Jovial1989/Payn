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
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeHref === item.href
                  ? "bg-bg-surface text-ink"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
          >
            Sign in
          </button>
          <button
            type="button"
            className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
