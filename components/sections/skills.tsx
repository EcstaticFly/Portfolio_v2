import * as simpleIcons from "simple-icons";
import { Section, Lead } from "@/components/section";
import { Stagger, StaggerItem } from "@/components/motion";
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

/**
 * Marks are drawn in `currentColor`, not their brand colours. Thirty
 * saturated logos would fight the palette and each other; in one ink
 * they read as a set, and they invert with the theme for free.
 */
function SkillMark({ skill }: { skill: Skill }) {
  const icon = lookup(skill.icon);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <span className="font-display text-xs leading-none font-normal">
          {skill.name.slice(0, 2)}
        </span>
      )}
    </span>
  );
}

export function Skills() {
  return (
    <Section id="skills" label="Skills" meta="Grouped by what they do">
      <Lead>What I reach for, roughly in the order I reach for it.</Lead>

      <div className="mt-12">
        {skills.map((group) => (
          <div
            key={group.label}
            className="grid gap-x-gutter gap-y-5 border-t border-line py-8 md:grid-cols-[13rem_1fr]"
          >
            <h3 className="text-xs text-muted">{group.label}</h3>

            <Stagger className="flex flex-wrap gap-2.5" stagger={0.035}>
              {group.items.map((skill) => (
                <StaggerItem key={`${group.label}-${skill.name}`}>
                  <span className="group flex cursor-default items-center gap-2.5 rounded-xl border border-line bg-surface/60 py-1.5 pr-4 pl-1.5 transition-colors duration-300 hover:border-accent">
                    <SkillMark skill={skill} />
                    <span className="text-sm whitespace-nowrap text-ink transition-colors duration-300 group-hover:text-accent">
                      {skill.name}
                    </span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ))}
      </div>
    </Section>
  );
}
