import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Content files use `[INSERT_…]` for values that are not known yet.
 * The UI checks with this rather than rendering a dead link or an
 * invented URL.
 */
export function isPlaceholder(value: string | undefined): boolean {
  return !value || value.startsWith("[INSERT_");
}

/** e.g. 1797.77 → "1798"; keeps figures honest and column-aligned. */
export function round(value: number): number {
  return Math.round(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * "Last updated" line on /stats. Rendered on the server, so it is pinned
 * to a fixed timezone — otherwise the server's string and the client's
 * string disagree and React reports a hydration mismatch.
 */
export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(new Date(iso));
}
