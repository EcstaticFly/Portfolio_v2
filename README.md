# Suyash Pandey — portfolio

A single-page portfolio plus a live `/stats` route, built as a ledger
rather than a landing page: a narrow left rail carrying the heading and a
real datum, a wide right column carrying the content, and hairlines
instead of cards.

Next.js 16 (App Router), TypeScript in strict mode, Tailwind v4 with a
fully custom theme, Framer Motion, `next/font`. No CMS, no database, no
custom server.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## Theme system

Two modes in one warm neutral-brown family, inverted in lightness. Six
custom properties, declared at `:root` and overridden under
`[data-theme="dark"]` in `app/globals.css`. **No component contains a
hex.** Tailwind utilities are readable aliases pointing at the same
properties (`bg-canvas`, `text-ink`, `text-muted`, `text-accent`,
`border-line`).

| Property        | Light — Warm stone | Dark — Espresso mono |
| --------------- | ------------------ | -------------------- |
| `--bg`          | `#E4DED0`          | `#1C1712`            |
| `--surface`     | `#EDE8DC`          | `#241D16`            |
| `--text`        | `#221D16` (12.5:1) | `#F2ECE0` (15.1:1)   |
| `--text-muted`  | `#675E50` (4.8:1)  | `#9C8F7C` (5.6:1)    |
| `--accent`      | `#6B4A3A` (5.9:1)  | `#C79B6E` (7.1:1)    |
| `--border`      | `#D3CBBA`          | `#33291E`            |

**One deliberate deviation from the spec.** Light `--text-muted` was
given as `#7C7364`, which measures **3.49:1** on `--bg` and fails WCAG AA
for anything under 24px — and it is used at 11–13px throughout. It is
darkened to `#675E50`, the nearest tone in the same family that passes at
4.76:1. Revert the one line in `globals.css` if you would rather have the
original value.

Three derived properties — `--accent-soft`, `--accent-mid`,
`--accent-wash` — are `color-mix`ed from `--accent` and `--bg`, so charts
and donuts get real values in both themes instead of borrowing opacity.

- The theme resolves in a **blocking inline script** in `<head>`
  (`components/theme-script.tsx`), before first paint, so there is no
  flash of the wrong theme. A post-mount effect would paint the default
  first.
- Default is the OS preference; the toggle overrides it and persists to
  `localStorage`; with no stored choice the page keeps following the OS
  live.
- Colour transitions are opt-in per switch: the toggle adds a
  `theme-transition` class for 240ms, so first paint never animates.
  Skipped entirely under `prefers-reduced-motion`.
- The accent is intentionally muted, so **no interactive element is
  marked by colour alone** — `.link-rule` draws an underline on hover and
  focus, `.link-inline` keeps a permanent one inside running text.

The only hardcoded hexes outside `globals.css` are in
`viewport.themeColor` (`app/layout.tsx`), which sets the browser chrome
colour and must be a literal — CSS variables are not resolvable there.

**There is no shadow scale in the stylesheet.** Structure comes from
hairlines and vertical rhythm; a drop shadow is the first step back
toward a card grid.

**Type.** Fraunces for display, General Sans for body — one face each,
no third. Fraunces is loaded as the full variable file so its `opsz`,
`SOFT` and `WONK` axes are available, which is what lets the 96px hero be
drawn differently rather than merely scaled. General Sans is self-hosted
from `app/fonts/` (three weights, ~23KB each), so nothing is fetched from
Fontshare at runtime. Both go through `next/font`, so there is no flash
and no layout shift.

The site has no monospaced face. It does not need one: `body` sets
`font-variant-numeric: tabular-nums`, so every figure, rating and table
column aligns in the body face.

## Content

Everything editable lives in `content/`, typed and free of JSX:

- `site.ts` — name, email, socials, **platform handles**, education
- `experience.ts`, `projects.ts`, `skills.ts`, `achievements.ts`

Values that aren't known yet are written as `[INSERT_…]`. `isPlaceholder()`
in `lib/utils.ts` checks for that prefix and the UI skips those elements
rather than rendering a dead link. Currently outstanding:

- `site.url` — set after the first deploy so `metadataBase` resolves
- `experience[].certificateUrl` for Target Board and SecNode

## `/stats`

Live figures from four platforms, cached by Next and refreshed every 30
minutes. No database, no cron, no backend — the Next cache *is* the
storage layer.

Each fetch carries `next: { revalidate: 1800 }` and both routes declare
the matching segment `revalidate`. Segment config has to be a literal
Next can read statically, so it can't be the imported constant; it's
written as `export const revalidate: typeof STATS_REVALIDATE = 1800`, and
the type annotation makes the file stop compiling if the shared constant
ever changes.

