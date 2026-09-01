import localFont from "next/font/local";
import { Fraunces } from "next/font/google";

/**
 * Display face. Fraunces is variable across three axes, and we use them:
 * `opsz` lets the 96px hero be drawn differently from a 20px pull quote
 * rather than merely scaled, and a touch of SOFT/WONK keeps the serifs
 * from reading as a stock system serif.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  // Weight is omitted deliberately: next/font only allows custom axes on
  // the fully variable file, which is what we want here anyway — the
  // whole 100–900 range plus SOFT, WONK and opsz in one download.
  axes: ["SOFT", "WONK", "opsz"],
});

/**
 * Body face. Self-hosted from Fontshare (the files live in this repo, so
 * there is no third-party request at runtime). `adjustFontFallback` makes
 * Next generate size-adjust metrics against Arial, so the swap from the
 * fallback to General Sans does not shift layout.
 */
export const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-body",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
});
