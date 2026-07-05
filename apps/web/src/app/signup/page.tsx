import { AuthRouteCard } from "@/components/auth-route-card";
import { AuthSSRFallback } from "@/components/auth-ssr-fallback";

export default function SignupPage() {
  return (
    <>
      <AuthRouteCard mode="signup" />
      <noscript>
        <AuthSSRFallback mode="signup" />
      </noscript>
    </>
  );
}
