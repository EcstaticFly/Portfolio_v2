import Link from "next/link";
import { Section, Lead } from "@/components/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { achievements } from "@/content/achievements";

export interface LiveAchievement {
  figure: string;
  detail: string;
}

/**
 * `live` carries current figures for the one entry that has them. It is
 * optional so the section still renders correctly if every platform is
 * down — it simply falls back to the written text.
 */
export function Achievements({ live }: { live?: LiveAchievement }) {
  return (
    <Section id="achievements" label="Recognition" meta="Contests and rankings">
      <Reveal>
        <Lead>Results I can point at, rather than adjectives.</Lead>
      </Reveal>

      <Stagger as="div" className="mt-12" stagger={0.08}>
        <dl>
        {achievements.map((entry) => {
          const item =
            entry.id === "competitive" && live
              ? { ...entry, figure: live.figure, detail: live.detail }
              : entry;
          return (
          <StaggerItem
            key={item.title}
            className="grid gap-x-gutter gap-y-1 border-t border-line py-7 md:grid-cols-[13rem_1fr]"
          >
            <dt className="font-display text-lg font-light text-accent">
              {item.figure}
            </dt>
            <dd>
              <p className="text-base text-ink">{item.title}</p>
              <p className="mt-1 max-w-[56ch] text-sm text-muted">
                {item.detail}
              </p>
            </dd>
          </StaggerItem>
          );
        })}
        </dl>
      </Stagger>

      {/* This was the same sentence as a muted paragraph with the link
          buried mid-clause. The words were already doing the handoff —
          "these are point-in-time results, the live record is current" —
          so the only thing missing was for it to look like somewhere to
          go. Promoted to the card treatment the Experience tiles use;
          the wrapping Reveal is the one that was already here, so this
          adds no scroll observer. */}
      <Reveal delay={0.1}>
        <Link
          href="/stats"
          className="group mt-10 block rounded-2xl border border-line bg-surface/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface sm:p-7"
        >
          <p className="text-xs text-muted">The live record</p>
          {/* Echoes the <h1> on /stats so the destination is recognisable
              once you arrive. */}
          <p className="font-display mt-2 text-2xl leading-tight font-light text-ink transition-colors duration-300 group-hover:text-accent sm:text-3xl">
            Everything, counted
          </p>
          <p className="mt-3 max-w-[54ch] text-sm text-muted">
            The results above are points in time. Current ratings, every rated
            contest, a submission heatmap, the topic breakdown and the badges
            come straight from five platforms and refresh every half hour.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
            Open the live record
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </span>
        </Link>
      </Reveal>
    </Section>
  );
}
