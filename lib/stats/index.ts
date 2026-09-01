import { handles } from "@/content/site";
import { getCodeforces } from "./codeforces";
import { getLeetCode } from "./leetcode";
import { getCodeChef } from "./codechef";
import { getCode360 } from "./code360";
import { getGitHub } from "./github";
import type { StatsBundle } from "./types";

export * from "./types";

/**
 * Fetches every platform in parallel. Each getter already swallows its
 * own failures and resolves to null, so one platform being down can
 * never reject this call or fail the render — the affected section
 * simply reports itself as unavailable while the rest stay live.
 */
export async function getStats(): Promise<StatsBundle> {
  const [codeforces, leetcode, codechef, code360, github] = await Promise.all([
    getCodeforces(handles.codeforces),
    getLeetCode(handles.leetcode),
    getCodeChef(handles.codechef),
    getCode360(handles.code360),
    getGitHub(handles.github),
  ]);

  return {
    codeforces,
    leetcode,
    codechef,
    code360,
    github,
    fetchedAt: new Date().toISOString(),
  };
}

/** Total distinct problems solved across the three judges we can read. */
export function totalSolved(stats: StatsBundle): number {
  return (
    (stats.codeforces?.solved ?? 0) +
    (stats.leetcode?.solved ?? 0) +
    (stats.codechef?.solved ?? 0) +
    (stats.code360?.solved ?? 0)
  );
}
