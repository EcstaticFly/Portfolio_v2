import { Section } from "@/components/section";
import { Reveal } from "@/components/motion";
import { site, socials } from "@/content/site";

/**
 * A mailto rather than a form. A form here would need a backend the
 * brief rules out, and a form that silently goes nowhere is worse than
 * an address. The phone number is deliberately not published.
 */
export function Contact() {
  return (
    <Section id="contact" label="Contact" meta="Open to internships">
      <Reveal>
        <p className="font-display max-w-[20ch] text-3xl leading-[1.1] font-light text-ink md:text-4xl">
          Have something that needs building?
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="mt-8 max-w-[54ch] text-base text-ink/80">
          I&rsquo;m open to internships and freelance work, and I answer email
          quickly. If it involves traffic that has to be survived or a problem
          with a hard constraint, I&rsquo;m especially interested.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <a
          href={`mailto:${site.email}`}
          className="font-display link-rule mt-10 inline-block text-xl font-light text-ink md:text-2xl"
        >
          {site.email}
        </a>
      </Reveal>

      <Reveal delay={0.15}>
        <dl className="mt-12 border-t border-line">
          {socials.map((social) => (
            <div
              key={social.label}
              className="grid gap-x-gutter gap-y-1 border-b border-line py-4 md:grid-cols-[13rem_1fr]"
            >
              <dt className="text-xs text-muted">{social.label}</dt>
              <dd>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-rule text-sm text-ink"
                >
                  {social.display}
                </a>
              </dd>
            </div>
          ))}
          <div className="grid gap-x-gutter gap-y-1 py-4 md:grid-cols-[13rem_1fr]">
            <dt className="text-xs text-muted">Résumé</dt>
            <dd>
              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer noopener"
                className="link-rule text-sm text-ink"
              >
                resume.pdf
              </a>
            </dd>
          </div>
        </dl>
      </Reveal>
    </Section>
  );
}
