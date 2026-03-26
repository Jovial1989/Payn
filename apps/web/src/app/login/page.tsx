import { AuthRouteCard } from "@/components/auth-route-card";
import { SiteShell } from "@/components/site-shell";

export default function LoginPage() {
  return (
    <SiteShell hideHero>
      <AuthRouteCard mode="login" />
    </SiteShell>
  );
}
