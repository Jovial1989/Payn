import Link from "next/link";
import { AdminSidebarLogout } from "@/components/admin-sidebar-logout";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/clicks", label: "Clicks" },
  { href: "/admin/push", label: "Push" },
  { href: "/admin/parser", label: "Parser" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-emerald-soft">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="#0f8a4b" strokeWidth="1.7" />
                <path d="M7.5 9V7a2.5 2.5 0 0 1 5 0v2" stroke="#0f8a4b" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Payn Admin</p>
              <p className="text-[10px] text-ink-tertiary">Internal</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[10px] px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <AdminSidebarLogout />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </main>
    </div>
  );
}
