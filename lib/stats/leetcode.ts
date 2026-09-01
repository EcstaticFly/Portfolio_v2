import {
  STATS_REVALIDATE,
  type LeetCodeStats,
  type RatingPoint,
} from "./types";

const ENDPOINT = "https://leetcode.com/graphql";

/**
 * Public profile data only — no auth. The shape below matches what
 * leetcode.com's own profile page requests, which is why it has stayed
 * stable across the years the community wrappers have used it.
 */
const QUERY = `
  query profile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
    userContestRanking(username: $username) {
      rating
      attendedContestsCount
      globalRanking
      topPercentage
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      contest { title startTime }
    }
    allQuestionsCount { difficulty count }
  }
`;

interface DifficultyCount {
  difficulty: string;
  count: number;
}

interface LeetCodeResponse {
  data?: {
    matchedUser: {
      username: string;
      profile: { ranking: number | null } | null;
      submitStatsGlobal: { acSubmissionNum: DifficultyCount[] } | null;
    } | null;
    userContestRanking: {
      rating: number | null;
      attendedContestsCount: number | null;
      globalRanking: number | null;
      topPercentage: number | null;
    } | null;
    userContestRankingHistory:
      | {
          attended: boolean;
          rating: number;
          ranking: number | null;
          contest: { title: string; startTime: number };
        }[]
      | null;
    allQuestionsCount: DifficultyCount[] | null;
  };
  errors?: unknown;
}

const pick = (rows: DifficultyCount[] | undefined, key: string): number =>
  rows?.find((r) => r.difficulty === key)?.count ?? 0;

export async function getLeetCode(
  handle: string
): Promise<LeetCodeStats | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // LeetCode rejects requests without a browser-ish referer.
        Referer: "https://leetcode.com",
        "User-Agent": "suyash-portfolio",
      },
      body: JSON.stringify({ query: QUERY, variables: { username: handle } }),
      next: { revalidate: STATS_REVALIDATE },
    });
    if (!res.ok) throw new Error(`LeetCode: HTTP ${res.status}`);

    const body = (await res.json()) as LeetCodeResponse;
    const user = body.data?.matchedUser;
    if (!user) throw new Error("LeetCode: no such user");

    const solved = user.submitStatsGlobal?.acSubmissionNum;
    const totals = body.data?.allQuestionsCount ?? undefined;
    const contest = body.data?.userContestRanking ?? null;

    // Unattended contests are returned too, carrying the rating carried
    // forward; only attended rounds belong on a trend line.
    const history: RatingPoint[] = (
      body.data?.userContestRankingHistory ?? []
    )
      .filter((h) => h.attended)
      .map((h) => ({
        t: h.contest.startTime,
        rating: Math.round(h.rating),
        label: h.contest.title,
        rank: h.ranking,
      }));

    return {
      handle: user.username,
      solved: pick(solved, "All"),
      easy: pick(solved, "Easy"),
      medium: pick(solved, "Medium"),
      hard: pick(solved, "Hard"),
      totalEasy: pick(totals, "Easy"),
      totalMedium: pick(totals, "Medium"),
      totalHard: pick(totals, "Hard"),
      contestRating: contest?.rating ?? null,
      maxContestRating:
        history.length > 0
          ? Math.max(...history.map((h) => h.rating))
          : (contest?.rating ?? null),
      contestsAttended: contest?.attendedContestsCount ?? null,
      globalRanking: contest?.globalRanking ?? null,
      topPercentage: contest?.topPercentage ?? null,
      profileRanking: user.profile?.ranking ?? null,
      history,
    };
  } catch {
    return null;
  }
}
