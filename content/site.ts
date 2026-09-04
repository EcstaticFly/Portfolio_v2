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
  location: "Ranchi, India",
  /** Canonical origin, used for metadata. Update after the first deploy. */
  url: "[INSERT_PRODUCTION_URL]",
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
    label: "GitHub",
    href: "https://github.com/EcstaticFly",
    display: "github.com/EcstaticFly",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/suyash607/",
    display: "linkedin.com/in/suyash607",
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
  detail: "CGPA 8.75/10",
  period: "2023–2027",
} as const;