| Platform   | Source                                            | Auth        |
| ---------- | ------------------------------------------------- | ----------- |
| Codeforces | Official API (`user.info`, `user.rating`, `user.status`) | none |
| LeetCode   | Public GraphQL endpoint, incl. contest history     | none        |
| CodeChef   | HTML parse of the public profile — no API exists   | none        |
| Code360    | Public `user_details` JSON endpoint, by UUID       | none        |
| GitHub     | REST profile + the public contributions calendar   | optional    |

Rating history comes from three of them, which is what feeds the
switchable trend chart: Codeforces `user.rating`, LeetCode
`userContestRankingHistory`, and CodeChef's `all_rating` array embedded
in its profile page.

`GITHUB_TOKEN` is honoured if set but is **not** required; it only raises
the REST rate limit. Contribution totals come from the public calendar
page, because they are not exposed by the REST API and the GraphQL API
that does expose them requires a token.

### When a platform goes down

Every getter catches its own failures and resolves to `null`, so one
platform can never reject the render or fail the build. The affected
block says so in plain language and the rest of the page stays live —
including the derived totals, which narrow to the judges that actually
responded. CodeChef is the fragile one by a wide margin, since it is
scraped; the parser treats every field as independently optional and
reports a total parse miss as unavailable rather than as zero.

This path is tested by pointing `handles.codechef` at a nonexistent user
and rebuilding. The build should still succeed and `/stats` should still
render, with only the CodeChef block replaced.

## Motion

One orchestrated moment: the hero name rises behind two masks, a brass
rule draws across, and the copy settles in with the live ratings last.
Everything else is a 360ms, 10px reveal that is meant to go unnoticed,
plus hover states and the count-up on `/stats`.

Motion is deliberately consistent: one gesture, used everywhere. Text
rises out of a soft blur word by word (`AnimatedText`); blocks and list
rows do the same thing as a unit, cascading one after another as their
section scrolls into view (`Stagger` / `StaggerItem`). Only opacity,
transform and filter are touched, all of which the compositor handles,
so nothing here forces layout. Per-word motion is reserved for headings
and leads — running paragraphs animate as a single block, because
word-by-word body copy is both harder to read and needlessly expensive.

**If JavaScript never runs, the page still appears.** Animated elements
are server-rendered hidden, so a client bundle that fails to execute —
a browser extension that mangles a chunk, an ad blocker, a proxy, a
dropped connection — would otherwise leave the whole site blank. A CSS
animation on `[data-entrance]` reveals everything after four seconds;
`components/hydration-flag.tsx` sets `data-hydrated` on the root once
React hydrates, which disarms it. CSS animations were chosen because
animated values outrank inline styles in the cascade, which is what it
takes to override the hidden styles Framer Motion writes. Verify it by
disabling JavaScript in devtools and reloading.

**Reduced motion is handled in CSS, not JavaScript, and this matters.**
The server renders every animated element in its *hidden* state — it
cannot know the visitor's preference — so a client-side
`useReducedMotion()` check that skips the animation also leaves those
inline styles in place forever, and the hero never appears. Every
animated element therefore carries `data-entrance`, and a rule in the
`prefers-reduced-motion` block clears the transform, opacity and stroke
offsets before hydration. The JS check remains, but only to collapse the
timings; the CSS is the guarantee.

## Local development

If the dev server renders a blank page while the production build is
fine, suspect a devtools extension before suspecting the code. The
Console Ninja VS Code extension instruments Turbopack chunks and, in its
preview support, can truncate them — the vendor bundles then throw
`SyntaxError`, React never hydrates, and every animated element stays in
its hidden server-rendered state. Pause the extension, delete `.next`
(the truncated chunk is cached on disk), and restart. The failsafe above
also covers this case after four seconds.

## Skills

`content/skills.ts` carries a [simple-icons](https://simpleicons.org)
slug per entry. Icons are resolved **on the server**, so only the handful
of path strings actually used are inlined into the HTML and the package
never reaches the client bundle. Marks are drawn in `currentColor`, not
brand colours: thirty saturated logos would fight the palette and each
other, and one ink means they invert with the theme for free. An entry
with `icon: null` has no brand mark (SQL, AWS, a concept) and falls back
to a typographic monogram rather than a borrowed glyph.

## Performance notes

- Both routes are statically prerendered; no visitor triggers or waits on
  a platform fetch.
- The rating chart is hand-drawn SVG rather than a charting library — one
  path, one baseline, two labels. No library was worth ~40KB for that, and
  a default chart look is exactly what the design avoids. It is still
  code-split with `next/dynamic`, and still server-rendered, so the line
  is in the HTML for crawlers and before hydration.
- The count-up on `/stats` writes through a ref rather than React state,
  and sits inside a container whose width is reserved by an invisible copy
  of the final string, so counting causes no reflow.
- There are no images on the site, so there is no LCP image to prioritise.
  If you add one, use `next/image` and mark only that one `priority`.
