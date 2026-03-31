import { DashboardShell } from "@/components/dashboard-shell";

export default function ExchangeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
