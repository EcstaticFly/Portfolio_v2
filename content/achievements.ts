export interface Achievement {
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
    figure: "Semifinalist",
    title: "Flipkart Grid 7.0",
    detail: "Reached the semifinal round.",
    year: "2025",
    weight: 0.8,
  },
  {
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
