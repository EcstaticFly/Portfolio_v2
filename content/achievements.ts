export interface Achievement {
  /**
   * Set on entries whose figures are also fetched live. The UI swaps in
   * the current numbers when it has them, so this file cannot drift out
   * of step with /stats — which it had: this said 1672 and "500+" while
   * the live data said 1675 and 632.
   */
  id?: "competitive";
  /** The measurable part, set large — the reason the line exists */
  figure: string;
  /** What the figure refers to */
  title: string;
  /** Context, one line */
  detail: string;
  year?: string;
  /**
   * 0–1, how full the meter on /stats reads. An editorial judgement of
   * how far each result went, not a computed statistic — which is why
   * the real figure always sits beside the bar.
   */
  weight?: number;
}

export const achievements: Achievement[] = [
  {
    figure: "Top 1,500",
    title: "Google Big Code Challenge 2026",
    detail: "Qualified for Round 2, nationwide.",
    year: "2026",
    weight: 0.92,
  },
  {
    figure: "Round 3",
    title: "Flipkart Grid 8.0",
    detail: "Advanced to Round 3.",
    year: "2026",
    weight: 0.85,
  },
  {
    figure: "Semifinalist",
    title: "Flipkart Grid 7.0",
    detail: "Reached the semifinal round.",
    year: "2025",
    weight: 0.8,
  },
  {
    id: "competitive",
    figure: "3★ / Pupil",
    title: "CodeChef and Codeforces",
    detail:
      "CodeChef 3★ (1672), Codeforces Pupil, LeetCode 500+ problems solved.",
    weight: 0.7,
  },
  {
    figure: "Top 3 of 200+",
    title: "RBI@90 State-Level Quiz",
    detail: "Second Runner-Up.",
    weight: 0.98,
  },
];
