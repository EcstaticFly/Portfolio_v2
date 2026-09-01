export interface Achievement {
  /** The measurable part, set large — the reason the line exists */
  figure: string;
  /** What the figure refers to */
  title: string;
  /** Context, one line */
  detail: string;
}

export const achievements: Achievement[] = [
  {
    figure: "Top 1,500",
    title: "Google Big Code Challenge 2026",
    detail: "Qualified for Round 2, nationwide.",
  },
  {
    figure: "Semifinalist",
    title: "Flipkart Grid 7.0",
    detail: "Reached the semifinal round.",
  },
  {
    figure: "3★ / Pupil",
    title: "CodeChef and Codeforces",
    detail: "CodeChef 3★ (1672), Codeforces Pupil, LeetCode 500+ problems solved.",
  },
  {
    figure: "Top 3 of 200+",
    title: "RBI@90 State-Level Quiz",
    detail: "Second Runner-Up.",
  },
];
