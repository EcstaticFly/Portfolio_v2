/**
 * How long a rendered page may serve before Next regenerates it. The
 * scheduled refresh below normally beats this to the punch; it stays as a
 * floor so freshness never depends on the cron alone.
 */
export const STATS_REVALIDATE = 1800; // 30 minutes

/**
 * How often the background job re-reads every platform. Nothing about a
 * visitor's request triggers a fetch, so this is purely a question of how
 * current the numbers are, not of how fast the site feels.
 */
export const STATS_REFRESH_SECONDS = 1800; // 30 minutes

/**
 * Language byte counts need one request per repository, which is the one
 * genuinely expensive thing in the whole refresh. Languages barely move,
 * so they are re-read on their own much slower clock.
 */
export const LANGUAGE_REFRESH_SECONDS = 6 * 60 * 60;

/**
 * How long a platform's last-known-good reading may keep being shown
 * after that platform stopped responding.
 *
 * The point of carrying values forward is that a rating from yesterday is
 * a far better answer than a blank panel. That stops being true
 * eventually: past this horizon the reading is dropped and the section
 * says it is unavailable, so the page can never quietly present numbers
 * from a profile that has been unreachable for a month.
 */
export const STALE_LIMIT_DAYS = 21;

/** Snapshot format. Bumping this discards incompatible stored data. */
export const SNAPSHOT_VERSION = 2;

export interface RatingPoint {
  /** Unix seconds — kept numeric so the chart can scale on the x axis */
  t: number;
  rating: number;
  label: string;
  /** Placing in that contest, where the platform reports it */
  rank?: number | null;
}

/** A badge earned on one of the judges. */
export interface Badge {
  name: string;
  platform: string;
  /** ISO date if the platform reports one */
  date: string | null;
  /** The platform's own word for the level: Achiever, Silver, and so on */
  tier: string | null;
}

/** One day of the activity heatmap. */
export interface ActivityDay {
  /** YYYY-MM-DD, UTC */
  date: string;
  count: number;
}

/**
 * Activity merged across every platform that exposes per-day data.
 * Days are unioned, not summed, so a day worked on two judges counts
 * once — which is what "active days" means.
 */
export interface ActivitySummary {
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  days: ActivityDay[];
  /** Which platforms actually contributed, for honest labelling */
  sources: string[];
  /** Today in the reporting timezone, so the heatmap ends where streaks do */
  today: string;
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
  /** Distinct UTC dates with at least one submission */
  activity: ActivityDay[];
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
  badges: Badge[];
  /** Per-day submission counts across every active year */
  activity: ActivityDay[];
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
  badges: Badge[];
  /** Per-day submission counts, from the profile page's heatmap data */
  activity: ActivityDay[];
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
  badges: Badge[];
  /** Per-day contributions, from the public contributions endpoint */
  activity: ActivityDay[];
}

/** One language's share of the bytes written across public repositories. */
export interface LanguageShare {
  name: string;
  bytes: number;
  /** Percentage of all counted bytes, 0-100 */
  share: number;
}

export interface GitHubStats {
  login: string;
  /** Contributions in the trailing 12 months, per GitHub's own calendar */
  contributions: number;
  /** Every contribution since the account was created */
  totalContributions: number;
  /** Days with at least one contribution, trailing 12 months */
  activeDays: number;
  /** Days with at least one contribution, all time */
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  publicRepos: number;
  followers: number;
  /**
   * Stars and forks across owned public repositories, and the three
   * search totals. All null when that request was rate limited or
   * refused — never 0, because a zero here would render as a real
   * figure and quietly understate the account.
   */
  stars: number | null;
  forks: number | null;
  commits: number | null;
  pullRequests: number | null;
  issues: number | null;
  /** Descending by share; empty when the language pass was skipped */
  languages: LanguageShare[];
  /**
   * True when shares were computed from real byte counts. False means
   * they were approximated from each repository's primary language,
   * which is the cheap single-request fallback.
   */
  languagesExact: boolean;
  /** When the language pass last succeeded, so it can run on its own clock */
  languagesAt: string | null;
  /** The year the account was created, for the all-time calendar walk */
  createdYear: number | null;
}

/** The five sources, keyed the way they are stored and merged. */
export type PlatformKey =
  | "codeforces"
  | "leetcode"
  | "codechef"
  | "code360"
  | "github";

/** The stored shape of each platform, so the snapshot can stay generic. */
export interface PlatformData {
  codeforces: CodeforcesStats;
  leetcode: LeetCodeStats;
  codechef: CodeChefStats;
  code360: Code360Stats;
  github: GitHubStats;
}

/** Provenance for one platform's reading. */
export interface PlatformMeta {
  /** When this value was last fetched successfully */
  updatedAt: string;
  /** True when the most recent refresh could not reach the platform */
  stale: boolean;
  /** Why the last attempt failed, for the health endpoint */
  error: string | null;
}

/**
 * The last-known-good record of every platform.
 *
 * This is what the pages actually render from. It is written only by the
 * scheduled refresh and read only while a page is being regenerated, so
 * it never sits between a visitor and the HTML they asked for.
 */
export interface StatsSnapshot {
  version: number;
  platforms: { [K in PlatformKey]: PlatformData[K] | null };
  meta: { [K in PlatformKey]: PlatformMeta | null };
  /** When the snapshot itself was last written */
  savedAt: string;
}

export interface StatsBundle {
  codeforces: CodeforcesStats | null;
  leetcode: LeetCodeStats | null;
  codechef: CodeChefStats | null;
  code360: Code360Stats | null;
  github: GitHubStats | null;
  /** Merged across platforms; null if no platform reported day data */
  activity: ActivitySummary | null;
  /** Every badge from every platform, newest-looking first */
  badges: Badge[];
  /** Per-platform provenance, so stale readings can be labelled honestly */
  meta: { [K in PlatformKey]: PlatformMeta | null };
  /** When this data was last written — shown as the "last updated" line */
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
