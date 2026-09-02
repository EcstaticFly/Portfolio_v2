import { toLocalDate } from "./activity";
import {
  STATS_REVALIDATE,
  type ActivityDay,
  type CodeforcesStats,
  type RatingPoint,
} from "./types";

const API = "https://codeforces.com/api";

interface CfEnvelope<T> {
  status: string;
  result: T;
}

interface CfUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

interface CfRatingChange {
  contestName: string;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

interface CfSubmission {
  verdict?: string;
  creationTimeSeconds: number;
  problem: { contestId?: number; index: string; name: string };
}

async function cf<T>(path: string): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    // Opts this call into Next's data cache. On a later revalidation
    // failure Next keeps serving this cached response rather than
    // discarding it, which is the per-platform fallback the page relies on.
    next: { revalidate: STATS_REVALIDATE },
    headers: { "User-Agent": "suyash-portfolio" },
  });
  if (!res.ok) throw new Error(`Codeforces ${path}: HTTP ${res.status}`);
  const body = (await res.json()) as CfEnvelope<T>;
  if (body.status !== "OK") throw new Error(`Codeforces ${path}: not OK`);
  return body.result;
}

export async function getCodeforces(
  handle: string
): Promise<CodeforcesStats | null> {
  try {
    // Fetched together; a failure in any one rejects the whole platform
    // rather than reporting a half-populated card.
    const [users, changes, submissions] = await Promise.all([
      cf<CfUser[]>(`user.info?handles=${encodeURIComponent(handle)}`),
      cf<CfRatingChange[]>(`user.rating?handle=${encodeURIComponent(handle)}`),
      cf<CfSubmission[]>(
        `user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`
      ),
    ]);

    const user = users[0];
    if (!user) return null;

    // A problem can be solved more than once; count distinct problems.
    const solvedKeys = new Set<string>();
    for (const s of submissions) {
      if (s.verdict !== "OK") continue;
      solvedKeys.add(`${s.problem.contestId ?? "x"}-${s.problem.index}`);
    }

    // Every submission day, not only solved ones: "active" means the
    // day was worked, which is what the heatmap and streaks describe.
    const perDay = new Map<string, number>();
    for (const sub of submissions) {
      if (!sub.creationTimeSeconds) continue;
      // Bucketed in IST rather than UTC — see toLocalDate.
      const date = toLocalDate(sub.creationTimeSeconds);
      perDay.set(date, (perDay.get(date) ?? 0) + 1);
    }
    const activity: ActivityDay[] = [...perDay.entries()].map(
      ([date, count]) => ({ date, count })
    );

    const history: RatingPoint[] = changes.map((c) => ({
      t: c.ratingUpdateTimeSeconds,
      rating: c.newRating,
      label: c.contestName,
    }));

    return {
      handle: user.handle,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rank: user.rank ?? null,
      maxRank: user.maxRank ?? null,
      contests: changes.length,
      solved: solvedKeys.size,
      history,
      activity,
    };
  } catch {
    return null;
  }
}
