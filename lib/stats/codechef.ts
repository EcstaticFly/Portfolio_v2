import * as cheerio from "cheerio";
import {
  STATS_REVALIDATE,
  type CodeChefStats,
  type RatingPoint,
} from "./types";

/**
 * CodeChef publishes no API of any kind, so this parses the public
 * profile page. It is the most fragile of the four sources by a wide
 * margin: any markup change upstream will null it out.
 *
 * That is handled rather than hidden — every field is independently
 * optional, a parse miss yields null instead of throwing, and /stats
 * renders an honest "unavailable" line for the platform instead of a
 * blank card or a crash.
 */
export async function getCodeChef(
  handle: string
): Promise<CodeChefStats | null> {
  try {
    const res = await fetch(
      `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
      {
        headers: {
          // Served the bot version otherwise.
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Accept: "text/html",
        },
        next: { revalidate: STATS_REVALIDATE },
      }
    );
    if (!res.ok) throw new Error(`CodeChef: HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // The rating graph is driven by a JS array embedded in the page.
    // It is the only route to contest history, since there is no API.
    let history: RatingPoint[] = [];
    const raw = /var\s+all_rating\s*=\s*(\[[\s\S]*?\]);/.exec(html);
    if (raw) {
      try {
        const rows = JSON.parse(raw[1]) as {
          rating: string;
          name: string;
          rank: string;
          end_date: string;
        }[];
        history = rows
          .map((r) => ({
            t: Math.floor(new Date(r.end_date.replace(" ", "T") + "Z").getTime() / 1000),
            rating: Number.parseInt(r.rating, 10),
            label: r.name,
            rank: Number.parseInt(r.rank, 10) || null,
          }))
          .filter((p) => Number.isFinite(p.rating) && Number.isFinite(p.t));
      } catch {
        // A malformed array costs the trend line, not the whole platform.
        history = [];
      }
    }

    const int = (raw: string | undefined): number | null => {
      if (!raw) return null;
      const digits = raw.replace(/[^\d]/g, "");
      if (!digits) return null;
      const n = Number.parseInt(digits, 10);
      return Number.isFinite(n) ? n : null;
    };

    const rating = int($(".rating-number").first().text());

    // Rendered as "(Highest Rating 1672)" next to the current rating.
    const maxRating = int(
      /Highest Rating\s*([\d]+)/.exec($(".rating-header").first().text())?.[1]
    );

    // One <span> per filled star.
    const starSpans = $(".rating-star").first().find("span").length;
    const stars = starSpans > 0 ? starSpans : null;

    const solved = int(
      /Total Problems Solved:\s*([\d]+)/.exec($.root().text())?.[1]
    );

    const rankText = $(".rating-ranks").first().find("a strong");
    const globalRank = int(rankText.eq(0).text());
    const countryRank = int(rankText.eq(1).text());

    // A page that yields no rating at all is a parse failure, not a user
    // with no rating — report it as unavailable.
    if (rating === null && stars === null && solved === null) {
      throw new Error("CodeChef: profile markup did not parse");
    }

    return {
      handle,
      rating,
      maxRating,
      stars,
      solved,
      globalRank,
      countryRank,
      contests: history.length,
      history,
    };
  } catch {
    return null;
  }
}
