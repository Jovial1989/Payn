import { AuthRouteCard } from "@/components/auth-route-card";
import { SiteShell } from "@/components/site-shell";

export default function SignupPage() {
  return (
    <SiteShell hideHero>
      <AuthRouteCard mode="signup" />
    </SiteShell>
  );
}
