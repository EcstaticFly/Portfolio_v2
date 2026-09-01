"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Shell } from "@/components/section";
import { AnimatedText, Stagger, StaggerItem } from "@/components/motion";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { site } from "@/content/site";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface HeroLiveStat {
  label: string;
  value: string;
}

/**
 * The opening moment. The name rolls into place letter by letter, a rule
 * draws itself across, then the copy and the live record arrive in
 * sequence — the record last, because it is what the page most wants you
 * to click.
 */
export function Hero({ live }: { live: HeroLiveStat[] }) {
  const reduced = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-[92svh] flex-col justify-center overflow-hidden pt-28 pb-20 md:min-h-dvh md:pt-32"
    >
      <HeroBackdrop />

      <Shell className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_auto] lg:gap-16">
          <div className="order-2 lg:order-1">
            <h1 className="font-display text-4xl leading-[0.95] font-light tracking-tight text-ink sm:text-5xl">
              <AnimatedText
                as="span"
                text="Suyash"
                className="block"
                onMount
                delay={0.15}
                stagger={0.04}
              />
              <AnimatedText
                as="span"
                text="Pandey"
                className="block"
                onMount
                delay={0.3}
                stagger={0.04}
              />
            </h1>

            <motion.div
              data-entrance=""
              className="mt-8 h-px origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 1.1, ease: EASE, delay: 0.7 }
              }
            />

            <AnimatedText
              as="p"
              text="I build backends that hold up once the traffic actually arrives."
              className="font-display mt-8 max-w-[24ch] text-2xl leading-[1.18] font-light text-ink md:text-3xl"
              onMount
              delay={0.9}
              stagger={0.014}
            />

            <Stagger className="mt-6" delay={1.3} stagger={0.12}>
              <StaggerItem>
                <p className="max-w-[54ch] text-sm text-muted">
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

              {live.length > 0 ? (
                <StaggerItem className="mt-10">
                  <dl className="flex flex-wrap gap-x-10 gap-y-4">
                    {live.map((stat) => (
                      <div key={stat.label} className="flex flex-col-reverse">
                        <dt className="mt-1 text-2xs text-muted">
                          {stat.label}
                        </dt>
                        <dd className="font-display text-xl font-light text-accent">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href="/stats"
                    className="link-rule mt-4 inline-block text-xs text-muted"
                  >
                    Refreshed every half hour
                  </Link>
                </StaggerItem>
              ) : null}
            </Stagger>
          </div>

          {/* Portrait. Circular by design, with a hairline ring and a soft
              halo picked from the accent so it sits inside the backdrop
              rather than on top of it. */}
          <motion.div
            data-entrance=""
            className="order-1 flex justify-center lg:order-2 lg:justify-end"
            initial={reduced ? false : { opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 1, ease: EASE, delay: 0.5 }
            }
          >
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-8 rounded-full opacity-70 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, var(--accent-wash) 0%, transparent 70%)",
                }}
              />
              <div className="relative h-40 w-40 overflow-hidden rounded-full border border-line sm:h-52 sm:w-52 lg:h-[19rem] lg:w-[19rem]">
                <Image
                  src="/profile_pic.jpeg"
                  alt={`${site.name}, portrait`}
                  fill
                  sizes="(min-width: 1024px) 19rem, (min-width: 640px) 13rem, 10rem"
                  className="object-cover"
                  priority
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 rounded-full border border-line opacity-60 sm:-inset-4"
              />
            </div>
          </motion.div>
        </div>
      </Shell>
    </section>
  );
}
