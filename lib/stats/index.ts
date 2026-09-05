import { handles } from "@/content/site";
import { formatNumber, roundedHundreds } from "@/lib/utils";
import { getCodeforces } from "./codeforces";
import { getLeetCode } from "./leetcode";
import { getCodeChef } from "./codechef";
import { getCode360 } from "./code360";
import { getGitHub, hasToken } from "./github";
import { mergeActivity } from "./activity";
export { heatmapWindowStart, HEATMAP_YEARS } from "./activity";
import { readSnapshot, storeDriver, writeSnapshot } from "./store";
import {
  emptySnapshot,
  mergeSnapshot,
  normalise,
  PLATFORM_KEYS,
  type FetchedPlatforms,
} from "./snapshot";
import {
  LANGUAGE_REFRESH_SECONDS,
  LANGUAGE_RETRY_SECONDS,
  type Badge,
  type PlatformKey,
  type StatsBundle,
  type StatsSnapshot,
} from "./types";

export * from "./types";
export { PLATFORM_KEYS } from "./snapshot";
export { storeDriver } from "./store";

/**
 * How the numbers on this site actually reach the page.
 *
 * Nothing a visitor does causes a platform to be fetched. The scheduled
 * refresh reads all five, reconciles the answers against the last-known
 * good record, and stores one snapshot. The pages render from that
 * snapshot and are served as static HTML from the CDN.
 *
 * That indirection is what buys two things at once: a platform being
 * down no longer blanks a section — its previous reading is carried
 * forward and labelled — and the visitor still pays nothing, because the
 * store is read while a page is being regenerated in the background, not
 * while someone is waiting for it.
 */

