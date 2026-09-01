"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Atmosphere for the hero.
 *
 * Depth comes from parallax rather than from perspective tricks: four
 * layers move at different fractions of the pointer, so the near ones
 * outrun the far ones and the eye reads separation. A soft light tracks
 * the cursor on top of that, which is the part that makes it feel
 * responsive rather than merely decorative.
 *
 * Everything is a blurred radial gradient tinted from the theme tokens,
 * so it re-themes with the page and never introduces a colour of its
 * own. Only `transform` animates — no filter animation, no repaint — so
 * the whole thing rides the compositor.
 */
export function HeroBackdrop() {
  const reduced = useReducedMotion();

  // Normalised pointer position, -0.5..0.5 on each axis.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 38, damping: 20, mass: 1 });
  const sy = useSpring(my, { stiffness: 38, damping: 20, mass: 1 });

  // Raw pointer for the cursor light, which should feel attached to the
  // cursor rather than trailing it as much as the depth layers do.
  const lx = useSpring(mx, { stiffness: 120, damping: 24, mass: 0.6 });
  const ly = useSpring(my, { stiffness: 120, damping: 24, mass: 0.6 });

  /* Each layer's travel, in px. Larger = nearer the viewer. */
  const farX = useTransform(sx, (v) => v * 14);
  const farY = useTransform(sy, (v) => v * 10);
  const midX = useTransform(sx, (v) => v * 38);
  const midY = useTransform(sy, (v) => v * 26);
  const nearX = useTransform(sx, (v) => v * 72);
  const nearY = useTransform(sy, (v) => v * 48);

  const lightX = useTransform(lx, (v) => `${50 + v * 60}%`);
  const lightY = useTransform(ly, (v) => `${50 + v * 60}%`);

  // Composed here rather than inline in JSX: a hook may not sit behind a
  // conditional render.
  const cursorLight = useTransform(
    [lightX, lightY],
    ([x, y]) =>
      `radial-gradient(38rem circle at ${x} ${y}, var(--accent-wash) 0%, transparent 60%)`
  );

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* far: one broad wash that anchors the whole field */}
      <motion.div
        style={{ x: farX, y: farY }}
        className="absolute -inset-[15%]"
      >
        <div
          className="absolute top-[18%] left-[52%] h-[46rem] w-[46rem] rounded-full opacity-80 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, var(--accent-wash) 0%, transparent 68%)",
          }}
        />
      </motion.div>

      {/* mid: two smaller blooms, offset so the field is not symmetrical */}
      <motion.div
        style={{ x: midX, y: midY }}
        className="absolute -inset-[15%]"
      >
        <div
          className="absolute top-[8%] left-[62%] h-[26rem] w-[26rem] rounded-full opacity-[0.55] blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[58%] left-[38%] h-[22rem] w-[22rem] rounded-full opacity-40 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, var(--accent-mid) 0%, transparent 72%)",
          }}
        />
      </motion.div>

      {/* near: two thin rings, the only hard edges in the composition —
          they give the parallax something crisp to read against */}
      <motion.div
        style={{ x: nearX, y: nearY }}
        className="absolute -inset-[15%]"
      >
        <div className="absolute top-[16%] left-[58%] h-[30rem] w-[30rem] rounded-full border border-line opacity-60" />
        <div className="absolute top-[30%] left-[68%] h-[16rem] w-[16rem] rounded-full border border-line opacity-40" />
      </motion.div>

      {/* the interactive part: a soft light that follows the cursor */}
      {!reduced ? (
        <motion.div
          className="absolute inset-0 opacity-[0.55]"
          style={{ background: cursorLight }}
        />
      ) : null}

      {/* fine grain, which is what stops the gradients reading as flat
          CSS blobs. Inlined so it costs no request. */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* vignette, so the field sits behind the type instead of competing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 45%, transparent 35%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
