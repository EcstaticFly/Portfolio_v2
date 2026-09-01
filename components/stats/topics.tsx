"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TopicCount } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Topic breakdown as a ranked bar chart.
 *
 * Bars grow from the left with `scaleX` on a fixed-width track, so the
 * animation is a single compositor transform rather than a per-frame
 * width recalculation — that is the difference between smooth and janky
 * once a dozen rows animate at once.
 *
 * Every bar is a tonal step of the site accent, weighted by rank, so the
 * chart reads as one material instead of a palette of unrelated hues.
 */
export function TopicChart({
  topics,
  limit = 10,
}: {
  topics: TopicCount[];
  limit?: number;
}) {
  const reduced = useReducedMotion();
  const rows = topics.slice(0, limit);
  if (rows.length === 0) return null;

  const max = rows[0].solved || 1;

  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((topic, i) => {
        const ratio = topic.solved / max;
        // Strongest topics carry the full accent; the tail steps back
        // toward the page so the ranking is legible without a legend.
        const tone =
          i < 2 ? "var(--accent)" : i < 5 ? "var(--accent-mid)" : "var(--accent-soft)";
        // The soft step is too close to the page to carry canvas-coloured
        // text, so the label flips to ink once the bar gets that pale.
        const labelClass = i < 5 ? "text-canvas" : "text-ink";
        const pct = Math.max(ratio * 100, 4);
        const inside = ratio > 0.2;

        return (
          <li
            key={topic.name}
            className="grid grid-cols-[9.5rem_1fr] items-center gap-4 sm:grid-cols-[12rem_1fr]"
          >
            <span className="truncate text-right text-sm text-muted">
              {topic.name}
            </span>

            <span className="relative flex h-8 items-center">
              <span className="absolute inset-0 rounded-md bg-line/40" />
              <motion.span
                data-entrance=""
                className="absolute inset-y-0 left-0 origin-left rounded-md"
                style={{ width: `${pct}%`, backgroundColor: tone }}
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.85, ease: EASE, delay: i * 0.06 }
                }
              />
              {/* The number sits inside the bar when there is room, and
                  just past its end when there is not. Both cases are
                  positioned off the same percentage as the bar, so they
                  cannot drift apart. */}
              <span
                className={`absolute z-10 text-sm ${inside ? labelClass : "text-ink"}`}
                style={
                  inside
                    ? { left: "0.75rem" }
                    : { left: `calc(${pct}% + 0.6rem)` }
                }
              >
                {formatNumber(topic.solved)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
