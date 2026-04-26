import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Amplitude } from "@/amplitude";
import { Providers } from "@/components/providers";
import { getRequestPreferences } from "@/lib/request-preferences";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

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
      <Amplitude />
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}>
        <Providers
          initialLocale={preferences.locale}
          initialCountry={preferences.country}
          initialMarket={preferences.market}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
