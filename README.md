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
- **The switch is instant. Do not animate it.** Three approaches were
  built and measured on /stats at 4x CPU throttle, using
  `PerformanceObserver({entryTypes:['longtask']})` — not rAF gaps, which
  are meaningless while a view transition composites:

  | Approach | Longest blocking task |
  | --- | ---: |
  | Colour transition on every element | 13,552ms |
  | View Transitions circular wipe | ~350–425ms |
  | **Instant attribute flip (current)** | **82ms** |

  The wipe looked good, but the API has to capture two full-viewport
  snapshots and run a style recalc *before* its first frame, so on a long
  page there is a stall on click — the exact lag it was supposed to
  remove.

- **The real cost was never the toggle.** It was the hero backdrop, and
  fixing that mattered far more than any switching strategy:
  `blur-[120px]` filters stacked on radial gradients that were already
  soft (a 736px element blurred by 120px is an enormous convolution), and
  a cursor light that animated its `background` gradient *string*,
  repainting a viewport-sized element on every pointer move. Both are now
  transform-only. Homepage toggle went 806ms -> 145ms, /stats 213ms ->
  82ms, and the run-to-run spread collapsed.

- `content-visibility: auto` on off-screen sections was tried and
  **reverted**: it breaks anchor navigation, because the browser scrolls
  using `contain-intrinsic-size` estimates before real heights resolve.
  A jump to `#platforms` landed 1,271px off.
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

**Badges** come from all three judges that publish them: LeetCode
`matchedUser.badges`, Code360's `badges_hash`, and the badge widget on
CodeChef's profile page.

**Activity and the heatmap** merge per-day data from all four judges:

| Platform | Where the per-day data comes from |
| --- | --- |
| LeetCode | `userCalendar`, queried once per active year |
| Codeforces | `user.status` timestamps |
| CodeChef | the `userDailySubmissionsStats` array its profile page feeds its own heatmap from |
| Code360 | `public_section/profile/contributions?uuid=&start_date=&end_date=` — undocumented but public; it returns "Date is required" unless given an explicit range, which is what makes it look broken |

Days are *unioned, not summed* — working on two judges on one date is a
single active day — and `lib/stats/activity.ts` recomputes both streaks
from the merged set rather than trusting any one platform's figure.

**Day boundaries are IST, not UTC** (`TZ_OFFSET_MINUTES` in
`activity.ts`). "Active day" means a day *he* worked, so it follows his
calendar; under UTC anything submitted before 05:30 IST lands on the
previous day. This only affects sources handing over raw timestamps,
which is Codeforces alone — the other three arrive pre-bucketed.

The heatmap's last day is passed in from the server (`fetchedAt`) rather
than read from the clock during render: reading it client-side would be
impure and would let server and client disagree about "today", which is
a hydration mismatch.

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
rolls up letter by letter from behind a clipping edge (`AnimatedText`);
blocks and list rows rise the same direction as a unit, cascading one
after another as their section scrolls into view (`Stagger` /
`StaggerItem`). Only `transform` and `opacity` are animated — no filters,
no width or height — so every frame stays on the compositor. Per-word motion is reserved for headings
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

```bash
npm run dev           # Turbopack (fast)
npm run dev:webpack   # slower first compile, immune to the issue below
```

**If interactive things are dead in dev but fine in `npm run build && npm start`,
it is the editor, not the code.** The Console Ninja VS Code extension
instruments Turbopack chunks and, in its preview-quality Turbopack
support, truncates them — `next/dist/client` and `react-dom` arrive cut
off mid-expression, throw `SyntaxError`, and React never hydrates. The
symptoms are specific and easy to misread as separate bugs: the theme
toggle does nothing, the mobile menu does nothing, chart tabs do
nothing, and all text appears at once with no animation (that last one
is the four-second CSS failsafe below doing its job).

To confirm it in ten seconds, fetch a vendor chunk and check it parses:

```bash
curl -s http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_0_*.js -o /tmp/c.js
node --check /tmp/c.js          # SyntaxError => truncated
grep -c oo_tx /tmp/c.js         # >0 => Console Ninja instrumented it
```

Two fixes, either works: pause the extension (Command Palette → *Console
Ninja: Pause*), delete `.next` since the truncated chunk is cached on
disk, and restart; or just run `npm run dev:webpack`, which is verified
to hydrate correctly even with the extension active.

## Theme default

Dark is the explicit default for a first-time visitor, set by the
blocking script in `<head>` regardless of the OS setting. A stored choice
always wins. Change the two `"dark"` literals in
`components/theme-script.tsx` (and the matching initial state in
`components/theme-toggle.tsx`) to flip it.

## Hero

Three pieces sit on top of each other:

- **`hero-backdrop.tsx`** — atmosphere. Depth comes from parallax, not
  perspective: four layers translate at different fractions of the
  pointer (roughly 14 / 38 / 72 px of travel), so near layers outrun far
  ones and the eye reads separation. A soft light tracks the cursor on a
  faster spring, and a fine inlined SVG grain keeps the gradients from
  reading as flat CSS blobs. Every colour is mixed from the theme
  tokens, so it re-themes for free. Transform-only, and it does not run
  at all on coarse pointers or under `prefers-reduced-motion`.
- **The portrait** — `public/profile_pic.jpeg`, circular, with a hairline
  ring and an accent halo. It is the LCP element, so it carries
  `priority`. To swap it, replace the file and keep the square aspect;
  anything non-square will crop from the centre.
- **The type** — name rolling in letter by letter, then the rule, copy
  and live figures in sequence.

## Skills

Two full-bleed marquee rows drift in opposite directions at different
speeds, slowing to a crawl on hover. The loop is pure CSS: each row
renders its cards twice and translates exactly `-50%`, so the wrap lands
on an identical frame with no JavaScript ticking per frame. Under
`prefers-reduced-motion` the animation is dropped and the rows become
ordinary horizontal scrollers.

`content/skills.ts` carries a [simple-icons](https://simpleicons.org)
slug per entry. Icons are resolved **on the server**, so only the handful
of path strings actually used are inlined into the HTML and the package
never reaches the client bundle. Marks are drawn in `currentColor`, not
brand colours: thirty saturated logos would fight the palette and each
other, and one ink means they invert with the theme for free. An entry
with `icon: null` has no brand mark (SQL, AWS, a concept) and falls back
to a typographic monogram rather than a borrowed glyph.

## Responsive rules worth keeping

Horizontal overflow on a page like this comes from a small number of
repeat offenders, all of which bit at least once here:

1. **Never use `100vw` for full-bleed.** It ignores the scrollbar. The
   skills marquee spans its section instead, through the `bleed` slot on
   `<Section>`.
2. **`overflow-x` containment belongs on `html`, not `body`** — it does
   not reliably propagate from body, and pairing `clip` with a `visible`
   cross-axis makes that axis compute to `auto`. Use `clip`, never
   `hidden`, or the sticky section rails stop working.
3. **Long unbreakable strings set at display size** will widen the whole
   layout viewport: an email address in the contact section and a single
   long word in an animated heading both did. `AnimatedText` word
   wrappers carry `max-w-full` so a word can wrap between its own
   glyphs.
4. **A fixed header must fit the narrowest target.** It cannot shrink to
   the page, so if its contents overflow, the viewport widens instead.
5. **Multi-column grids need to account for the section rail.** At `md`
   the rail already takes 176px, so a four-column figure grid inside it
   gets ~52px per column — the platform ledger waits for `lg`.

Check with `document.documentElement.scrollWidth` against
`clientWidth` at 320, 375, 414, 640, 768, 1024 and 1280.

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
