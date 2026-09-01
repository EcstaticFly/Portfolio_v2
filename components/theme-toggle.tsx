"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A track with a travelling thumb, rather than an icon that swaps in
 * place. The movement is the feedback: you can see which side you are
 * on without reading the icon, and the thumb carries the accent so the
 * control is tied to the palette in both themes.
 *
 * The blocking script in <head> has already resolved and applied the
 * theme; this only mirrors it into React state and writes changes back.
 */
export function ThemeToggle() {
  const reduced = useReducedMotion();
  const [{ theme, mounted }, setState] = useState<{
    theme: Theme;
    mounted: boolean;
  }>({ theme: "dark", mounted: false });

  useEffect(() => {
    // The resolved theme only exists on the client; there is no
    // render-time equivalent, so this one-time sync is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ theme: readTheme(), mounted: true });
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Colour transitions are opt-in per switch, so first paint never
      // animates and only this interaction does.
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 260);
    }

    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or storage disabled: the switch still works for
      // this page view, it just will not be remembered.
    }
    setState((prev) => ({ ...prev, theme: next }));
  };

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      role="switch"
      aria-checked={isDark}
      className="group relative inline-flex h-8 w-[3.4rem] shrink-0 items-center rounded-full border border-line bg-surface transition-colors duration-300 hover:border-accent"
    >
      {/* Both icons sit in the track; the thumb passes over them. */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[0.42rem] text-muted">
        <SunIcon className="h-[0.85rem] w-[0.85rem]" />
        <MoonIcon className="h-[0.85rem] w-[0.85rem]" />
      </span>

      {mounted ? (
        <motion.span
          aria-hidden="true"
          className="relative z-10 flex h-[1.55rem] w-[1.55rem] items-center justify-center rounded-full bg-accent text-canvas shadow-sm"
          initial={false}
          animate={{ x: isDark ? "1.66rem" : "0.16rem" }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 32, mass: 0.7 }
          }
        >
          <motion.span
            className="flex items-center justify-center"
            initial={false}
            animate={{ rotate: isDark ? 0 : 180, opacity: 1 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }
            }
          >
            {isDark ? (
              <MoonIcon className="h-[0.85rem] w-[0.85rem]" />
            ) : (
              <SunIcon className="h-[0.85rem] w-[0.85rem]" />
            )}
          </motion.span>
        </motion.span>
      ) : (
        // Holds the thumb's footprint until the resolved theme is known,
        // so the header never shifts on hydration.
        <span className="ml-[0.16rem] h-[1.55rem] w-[1.55rem] rounded-full bg-accent/40" />
      )}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 1.8v2.4M12 19.8v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
