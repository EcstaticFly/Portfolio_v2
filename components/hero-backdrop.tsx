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
 * Depth comes from parallax: layers translate at different fractions of
 * the pointer, so near ones outrun far ones and the eye reads
 * separation. A soft light follows the cursor on a faster spring.
 *
 * Two things here were rewritten for cost, and both are worth keeping
 * in mind before editing:
 *
 *   1. **No blur filters.** The glows were previously radial gradients
 *      with `blur-[120px]` on top. A radial gradient is already soft —
 *      the filter added nothing visually and a 736px element blurred by
 *      120px is an enormous convolution to rasterise every time the
 *      element repaints, which includes every theme change.
 *   2. **The cursor light moves by transform, not by repainting.** It
 *      used to animate the `background` gradient *string*, which
 *      repainted a viewport-sized element on every pointer move. It is
 *      now a fixed element with a static gradient, translated on the
 *      compositor.
 *
 * Everything animated here is `transform` only, and every colour is
 * mixed from the theme tokens so it re-themes for free.
 */
export function HeroBackdrop() {
  const reduced = useReducedMotion();

  // Normalised pointer, -0.5..0.5 per axis, for the parallax layers.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 38, damping: 20, mass: 1 });
  const sy = useSpring(my, { stiffness: 38, damping: 20, mass: 1 });

  // Raw pixel pointer for the light, which should feel attached rather
  // than trailing as far as the depth layers do.
  const lightX = useSpring(useMotionValue(-4000), {
    stiffness: 140,
    damping: 26,
    mass: 0.5,
  });
  const lightY = useSpring(useMotionValue(-4000), {
    stiffness: 140,
    damping: 26,
    mass: 0.5,
  });

  /* Layer travel in px. Larger = nearer the viewer. */
  const farX = useTransform(sx, (v) => v * 14);
  const farY = useTransform(sy, (v) => v * 10);
  const midX = useTransform(sx, (v) => v * 38);
  const midY = useTransform(sy, (v) => v * 26);
  const nearX = useTransform(sx, (v) => v * 72);
  const nearY = useTransform(sy, (v) => v * 48);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
      lightX.set(e.clientX);
      lightY.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, lightX, lightY, reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* far: one broad wash anchoring the field */}
      <motion.div style={{ x: farX, y: farY }} className="absolute -inset-[15%]">
        <div
          className="absolute top-[18%] left-[52%] h-[46rem] w-[46rem] rounded-full opacity-90"
          style={{
            background:
              "radial-gradient(circle, var(--accent-wash) 0%, transparent 62%)",
          }}
        />
      </motion.div>

      {/* mid: two smaller glows, offset so the field is not symmetrical.
          Desktop only — see the note on the near layer below. */}
      <motion.div
        style={{ x: midX, y: midY }}
        className="absolute -inset-[15%] hidden lg:block"
      >
        <div
          className="absolute top-[8%] left-[62%] h-[30rem] w-[30rem] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, var(--accent-soft) 0%, transparent 64%)",
          }}
        />
        <div
          className="absolute top-[58%] left-[38%] h-[26rem] w-[26rem] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--accent-mid) 0%, transparent 66%)",
          }}
        />
      </motion.div>

      {/* near: thin rings, the only hard edges — they give the parallax
          something crisp to read against.

          The mid glows and these rings are both `lg` and up only, and
          that is the same breakpoint at which the hero becomes two
          columns. It is not a coincidence: every offset here is a
          percentage tuned to put them in the empty band beside the
          portrait in that layout. Collapse to one column and the same
          percentages drop them straight through the content — the ring
          edges read as stray hairs crossing the name, and the darker
          `accent-mid` glow becomes a visible blob behind the copy
          rather than atmosphere at the margin.

          This also covers a phone in desktop mode, whose ~980px layout
          width still sits below `lg`, which is where both artefacts
          were reported. The far wash, the grain and the vignette carry
          the hero on smaller screens, and dropping four painted
          elements and two compositor layers makes it cheaper there
          too. */}
      <motion.div
        style={{ x: nearX, y: nearY }}
        className="absolute -inset-[15%] hidden lg:block"
      >
        <div className="absolute top-[16%] left-[58%] h-[30rem] w-[30rem] rounded-full border border-line opacity-60" />
        <div className="absolute top-[30%] left-[68%] h-[16rem] w-[16rem] rounded-full border border-line opacity-40" />
      </motion.div>

      {/* the interactive part: painted once, then only translated */}
      {!reduced ? (
        <motion.div
          className="absolute top-0 left-0 h-[52rem] w-[52rem] rounded-full opacity-70"
          style={{
            x: lightX,
            y: lightY,
            marginLeft: "-26rem",
            marginTop: "-26rem",
            background:
              "radial-gradient(circle, var(--accent-wash) 0%, transparent 60%)",
          }}
        />
      ) : null}

      {/* fine grain, which is what stops the gradients reading as flat
          CSS blobs. Inlined so it costs no request, and composited
          plainly — `mix-blend-mode` here forced a full-viewport blend
          layer for a texture that reads the same without it. */}
      <div
        className="absolute inset-0 opacity-[0.05]"
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
