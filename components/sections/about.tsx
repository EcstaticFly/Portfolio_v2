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
              I&rsquo;m in my third year of computer science at IIIT Ranchi, and
              most of what I actually know came from shipping things that then
              had to keep working. At Target Board that meant an API surface
              that absorbed 100,000 registrations in its first two days without
              falling over. At SecNode it meant streaming live scan progress
              over SSE and WebSockets while a headless Chrome agent drove OWASP
              ZAP underneath.
            </p>
            <p>
              The other half of my time goes to competitive programming, across
              Codeforces, CodeChef and LeetCode. It&rsquo;s the same instinct as
              the backend work: a problem, a hard constraint, and no credit for
              a solution that only holds on the easy input.
            </p>
          </div>

          <div className="space-y-5 text-base text-ink/80">
            <p>
              Right now I&rsquo;m freelancing with Outlier.ai, writing
              Next.js and React frontends used to evaluate pre-release AI
              models, and annotating speech data for platforms including
              ElevenLabs and Omni TTS. Reading model output critically all day
              turns out to be good practice for reading your own code the same
              way.
            </p>

            <dl className="border-t border-line pt-5 text-sm">
              <dt className="text-xs text-muted">Studying</dt>
              <dd className="mt-1 text-ink">{education.institution}</dd>
              <dd className="mt-1 text-muted">
                {education.degree}, {education.detail}
              </dd>
            </dl>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
