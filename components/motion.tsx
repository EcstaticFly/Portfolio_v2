"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Shared viewport rule: fire a little before the element is fully in
   view so the reveal reads as anticipation rather than as a delay. */
const VIEWPORT = { once: true, margin: "0px 0px -14% 0px" } as const;

/* ── Text ─────────────────────────────────────────────────────────
   Words rise out of a soft blur rather than fading. It reads as type
   resolving into focus, which suits a serif display face and stays
   smooth because only opacity, transform and filter are touched — all
   compositor-friendly. */
const wordContainer = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const word: Variants = {
  hidden: { opacity: 0, y: "0.42em", filter: "blur(9px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

interface AnimatedTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Play on mount instead of waiting for the element to be scrolled to */
  onMount?: boolean;
}

/**
 * Reveals a line word by word. Reserved for headings and leads — running
 * body copy animates as a single block, because per-word motion on a
 * paragraph is both harder to read and needlessly expensive.
 *
 * The text stays a single accessible string: words are wrapped in inline
 * spans with real spaces between them, so screen readers and selection
 * behave normally.
 */
export function AnimatedText({
  text,
  as: Tag = "p",
  className,
  delay = 0,
  stagger = 0.035,
  onMount = false,
}: AnimatedTextProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  const play = onMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: VIEWPORT };

  return (
    <Tag className={className}>
      <motion.span
        data-entrance=""
        className="inline"
        variants={wordContainer(reduced ? 0 : stagger, reduced ? 0 : delay)}
        initial="hidden"
        {...play}
      >
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            data-entrance=""
            variants={word}
            transition={reduced ? { duration: 0 } : undefined}
            className="inline-block whitespace-pre"
            style={{ willChange: "transform, opacity, filter" }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

/* ── Blocks ───────────────────────────────────────────────────── */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article" | "section";
}

/**
 * The standard block reveal: a short rise out of a light blur, matching
 * the text treatment so the whole page shares one gesture.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      data-entrance=""
      className={className}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={VIEWPORT}
      transition={
        reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay }
      }
    >
      {children}
    </Component>
  );
}

/**
 * Cascades its children as the group scrolls into view — the "one by
 * one" reveal used for every list, grid and ledger on the site.
 */
export function Stagger({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  as = "div",
}: RevealProps & { stagger?: number }) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </Component>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

export function StaggerItem({
  children,
  className,
  as = "div",
}: Omit<RevealProps, "delay">) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      data-entrance=""
      className={className}
      variants={itemVariants}
      transition={reduced ? { duration: 0 } : undefined}
    >
      {children}
    </Component>
  );
}
