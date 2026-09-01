import { STATS_REVALIDATE, type Code360Stats } from "./types";

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

    const body = (await res.json()) as Code360Response;
    const counts = body.data?.dsa_domain_data?.problem_count_data;
    if (!counts) throw new Error("Code360: no DSA data");

    const byLevel = (level: string): number =>
      counts.difficulty_data?.find((d) => d.level === level)?.count ?? 0;

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
    };
  } catch {
    return null;
  }
}
