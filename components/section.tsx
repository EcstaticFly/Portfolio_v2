import type { ReactNode } from "react";
import { AnimatedText, Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  /** The section heading. Sentence case, small, in the left rail. */
  label: string;
  /** A real datum for the rail — a count, a span of years. Optional. */
  meta?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The page's one structural primitive: a narrow left rail carrying the
 * heading, and a wide right column carrying the content, separated from
 * what came before by a single hairline.
 *
 * The rail label is the real <h2>. It is small and quiet on purpose —
 * the content is the loud part — but the document outline stays correct.
 */
export function Section({
  id,
  label,
  meta,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 border-t border-line", className)}
    >
      <Shell>
        <div className="grid gap-y-10 py-20 md:grid-cols-[var(--spacing-rail)_1fr] md:gap-x-gutter md:py-section">
          <Reveal className="md:sticky md:top-28 md:self-start">
            <h2 className="text-xs text-muted">{label}</h2>
            {meta ? <p className="mt-2 text-2xs text-muted">{meta}</p> : null}
          </Reveal>
          <div className="min-w-0">{children}</div>
        </div>
      </Shell>
    </section>
  );
}

/** Shared page gutter. Max width is set by measure, not by a breakpoint. */
export function Shell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[76rem] px-6 md:px-10", className)}>
      {children}
    </div>
  );
}

/**
 * The opening line of a section, in the display face. Sets the terms
 * before the detail arrives. Body copy elsewhere stays under ~72ch.
 */
export function Lead({ children }: { children: string }) {
  return (
    <AnimatedText
      text={children.replace(/\s+/g, " ").trim()}
      className="font-display max-w-[34ch] text-xl font-light text-ink md:text-2xl"
    />
  );
}
