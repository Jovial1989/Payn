"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

const hiddenPrefixes = ["/dashboard", "/settings", "/login", "/signup", "/offers/"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldShowHeader = pathname ? !hiddenPrefixes.some((prefix) => pathname.includes(prefix)) : true;

  return (
    <>
      {shouldShowHeader ? <Header /> : null}
      {children}
    </>
  );
}
