/**
 * How long a fetched value stays fresh. Every platform fetch carries
 * this, and both routes that read stats declare it as their segment
 * revalidate, so a visitor is always served a pre-rendered page that is
 * at most this old and never waits on a network call.
 */
export const STATS_REVALIDATE = 1800; // 30 minutes

export interface RatingPoint {
  /** Unix seconds — kept numeric so the chart can scale on the x axis */
  t: number;
  rating: number;
  label: string;
  /** Placing in that contest, where the platform reports it */
  rank?: number | null;
}

export interface TopicCount {
  name: string;
  solved: number;
}

export interface CodeforcesStats {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contests: number;
  solved: number;
  history: RatingPoint[];
}

export interface LeetCodeStats {
  handle: string;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  contestRating: number | null;
  maxContestRating: number | null;
  contestsAttended: number | null;
  globalRanking: number | null;
  topPercentage: number | null;
  profileRanking: number | null;
  history: RatingPoint[];
  /** Solved counts per algorithm tag, descending */
  topics: TopicCount[];
}

export interface CodeChefStats {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  stars: number | null;
  solved: number | null;
  globalRank: number | null;
  countryRank: number | null;
  contests: number;
  history: RatingPoint[];
}

export interface Code360Stats {
  uuid: string;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  ninja: number;
  level: string | null;
  experience: number | null;
}

export interface GitHubStats {
  login: string;
  /** Contributions in the trailing 12 months, per GitHub's own calendar */
  contributions: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  publicRepos: number;
  followers: number;
}

export interface StatsBundle {
  codeforces: CodeforcesStats | null;
  leetcode: LeetCodeStats | null;
  codechef: CodeChefStats | null;
  code360: Code360Stats | null;
  github: GitHubStats | null;
  /** When this render happened — shown as the "last updated" line */
  fetchedAt: string;
}

/** One entry in the switchable rating chart on /stats. */
export interface RatingSeries {
  id: string;
  name: string;
  /** simple-icons slug for the platform mark */
  icon: string | null;
  current: number | null;
  peak: number | null;
  contests: number;
  points: RatingPoint[];
}
