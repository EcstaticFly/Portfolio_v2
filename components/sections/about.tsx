import { Section, Lead } from "@/components/section";
import { Reveal } from "@/components/motion";
import { education } from "@/content/site";

export function About() {
  return (
    <Section id="about" label="About" meta="IIIT Ranchi, 2023–2027">
      <Reveal>
        <Lead>
          I like the part of this job where something has to survive contact
          with real users.
        </Lead>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-5 text-base text-ink/80">
            <p>
              I&rsquo;m in my last year of computer science at IIIT Ranchi, and
              most of what I actually know came from shipping things that then
              had to keep working. I build platforms across the stack, which in
              practice means the interface and the machinery behind it are the
              same job. At Target Board that meant an API surface that absorbed
              100,000 registrations in its first two days without falling over.
              At SecNode it meant a dashboard streaming live scan progress over
              SSE and WebSockets while a headless Chrome agent drove OWASP ZAP
              underneath.
            </p>
            <p>
              The other half of my time goes to competitive programming, across
              Codeforces, CodeChef and LeetCode. It&rsquo;s the same instinct as
              the engineering work: a problem, a hard constraint, and no credit
              for a solution that only holds on the easy input.
            </p>
          </div>

          <div className="space-y-5 text-base text-ink/80">
            <p>
              Most recently I was on contract with Outlier.ai as a frontend
              developer and AI data annotator &mdash; building Next.js and
              React interfaces used to evaluate pre-release AI models, and
              annotating speech data for platforms including ElevenLabs and
              Omni TTS. Reading model output critically all day turned out to
              be good practice for reading your own code the same way.
            </p>
            <p>
              Since then my time has gone into staying sharp: data structures
              and algorithms daily, competitive programming on the weekends,
              and building projects end to end. I&rsquo;m looking for a
              software developer internship or a graduate role where that gets
              used.
            </p>

            <dl className="border-t border-line pt-5 text-sm">
              <dt className="text-xs text-muted">Studying</dt>
              <dd className="mt-1 text-ink">{education.institution}</dd>
              <dd className="mt-1 text-muted">{education.degree}</dd>
              {/* Set at display size rather than trailing the degree line.
                  A CGPA is an early filter in graduate hiring, so it is
                  worth being legible at a glance. */}
              <dd className="mt-4 flex items-baseline gap-2.5">
                <span className="font-display text-3xl leading-none font-light text-accent">
                  {education.cgpa}
                </span>
                <span className="text-xs text-muted">
                  {education.cgpaScale} CGPA &middot; {education.period}
                </span>
              </dd>
            </dl>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
