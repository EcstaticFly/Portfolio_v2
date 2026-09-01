"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

/**
 * Sun/moon switch. The blocking script in <head> has already resolved
 * and applied the theme, so this only mirrors it into React state and
 * writes changes back out.
 */
export function ThemeToggle() {
  const [{ theme, mounted }, setState] = useState<{
    theme: Theme;
    mounted: boolean;
  }>({ theme: "light", mounted: false });

  useEffect(() => {
    // The resolved theme only exists on the client; there is no
    // render-time equivalent, so this one-time sync is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ theme: readTheme(), mounted: true });
  }, []);

  // Follow the OS while the visitor has not made an explicit choice.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (localStorage.getItem("theme")) return;
      const next: Theme = media.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setState((prev) => ({ ...prev, theme: next }));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Transitions are opt-in per switch, so the first paint never
    // animates and only this interaction does.
    if (!reduced) {
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 240);
    }

    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or storage disabled — the switch still works for
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
      className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors duration-300 hover:border-accent hover:text-accent"
    >
      <span className="sr-only">{label}</span>
      {mounted ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isDark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          )}
        </svg>
      ) : (
        // Reserves the icon box until the resolved theme is known, so
        // the toggle never shifts the header.
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
