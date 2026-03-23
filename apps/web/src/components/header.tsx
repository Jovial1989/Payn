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
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="text-lg font-semibold tracking-[-0.02em] text-ink">Payn</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "border-b-2 pb-4 pt-1 text-sm transition-colors",
                activeHref === item.href
                  ? "border-primary text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
