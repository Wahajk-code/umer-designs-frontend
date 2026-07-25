import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/lib/client/cart-context";
import { getServerEnv } from "@/lib/server/env";
import { HERO_IMAGE } from "@/lib/stock-images";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

const siteName = "Umer Designs";
const siteDescription =
  "Architect-drawn container and residential plans, bought online, in your hands today — with the architect one message away.";

export const metadata: Metadata = {
  metadataBase: new URL(getServerEnv().APP_ORIGIN),
  title: {
    default: `${siteName} — Tending your visions into reality`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — Tending your visions into reality`,
    description: siteDescription,
    images: [{ url: HERO_IMAGE, width: 1600, height: 900, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Tending your visions into reality`,
    description: siteDescription,
    images: [HERO_IMAGE],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  description: siteDescription,
  slogan: "Tending your visions into reality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-warm-50 text-ink-900">
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>{children}</CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
