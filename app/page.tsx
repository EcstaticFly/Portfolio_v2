import { Hero, type HeroLiveStat } from "@/components/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { Skills } from "@/components/sections/skills";
import { Achievements } from "@/components/sections/achievements";
import { Contact } from "@/components/sections/contact";
import { getStats, STATS_REVALIDATE } from "@/lib/stats";
import { formatNumber, round } from "@/lib/utils";

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

  return (
    <>
      <Hero live={live} />
      <About />
      <Experience />
      <Work />
      <Skills />
      <Achievements />
      <Contact />
    </>
  );
}
