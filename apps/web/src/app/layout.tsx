import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payn | European financial marketplace",
  description:
    "Compare loans, credit cards, money transfers, and exchange products across Europe with a trust-first marketplace foundation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
