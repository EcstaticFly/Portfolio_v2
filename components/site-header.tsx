"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Shell } from "@/components/section";
import { site } from "@/content/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const sections = [
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Work", id: "work" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy, home only. Marks the section occupying the middle band
  // of the viewport rather than the first one merely touching it.
  useEffect(() => {
    if (!onHome) return;
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [onHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-500",
        scrolled || open
          ? "border-b border-line bg-canvas/85 backdrop-blur-md"
          : "border-b border-transparent"
      )}
    >
      <Shell>
        <div className="flex h-16 items-center justify-between gap-6 md:h-20">
          <Link
            href="/"
            className="font-display text-lg font-normal tracking-tight text-ink transition-colors duration-300 hover:text-accent"
          >
            {site.shortName}
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {sections.map((s) => (
              <a
                key={s.id}
                href={href(s.id)}
                className={cn(
                  "relative text-xs transition-colors duration-300 hover:text-ink",
                  onHome && active === s.id ? "text-ink" : "text-muted"
                )}
              >
                {s.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    onHome && active === s.id ? "w-full" : "w-0"
                  )}
                />
              </a>
            ))}
            <Link
              href="/stats"
              className={cn(
                "text-xs transition-colors duration-300",
                pathname === "/stats"
                  ? "text-accent"
                  : "text-muted hover:text-accent"
              )}
            >
              Stats
            </Link>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="text-xs text-muted transition-colors duration-300 hover:text-ink md:hidden"
          >
            {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </Shell>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-canvas md:hidden"
          >
            <Shell>
              <ul className="flex flex-col py-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={href(s.id)}
                      onClick={() => setOpen(false)}
                      className="block border-b border-line/60 py-4 text-sm text-muted"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    href="/stats"
                    onClick={() => setOpen(false)}
                    className="block py-4 text-sm text-accent"
                  >
                    Stats
                  </Link>
                </li>
              </ul>
            </Shell>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
