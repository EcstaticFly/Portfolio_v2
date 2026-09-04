import * as simpleIcons from "simple-icons";
import { Section, Lead, Shell } from "@/components/section";
import { Reveal } from "@/components/motion";
import { skills, type Skill } from "@/content/skills";

interface IconData {
  path: string;
  title: string;
}

/**
 * simple-icons exports one object per brand, keyed `si` + PascalCase
 * slug. Resolving on the server means only the handful of path strings
 * actually used are inlined into the HTML - the package never reaches
 * the client bundle.
 */
function lookup(slug: string | null): IconData | null {
  if (!slug) return null;
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = (simpleIcons as unknown as Record<string, IconData | undefined>)[
    key
  ];
  return icon ?? null;
}

interface Entry {
  skill: Skill;
  group: string;
}

function SkillCard({ entry }: { entry: Entry }) {
  const icon = lookup(entry.skill.icon);

  return (
    <div className="group flex shrink-0 items-center gap-3.5 rounded-xl border border-line bg-accent-wash px-5 py-3.5 transition-colors duration-300 hover:border-accent">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
        {icon ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d={icon.path} />
          </svg>
        ) : (
          <span className="font-display text-sm leading-none font-normal">
            {entry.skill.name.slice(0, 2)}
          </span>
        )}
      </span>

      <span>
        <span className="block text-sm leading-snug whitespace-nowrap text-ink transition-colors duration-300 group-hover:text-accent">
          {entry.skill.name}
        </span>
        <span className="mt-0.5 block text-2xs whitespace-nowrap text-muted">
          {entry.group}
        </span>
      </span>
    </div>
  );
}

/**
 * One row of the marquee. The list is rendered twice: the animation
 * translates exactly -50%, so the second copy is mid-frame at the moment
 * it wraps and the seam is invisible. The duplicate is hidden from
 * assistive tech so the skills are announced once.
 */
function MarqueeRow({
  entries,
  direction,
  seconds,
}: {
  entries: Entry[];
  direction: "left" | "right";
  seconds: number;
}) {
  return (
    <div className="marquee-viewport overflow-hidden">
      <div
        className="marquee-track flex gap-3"
        data-dir={direction}
        style={{ animationDuration: `${seconds}s` }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 gap-3"
            aria-hidden={copy === 1 ? "true" : undefined}
          >
            {entries.map((entry) => (
              <SkillCard
                key={`${copy}-${entry.group}-${entry.skill.name}`}
                entry={entry}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const all: Entry[] = skills.flatMap((group) =>
    group.items.map((skill) => ({ skill, group: group.label }))
  );

  // Split by alternating rather than in half, so both rows carry a mix
  // of groups instead of one being all languages and the other all
  // tooling.
  const rowA = all.filter((_, i) => i % 2 === 0);
  const rowB = all.filter((_, i) => i % 2 === 1);


  return (
    <Section
      id="skills"
      label="Skills"
      meta={`${all.length} tools and topics`}
      bleed={
        <Reveal delay={0.05}>
          {/* Edge to edge without `100vw`: the section already spans the
              page, so the rows simply fill it. Using viewport units here
              is what previously let a scrollbar's width leak out as
              horizontal overflow on narrow screens. */}
          <div className="mt-12 flex flex-col gap-3">
            <MarqueeRow entries={rowA} direction="left" seconds={64} />
            <MarqueeRow entries={rowB} direction="right" seconds={78} />
          </div>
          <Shell>
            <p className="mt-6 text-xs text-muted">
              Hover to slow the rows down.
            </p>
          </Shell>
        </Reveal>
      }
    >
      <Lead>What I reach for, roughly in the order I reach for it.</Lead>
    </Section>
  );
}
