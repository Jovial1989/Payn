import { DashboardShell } from "@/components/dashboard-shell";

export default function InvestmentsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
