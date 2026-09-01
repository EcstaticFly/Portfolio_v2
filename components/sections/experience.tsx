import { Section, Lead } from "@/components/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { experience } from "@/content/experience";
import { isPlaceholder } from "@/lib/utils";

/**
 * The one place on the site with an explicit sequence, so the one place
 * a timeline is honest. The rail carries real dates rather than invented
 * ordinals, and only the current role gets the brass node.
 */
export function Experience() {
  return (
    <Section
      id="experience"
      label="Experience"
      meta={`${experience.length} roles, all remote`}
    >
      <Reveal>
        <Lead>Four roles so far. Every one of them remote, and most of the
        work under the surface.</Lead>
      </Reveal>

      <Stagger as="div" className="mt-12" stagger={0.09}>
        <ol className="border-l border-line">
        {experience.map((role) => (
          <StaggerItem
            as="li"
            key={`${role.company}-${role.period}`}
            className="relative pb-14 pl-6 last:pb-0 md:pl-10"
          >
            <span
              aria-hidden="true"
              className={
                role.current
                  ? "absolute top-[0.55rem] -left-[3px] h-[7px] w-[7px] rounded-full bg-accent"
                  : "absolute top-[0.7rem] -left-px h-px w-4 bg-line"
              }
            />

            <p className="text-2xs text-muted">
              {role.period}
              {role.current ? " — current" : ""}
            </p>

            <h3 className="font-display mt-2 text-xl font-normal text-ink">
              {role.company}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {role.title}, {role.location}
            </p>

            <ul className="mt-5 max-w-[68ch] space-y-2.5">
              {role.points.map((point) => (
                <li
                  key={point.slice(0, 40)}
                  className="relative pl-5 text-sm text-ink/80 before:absolute before:top-[0.62em] before:left-0 before:h-px before:w-2.5 before:bg-line"
                >
                  {point}
                </li>
              ))}
            </ul>

            {!isPlaceholder(role.certificateUrl) ? (
              <a
                href={role.certificateUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-rule mt-4 inline-block text-xs text-muted"
              >
                Completion certificate
              </a>
            ) : null}
          </StaggerItem>
        ))}
        </ol>
      </Stagger>
    </Section>
  );
}
