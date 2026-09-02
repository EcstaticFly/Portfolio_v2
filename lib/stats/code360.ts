import {
  STATS_REVALIDATE,
  type ActivityDay,
  type Badge,
  type Code360Stats,
} from "./types";

const BASE = "https://www.naukri.com/code360/api/v3/public_section";

/** Nothing on the platform predates this; it just has to be early. */
const HISTORY_START = "2018-01-01";

/**
 * Per-day contributions. Code360 does not advertise this, but the
 * profile page's own heatmap is driven by it and it needs no auth — the
 * only requirement is an explicit date range, which is why a bare call
 * returns "Date is required".
 *
 * Fetched separately from the profile so a failure here costs the
 * heatmap contribution and nothing else.
 */
async function getContributions(uuid: string): Promise<ActivityDay[]> {
  try {
    const end = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `${BASE}/profile/contributions?uuid=${encodeURIComponent(uuid)}&start_date=${HISTORY_START}&end_date=${end}`,
      {
        headers: {
          "User-Agent": "suyash-portfolio",
          Accept: "application/json",
        },
        next: { revalidate: STATS_REVALIDATE },
      }
    );
    if (!res.ok) return [];

    const body = (await res.json()) as {
      data?: { contribution_map?: Record<string, { total?: number }> };
    };
    const map = body.data?.contribution_map ?? {};

    return Object.entries(map)
      .map(([date, v]) => ({ date, count: Number(v?.total) || 0 }))
      .filter((d) => d.count > 0);
  } catch {
    return [];
  }
}

/**
 * Naukri Code360 (formerly Coding Ninjas Studio). Its profile page is
 * backed by a public JSON endpoint that needs no auth — the same one the
 * page itself calls — so this is a real API read rather than a scrape.
 *
 * The profile is addressed by UUID, not by handle.
 */
interface Code360Response {
  data?: {
    name?: string;
    user_level_name?: string | null;
    user_exp?: number | null;
    dsa_domain_data?: {
      problem_count_data?: {
        total_count?: number;
        difficulty_data?: { level: string; count: number }[];
      };
      /** tier -> { ptm | gp | sgp } -> topic names */
      badges_hash?: Record<string, Record<string, string[]>>;
    };
  };
}

export async function getCode360(uuid: string): Promise<Code360Stats | null> {
  try {
    const res = await fetch(
      `https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=${encodeURIComponent(uuid)}`,
      {
        headers: {
          "User-Agent": "suyash-portfolio",
          Accept: "application/json",
        },
        next: { revalidate: STATS_REVALIDATE },
      }
    );
    if (!res.ok) throw new Error(`Code360: HTTP ${res.status}`);

    const [body, activity] = await Promise.all([
      res.json() as Promise<Code360Response>,
      getContributions(uuid),
    ]);
    const counts = body.data?.dsa_domain_data?.problem_count_data;
    if (!counts) throw new Error("Code360: no DSA data");

    const byLevel = (level: string): number =>
      counts.difficulty_data?.find((d) => d.level === level)?.count ?? 0;

    // Badges arrive grouped by tier and then by track; the topic name is
    // the badge, the tier is its level.
    const badges: Badge[] = [];
    const hash = body.data?.dsa_domain_data?.badges_hash ?? {};
    for (const [tier, tracks] of Object.entries(hash)) {
      for (const topics of Object.values(tracks ?? {})) {
        for (const topic of topics ?? []) {
          badges.push({
            name: topic,
            platform: "Code360",
            date: null,
            tier: tier.charAt(0).toUpperCase() + tier.slice(1),
          });
        }
      }
    }

    return {
      uuid,
      solved: counts.total_count ?? 0,
      easy: byLevel("Easy"),
      // Code360 calls the middle band "Moderate" rather than "Medium".
      medium: byLevel("Moderate"),
      hard: byLevel("Hard"),
      ninja: byLevel("Ninja"),
      level: body.data?.user_level_name ?? null,
      experience: body.data?.user_exp ?? null,
      badges,
      activity,
    };
  } catch {
    return null;
  }
}
