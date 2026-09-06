import type { Metadata, Viewport } from "next";
import { fraunces, generalSans } from "./fonts";
import { ThemeScript } from "@/components/theme-script";
import { HydrationFlag } from "@/components/hydration-flag";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollTop } from "@/components/scroll-top";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/content/site";
import "./globals.css";

const description =
  "Suyash Pandey is a software developer and competitive programmer studying computer science at IIIT Ranchi. He builds web applications end to end, from interface to infrastructure.";

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
  // Light is the site default, so it leads here regardless of the OS
  // hint. This value is the light `--bg` token from globals.css; the two
  // have to stay in step or the browser chrome will not match the page.
  themeColor: "#E4DED0",
  colorScheme: "light dark",
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
        <ScrollTop />

        {/* Both load async and report after the page has settled, so
            neither blocks rendering or hydration. Measured off the
            deployment: 1.5KB and 4.7KB gzipped respectively, against
            ~238KB of page JavaScript.

            Speed Insights earns its place: every performance figure this
            site was tuned against came from a throttled headless
            browser, which is a simulation. This reports Core Web Vitals
            from real visitors on real devices, which is the only way to
            know whether the thing is actually fast for the people
            reading it. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
