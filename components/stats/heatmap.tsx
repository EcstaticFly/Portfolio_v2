"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ActivityDay } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";

const DAY = 86_400_000;
const CELL = 13;
const GAP = 3;
const EASE = [0.22, 1, 0.36, 1] as const;

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * A year of submission activity, one column per week.
 *
 * Five tonal steps of the accent rather than a green ramp, so it belongs
 * to the page. Levels are cut on fixed thresholds rather than on
 * percentiles: a fixed scale means a quiet week looks quiet instead of
 * being stretched to fill the palette.
 *
 * The whole grid is one inline SVG — 371 rects, no per-cell React
 * element and no layout work — and it scrolls horizontally on narrow
 * screens rather than shrinking into illegibility.
 */
export function Heatmap({
  days,
  months = 12,
  /**
   * The grid's last day, supplied by the server. Reading the clock during
   * render would be impure and would also let the server and client
   * disagree about where "today" falls, which is a hydration mismatch.
   */
  today: todayIso,
}: {
  days: ActivityDay[];
  months?: number;
  today: string;
}) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<{ date: string; count: number } | null>(
    null
  );

  const model = useMemo(() => {
    const counts = new Map(days.map((d) => [d.date, d.count]));

    // End on the current week's Saturday so the last column is whole.
    const today = Date.parse(`${todayIso}T00:00:00Z`);
    const end = today + (6 - new Date(today).getUTCDay()) * DAY;
    const start = end - (Math.round(months * 30.44) + 6) * DAY;
    // Align the first column to a Sunday.
    const alignedStart = start - new Date(start).getUTCDay() * DAY;

    const weeks: { date: string; count: number; future: boolean }[][] = [];
    for (let ms = alignedStart; ms <= end; ms += 7 * DAY) {
      const column = [];
      for (let d = 0; d < 7; d++) {
        const cur = ms + d * DAY;
        const key = iso(cur);
        column.push({
          date: key,
          count: counts.get(key) ?? 0,
          future: cur > today,
        });
      }
      weeks.push(column);
    }

    const monthLabels: { x: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((column, i) => {
      const first = new Date(column[0].date + "T00:00:00Z");
      const m = first.getUTCMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        monthLabels.push({
          x: i * (CELL + GAP),
          label: first.toLocaleString("en-GB", {
            month: "short",
            timeZone: "UTC",
          }),
        });
      }
    });

    const total = weeks
      .flat()
      .filter((c) => !c.future)
      .reduce((sum, c) => sum + c.count, 0);

    return { weeks, monthLabels, total };
  }, [days, months, todayIso]);

  const width = model.weeks.length * (CELL + GAP);
  const height = 7 * (CELL + GAP) + 22;

  return (
    <div>
      <div className="w-full min-w-0 max-w-full overflow-x-auto pb-2">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Submission activity over the last ${months} months: ${formatNumber(model.total)} submissions.`}
          className="block max-w-none shrink-0"
          onPointerLeave={() => setHover(null)}
        >
          {model.monthLabels.map((m) => (
            <text
              key={`${m.label}-${m.x}`}
              x={m.x}
              y={9}
              fontSize={10}
              fill="var(--text-muted)"
            >
              {m.label}
            </text>
          ))}

          {/* Plain <rect> elements inside one animated group.
              Previously each cell was a `motion.rect` with its own
              `whileInView`, which is 371 Framer components and 371
              IntersectionObservers for a single chart — the heaviest
              thing on the page by node count, and pure overhead on a
              low-memory device. The group fades in once instead. */}
          <motion.g
            data-entrance=""
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }
            }
          >
            {model.weeks.map((column, wi) =>
              column.map((cell, di) => {
                if (cell.future) return null;
                return (
                  <rect
                    key={cell.date}
                    x={wi * (CELL + GAP)}
                    y={20 + di * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    fill={fillFor(cell.count)}
                    onPointerEnter={() =>
                      setHover({ date: cell.date, count: cell.count })
                    }
                  />
                );
              })
            )}
          </motion.g>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-sm text-muted" aria-live="polite">
          {hover
            ? `${formatNumber(hover.count)} ${hover.count === 1 ? "submission" : "submissions"} on ${formatDay(hover.date)}`
            : `${formatNumber(model.total)} submissions in the last ${months} months`}
        </p>

        <div className="flex items-center gap-1.5">
          <span className="text-2xs text-muted">Less</span>
          {[0, 1, 3, 6, 10].map((n) => (
            <span
              key={n}
              aria-hidden="true"
              className="h-[11px] w-[11px] rounded-[3px]"
              style={{ backgroundColor: fillFor(n) }}
            />
          ))}
          <span className="text-2xs text-muted">More</span>
        </div>
      </div>
    </div>
  );
}

/** Fixed thresholds, so a quiet week reads as quiet. */
function fillFor(count: number): string {
  if (count <= 0) return "var(--color-line, var(--border))";
  if (count < 3) return "var(--accent-wash)";
  if (count < 6) return "var(--accent-soft)";
  if (count < 10) return "var(--accent-mid)";
  return "var(--accent)";
}

function formatDay(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
