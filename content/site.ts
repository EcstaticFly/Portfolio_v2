/**
 * Identity, links, and the competitive-programming handles that drive
 * /stats. Everything here is edited in one place; no component hardcodes
 * a handle, a URL, or an address.
 */

export const site = {
  name: "Suyash Pandey",
  /** Used for the wordmark and the browser tab */
  shortName: "Suyash Pandey",
  role: "Software developer",
  email: "suyashpandey607@gmail.com",
  /**
   * Published against the original brief, which said to keep this off
   * the public site because bots scrape it. Added later on an explicit
   * request. Removing it is a one-line change plus a redeploy — but a
   * number that has already been harvested stays harvested, so the
   * decision is worth being deliberate about.
   */
  phone: "+91 8081290747",
  location: "Ranchi, India",
  /** Canonical origin. Drives metadataBase, so link previews resolve. */
  url: "https://suyash-pandey.vercel.app",
  resume: "/resume.pdf",
} as const;

export interface SocialLink {
  label: string;
  href: string;
  /** Shown in muted text beside the label instead of an arrow glyph */
  display: string;
}

export const socials: SocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/suyash607/",
    display: "linkedin.com/in/suyash607",
  },
  {
    label: "GitHub",
    href: "https://github.com/EcstaticFly",
    display: "github.com/EcstaticFly",
  },
  {
    label: "LeetCode",
    href: "https://leetcode.com/u/suyash607/",
    display: "leetcode.com/u/suyash607",
  },
];

/**
 * Platform handles for /stats. Each was verified against the live API
 * before being written here.
 */
export const handles = {
  codeforces: "suyash607",
  leetcode: "suyash607",
  codechef: "ecstatic_fly",
  /** Code360 addresses profiles by UUID, not by a handle */
  code360: "42203627-94e3-4732-bde9-ea468937807f",
  github: "EcstaticFly",
} as const;

export const education = {
  institution: "Indian Institute of Information Technology, Ranchi",
  degree: "B.Tech, Computer Science and Engineering",
  /**
   * Split out from the degree line so About can set it at display size
   * rather than burying it in a run-on. A CGPA is a filter for a lot of
   * graduate hiring, so it should be readable at a glance rather than
   * something a reader has to find.
   */
  cgpa: "8.75",
  cgpaScale: "/10",
  period: "2023–2027",
} as const;
