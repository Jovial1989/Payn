import { AuthRouteCard } from "@/components/auth-route-card";
import { AuthSSRFallback } from "@/components/auth-ssr-fallback";

export default function LoginPage() {
  return (
    <>
      <AuthRouteCard mode="login" />
      <noscript>
        <AuthSSRFallback mode="login" />
      </noscript>
    </>
  );
}