/** Turns each getter's silent null into a result the merge can label. */
async function attempt<T>(
  run: () => Promise<T | null>
): Promise<{ value: T | null; error: string | null }> {
  try {
    const value = await run();
    return { value, error: value ? null : "no usable response" };
  } catch (error) {
    return {
      value: null,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}

export interface FetchOptions {
  /**
   * Whether to spend GitHub's per-repository requests on exact language
   * byte counts. Unauthenticated, that fan-out is most of the hourly
   * rate limit, so it runs on its own slower clock.
   */
  languages: boolean;
}

/** Reads every platform in parallel. Cannot reject. */
export async function fetchPlatforms(
  options: FetchOptions = { languages: true }
): Promise<FetchedPlatforms> {
  const [codeforces, leetcode, codechef, code360, github] = await Promise.all([
    attempt(() => getCodeforces(handles.codeforces)),
    attempt(() => getLeetCode(handles.leetcode)),
    attempt(() => getCodeChef(handles.codechef)),
    attempt(() => getCode360(handles.code360)),
    attempt(() => getGitHub(handles.github, { languages: options.languages })),
  ]);
  return { codeforces, leetcode, codechef, code360, github };
}

/**
 * Whether the language pass is due, given what is already stored.
 *
 * A stored reading that is only approximate gets a much shorter window
 * than an exact one, so a rate-limited run corrects itself within the
 * hour instead of sitting on visibly wrong percentages for six.
 */
function languagesDue(stored: StatsSnapshot, now: number): boolean {
  if (hasToken()) return true; // 5,000 requests an hour; no reason to skip
  const github = stored.platforms.github;
  const at = github?.languagesAt;
  if (!at) return true;
  const age = (now - Date.parse(at)) / 1000;
  if (!Number.isFinite(age)) return true;
  const window = github?.languagesExact
    ? LANGUAGE_REFRESH_SECONDS
    : LANGUAGE_RETRY_SECONDS;
  return age >= window;
}

export interface RefreshReport {
  fresh: PlatformKey[];
  carriedForward: PlatformKey[];
  missing: PlatformKey[];
  languagesRefreshed: boolean;
  stored: boolean;
  driver: string;
  savedAt: string;
}

/**
 * One refresh cycle: read the stored record, fetch everything, reconcile,
 * store the result. This is the only code path that talks to a platform.
 */
export async function refreshStats(): Promise<{
  snapshot: StatsSnapshot;
  report: RefreshReport;
}> {
  const now = Date.now();
  const stored = normalise(await readSnapshot());
  const languages = languagesDue(stored, now);

  const fetched = await fetchPlatforms({ languages });
  const snapshot = mergeSnapshot(stored, fetched, now);
  const wrote = await writeSnapshot(snapshot);

  const report: RefreshReport = {
    fresh: PLATFORM_KEYS.filter((k) => fetched[k].value !== null),
    carriedForward: PLATFORM_KEYS.filter(
      (k) => fetched[k].value === null && snapshot.platforms[k] !== null
    ),
    missing: PLATFORM_KEYS.filter((k) => snapshot.platforms[k] === null),
    languagesRefreshed: languages && fetched.github.value !== null,
    stored: wrote,
    driver: storeDriver(),
    savedAt: snapshot.savedAt,
  };

  return { snapshot, report };
}

/** Derives the shape the pages render from. */
export function toBundle(snapshot: StatsSnapshot): StatsBundle {
  const { codeforces, leetcode, codechef, code360, github } = snapshot.platforms;

  // Only the judges that publish per-day data can contribute here, and
  // the summary names them so the figure is never presented as covering
  // more platforms than it does.
  const activity = mergeActivity([
    { name: "LeetCode", days: leetcode?.activity ?? [] },
    { name: "Codeforces", days: codeforces?.activity ?? [] },
    { name: "CodeChef", days: codechef?.activity ?? [] },
    { name: "Code360", days: code360?.activity ?? [] },
  ]);

  const badges: Badge[] = [
    ...(leetcode?.badges ?? []),
    ...(code360?.badges ?? []),
    ...(codechef?.badges ?? []),
  ];

  return {
    codeforces,
    leetcode,
    codechef,
    code360,
    github,
    activity,
    badges,
    meta: snapshot.meta,
    fetchedAt: snapshot.savedAt,
  };
}

/**
 * What the pages call. Normally this is one read of the snapshot and no
 * network at all.
 *
 * The seed path exists for the very first render on a fresh deployment,
 * before any scheduled run has happened: rather than showing an empty
 * page, it fetches once and stores the result. After that it never runs
 * again, because the snapshot is no longer empty.
 */
export async function getStats(): Promise<StatsBundle> {
  const stored = await readSnapshot();
  if (stored) {
    const snapshot = normalise(stored);
    const hasAny = PLATFORM_KEYS.some((k) => snapshot.platforms[k] !== null);
    if (hasAny) return toBundle(snapshot);
  }

  try {
    const { snapshot } = await refreshStats();
    return toBundle(snapshot);
  } catch {
    // A total failure on first render still has to produce a page. Every
    // section already knows how to say "unavailable".
    return toBundle(emptySnapshot());
  }
}

/** Total distinct problems solved across the four judges we can read. */
export function totalSolved(stats: StatsBundle): number {
  return (
    (stats.codeforces?.solved ?? 0) +
    (stats.leetcode?.solved ?? 0) +
    (stats.codechef?.solved ?? 0) +
    (stats.code360?.solved ?? 0)
  );
}

/** Current figures for the one achievement that has live equivalents. */
export interface LiveAchievement {
  figure: string;
  detail: string;
}

/**
 * The "CodeChef and Codeforces" achievement, rebuilt from current data.
 *
 * This lives here rather than in either page because both of them show
 * that entry, and when only the homepage derived it, /stats — the page
 * that promises current figures — rendered the written fallback instead
 * and disagreed with the homepage by three rating points.
 *
 * Returns undefined unless every component is present, so the section
 * falls back to its written copy rather than showing a half-live line.
 */
export function liveAchievement(stats: StatsBundle): LiveAchievement | undefined {
  const cp = stats.codechef;
  const lc = stats.leetcode;
  const rank = stats.codeforces?.rank
    ? stats.codeforces.rank.replace(/^\w/, (c) => c.toUpperCase())
    : null;

  if (!cp?.stars || !cp.maxRating || !rank || !lc?.solved) return undefined;

  return {
    figure: `${cp.stars}★ / ${rank}`,
    detail:
      `CodeChef ${cp.stars}★ (${formatNumber(cp.maxRating)}), ` +
      `Codeforces ${rank}, LeetCode ${roundedHundreds(lc.solved)} problems solved.`,
  };
}

/**
 * Platforms whose reading is being carried forward from an earlier
 * successful fetch, so the page can label them rather than passing old
 * numbers off as current.
 */
export function staleSources(stats: StatsBundle): {
  name: string;
  since: string;
}[] {
  const labels: Record<PlatformKey, string> = {
    codeforces: "Codeforces",
    leetcode: "LeetCode",
    codechef: "CodeChef",
    code360: "Code360",
    github: "GitHub",
  };
  return PLATFORM_KEYS.filter(
    (key) => stats[key] !== null && stats.meta[key]?.stale
  ).map((key) => ({
    name: labels[key],
    since: stats.meta[key]!.updatedAt,
  }));
}
