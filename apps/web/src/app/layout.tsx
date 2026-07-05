import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import { Amplitude } from "@/amplitude";
import { AppChrome } from "@/components/app-chrome";
import { Providers } from "@/components/providers";
import { getRequestPreferences } from "@/lib/request-preferences";
import "./globals.css";

const GA_ID = "G-8RMBZBQV6N";

// WEB.6 — Manrope was declared in `--font-body` / `--font-display`
// CSS vars + the Tailwind sans stack, but it was never actually
// loaded — no `next/font` import, no `<link>`, no @font-face. So
// every visitor was falling all the way through to the system stack
// (SF Pro on Mac, Segoe UI on Windows), which is why the type looked
// subtly different per machine and the brand voice felt off. Loading
// via `next/font/google` self-hosts the font at build time with zero
// CLS, automatic preload, and `font-display: swap`.
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://payn.online"),
  title: "Payn | Financial Marketplace Across Europe",
  description:
    "Compare loans, cards, transfers, exchange, insurance, and investments across Europe with real filters, transparent ranking, and a clean path from search to decision.",
  icons: {
    icon: "/icon.svg",
  },
};

// RESP.14 — Explicit viewport export. Next.js defaults to a sensible
// width=device-width, initial-scale=1 but pinning it here also caps
// maximum-scale + sets viewportFit=cover so the layout reaches edge to
// edge on iPhone 15/16/17 Dynamic-Island devices (no safe-area gap on
// the sides). Combined with `html { overflow-x: clip }` in globals.css
// this guarantees the viewport never becomes wider than the screen,
// even if a future component accidentally ships an unbroken long
// metric.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preferences = await getRequestPreferences();

  return (
    <html lang={preferences.locale} className={manrope.variable}>
      <body className="font-sans antialiased">
        {/* Google Analytics 4 — loads after page is interactive */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}</Script>
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
