import * as cheerio from "cheerio";
import { STATS_REVALIDATE, type GitHubStats } from "./types";

/**
 * Contribution totals are not in the REST API — only the GraphQL API has
 * them, and that one requires a token. Rather than making a token
 * mandatory, this reads the same public contributions calendar the
 * profile page renders, which needs no auth.
 *
 * GITHUB_TOKEN is still honoured if present: it only raises the REST
 * rate limit for the profile call, and nothing breaks without it.
 */
function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    "User-Agent": "suyash-portfolio",
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface GhUser {
  login: string;
  public_repos: number;
  followers: number;
}

async function getProfile(login: string): Promise<GhUser | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(login)}`,
      { headers: authHeaders(), next: { revalidate: STATS_REVALIDATE } }
    );
    if (!res.ok) return null;
    return (await res.json()) as GhUser;
  } catch {
    return null;
  }
}

interface Calendar {
  contributions: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

async function getCalendar(login: string): Promise<Calendar | null> {
  try {
    const res = await fetch(
      `https://github.com/users/${encodeURIComponent(login)}/contributions`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Accept: "text/html",
        },
        next: { revalidate: STATS_REVALIDATE },
      }
    );
    if (!res.ok) throw new Error(`GitHub calendar: HTTP ${res.status}`);

    const $ = cheerio.load(await res.text());

    // Each day is a <td data-date id="…">; its count lives in the
    // <tool-tip for="…"> that GitHub renders for screen readers.
    const counts = new Map<string, number>();
    $("tool-tip[for]").each((_, el) => {
      const target = $(el).attr("for");
      if (!target) return;
      const match = /^([\d,]+)\s+contribution/.exec($(el).text().trim());
      counts.set(
        target,
        match ? Number.parseInt(match[1].replace(/,/g, ""), 10) : 0
      );
    });

    const days: { date: string; count: number }[] = [];
    $("td[data-date]").each((_, el) => {
      const date = $(el).attr("data-date");
      const id = $(el).attr("id");
      if (!date) return;
      days.push({ date, count: (id && counts.get(id)) || 0 });
    });

    if (days.length === 0) throw new Error("GitHub calendar: no days parsed");

    days.sort((a, b) => a.date.localeCompare(b.date));

    const contributions = days.reduce((sum, d) => sum + d.count, 0);
    const activeDays = days.filter((d) => d.count > 0).length;

    let longestStreak = 0;
    let running = 0;
    for (const day of days) {
      running = day.count > 0 ? running + 1 : 0;
      longestStreak = Math.max(longestStreak, running);
    }

    // Walk backwards from the most recent day. Today counts if it has
    // activity, but an empty today does not break a streak that is still
    // alive — the day is not over yet.
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) currentStreak++;
      else if (i === days.length - 1) continue;
      else break;
    }

    return { contributions, activeDays, currentStreak, longestStreak };
  } catch {
    return null;
  }
}

export async function getGitHub(login: string): Promise<GitHubStats | null> {
  const [profile, calendar] = await Promise.all([
    getProfile(login),
    getCalendar(login),
  ]);
  if (!profile && !calendar) return null;

  return {
    login,
    contributions: calendar?.contributions ?? 0,
    activeDays: calendar?.activeDays ?? 0,
    currentStreak: calendar?.currentStreak ?? 0,
    longestStreak: calendar?.longestStreak ?? 0,
    publicRepos: profile?.public_repos ?? 0,
    followers: profile?.followers ?? 0,
  };
}
