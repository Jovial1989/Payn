import type { Metadata } from "next";
import { Amplitude } from "@/amplitude";
import { AppChrome } from "@/components/app-chrome";
import { Providers } from "@/components/providers";
import { getRequestPreferences } from "@/lib/request-preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payn | Financial Marketplace Across Europe",
  description:
    "Compare loans, cards, transfers, exchange, insurance, and investments across Europe with real filters, transparent ranking, and a clean path from search to decision.",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preferences = await getRequestPreferences();

  return (
    <html lang={preferences.locale}>
      <body className="font-sans antialiased">
        <Amplitude />
        <Providers
          initialLocale={preferences.locale}
          initialCountry={preferences.country}
          initialMarket={preferences.market}
        >
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
