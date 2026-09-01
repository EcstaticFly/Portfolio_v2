import type { Metadata, Viewport } from "next";
import { fraunces, generalSans } from "./fonts";
import { ThemeScript } from "@/components/theme-script";
import { HydrationFlag } from "@/components/hydration-flag";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import "./globals.css";

const description =
  "Suyash Pandey is a full-stack developer and competitive programmer studying computer science at IIIT Ranchi. He builds backends that survive real traffic.";

export const metadata: Metadata = {
  metadataBase: site.url.startsWith("http") ? new URL(site.url) : undefined,
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description,
  authors: [{ name: site.name }],
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.name, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // Dark is the site default, so it leads here regardless of the OS hint.
  themeColor: "#1C1712",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${generalSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-canvas text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <HydrationFlag />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
