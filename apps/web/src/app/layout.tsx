import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { getRequestPreferences } from "@/lib/request-preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payn | Country-Based Financial Marketplace",
  description:
    "Compare loans, cards, transfers, exchange, insurance, and investments by country with usable filters, translated UI, and transparent ranking.",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preferences = await getRequestPreferences();

  return (
    <html lang={preferences.locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers initialLocale={preferences.locale} initialMarket={preferences.market}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
