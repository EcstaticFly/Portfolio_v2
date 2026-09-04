import { Hero, type HeroLiveStat } from "@/components/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { Skills } from "@/components/sections/skills";
import {
  Achievements,
  type LiveAchievement,
} from "@/components/sections/achievements";
import { Contact } from "@/components/sections/contact";
import { getStats, STATS_REVALIDATE } from "@/lib/stats";
import { formatNumber, round, roundedHundreds } from "@/lib/utils";

/**
 * The homepage is otherwise static, but the hero footnote reads the same
 * cached platform data as /stats, so it revalidates on the same clock.
 * Nothing here blocks on the network: a visitor always gets the last
 * pre-rendered page.
 */
/**
 * Next requires this to be a literal it can read statically, so it
 * cannot be the imported constant. The type annotation is the guard: if
 * STATS_REVALIDATE ever changes, this line stops compiling.
 */
/**
 * Both routes are prerendered and must stay that way. The seed path in
 * getStats() performs uncached fetches on a completely empty store, and
 * without this Next would read those and downgrade the whole page to
 * on-demand rendering — turning every visit into a server render. This
 * pins the page to the static path; the seed is a one-time build-time
 * cost, and after that the page is rebuilt only by the scheduled refresh.
 */
export const dynamic = "force-static";

export const revalidate: typeof STATS_REVALIDATE = 1800;

export default async function HomePage() {
  const stats = await getStats();

  // Only figures that actually came back are shown. A platform that is
  // down simply drops out of the hero rather than rendering a dash.
  const live: HeroLiveStat[] = [];
  if (stats.codeforces?.rating) {
    live.push({
      label: "Codeforces",
      value: formatNumber(stats.codeforces.rating),
    });
  }
  if (stats.leetcode?.solved) {
    live.push({
      label: "LeetCode solved",
      value: formatNumber(stats.leetcode.solved),
    });
  }
  if (stats.codechef?.rating) {
    live.push({
      label: "CodeChef",
      value: formatNumber(round(stats.codechef.rating)),
    });
  }

  // The competitive-programming achievement quotes numbers that are also
  // fetched live, so it is built from the same data rather than from the
  // written copy. Only shown when the platforms it names responded.
  const cp = stats.codechef;
  const cf = stats.codeforces;
  const lc = stats.leetcode;
  // Codeforces reports its rank lowercase ("pupil").
  const cfRank = cf?.rank
    ? cf.rank.replace(/^\w/, (c) => c.toUpperCase())
    : null;
  const liveAward: LiveAchievement | undefined =
    cp?.stars && cp.maxRating && cfRank && lc?.solved
      ? {
          figure: `${cp.stars}★ / ${cfRank}`,
          detail: `CodeChef ${cp.stars}★ (${formatNumber(cp.maxRating)}), Codeforces ${cfRank}, LeetCode ${roundedHundreds(lc.solved)} problems solved.`,
        }
      : undefined;

  return (
    <>
      <Hero live={live} />
      <About />
      <Experience />
      <Work />
      <Skills />
      <Achievements live={liveAward} />
      <Contact />
    </>
  );
}
