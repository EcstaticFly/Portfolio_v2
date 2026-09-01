"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Shell } from "@/components/section";
import { AnimatedText, Stagger, StaggerItem } from "@/components/motion";
import { site } from "@/content/site";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface HeroLiveStat {
  label: string;
  value: string;
}

/**
 * The opening moment. The name resolves out of a blur word by word, a
 * rule draws itself across, then the copy and the live record arrive in
 * sequence — the record last, because it is what the page most wants you
 * to click.
 */
export function Hero({ live }: { live: HeroLiveStat[] }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[88svh] flex-col justify-center pt-28 pb-20 md:min-h-dvh md:pt-32">
      <Shell>
        <h1 className="font-display text-4xl leading-[0.95] font-light tracking-tight text-ink sm:text-5xl">
          <AnimatedText
            as="span"
            text="Suyash"
            className="block"
            onMount
            delay={0.15}
            stagger={0.05}
          />
          <AnimatedText
            as="span"
            text="Pandey"
            className="block"
            onMount
            delay={0.28}
            stagger={0.05}
          />
        </h1>

        <motion.div
          data-entrance=""
          className="mt-10 h-px origin-left bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={
            reduced ? { duration: 0 } : { duration: 1.1, ease: EASE, delay: 0.6 }
          }
        />

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
          <div>
            <AnimatedText
              as="p"
              text="I build backends that hold up once the traffic actually arrives."
              className="font-display max-w-[26ch] text-2xl leading-[1.18] font-light text-ink md:text-3xl"
              onMount
              delay={0.8}
              stagger={0.03}
            />

            <Stagger className="mt-6" delay={1.15} stagger={0.12}>
              <StaggerItem>
                <p className="max-w-[58ch] text-sm text-muted">
                  Computer Science and Engineering at IIIT Ranchi, class of
                  2027. Right now I write frontends for pre-release AI model
                  evaluation at Outlier.ai. Before that I shipped the backend
                  that took a platform through 100,000 registrations in its
                  first two days.
                </p>
              </StaggerItem>

              <StaggerItem className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={`mailto:${site.email}`}
                  className="link-rule text-sm text-ink"
                >
                  {site.email}
                </a>
                <a
                  href={site.resume}
                  className="link-rule text-sm text-muted"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Résumé
                </a>
              </StaggerItem>
            </Stagger>
          </div>

          {live.length > 0 ? (
            <Stagger className="md:text-right" delay={1.4} stagger={0.09}>
              <StaggerItem>
                <dl className="flex gap-8 md:justify-end">
                  {live.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse">
                      <dt className="mt-1 text-2xs text-muted">{stat.label}</dt>
                      <dd className="font-display text-xl font-light text-accent">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/stats"
                  className="link-rule mt-4 inline-block text-xs text-muted"
                >
                  Refreshed every half hour
                </Link>
              </StaggerItem>
            </Stagger>
          ) : null}
        </div>
      </Shell>
    </section>
  );
}
