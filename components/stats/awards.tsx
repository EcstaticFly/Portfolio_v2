"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Achievement } from "@/content/achievements";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Achievements rendered as a measured set rather than a bullet list.
 *
 * Codolio shows awards as a row of medals, which works there because the
 * count is the point. Here the interesting part is *how far* each result
 * went, so each award carries a meter: how deep into the field it
 * placed. `weight` is a deliberate editorial judgement, not a computed
 * statistic, so the bar is labelled with the real figure beside it and
 * never presented as a percentage of anything.
 */
export interface Award extends Achievement {
  /** 0–1, how much of the meter to fill */
  weight: number;
  year?: string;
}

export function Awards({ awards }: { awards: Award[] }) {
  const reduced = useReducedMotion();

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {awards.map((award, i) => (
        <motion.li
          key={award.title}
          data-entrance=""
          className="group rounded-2xl border border-line bg-surface/70 p-6 transition-colors duration-300 hover:border-accent"
          initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.55, ease: EASE, delay: i * 0.07 }
          }
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-2xl leading-none font-light text-accent">
              {award.figure}
            </p>
            {award.year ? (
              <span className="text-2xs text-muted">{award.year}</span>
            ) : null}
          </div>

          <p className="mt-4 text-base leading-snug text-ink">{award.title}</p>
          <p className="mt-1.5 text-sm text-muted">{award.detail}</p>

          {/* the meter */}
          <div
            aria-hidden="true"
            className="mt-5 h-1 w-full overflow-hidden rounded-full bg-line"
          >
            <motion.div
              data-entrance=""
              className="h-full rounded-full bg-accent"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: award.weight }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              style={{ transformOrigin: "left" }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 1, ease: EASE, delay: 0.15 + i * 0.07 }
              }
            />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
