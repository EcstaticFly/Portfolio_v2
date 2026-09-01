export interface ProjectLink {
  label: string;
  href: string;
  /** Shown in muted type beside the label, in place of an arrow glyph */
  display: string;
}

export interface Project {
  name: string;
  /** One line, written to say what the thing *is* — not to sell it */
  summary: string;
  points: string[];
  stack: string[];
  links: ProjectLink[];
}

export const projects: Project[] = [
  {
    name: "Chatzy",
    summary:
      "A real-time chat platform where the interesting problem was keeping presence, media and an AI participant in sync over one socket connection.",
    points: [
      "MERN-based real-time chat: text and image messaging, an AI chatbot on the Gemini API, OTP authentication, user search, online-status filtering, and 32 customizable themes.",
      "Zustand for state, Cloudinary for image storage, Docker for deployment, Tailwind CSS and DaisyUI for the responsive interface.",
    ],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Docker"],
    links: [
      {
        label: "Live",
        href: "https://chatzy-mxp8.onrender.com/",
        display: "chatzy-mxp8.onrender.com",
      },
      {
        label: "Source",
        href: "https://github.com/EcstaticFly/Chatzy",
        display: "github.com/EcstaticFly/Chatzy",
      },
    ],
  },
  {
    name: "Devium",
    summary:
      "A collaborative code editor that runs what you write, then keeps the execution, the snippet and the conversation around it in one shared document.",
    points: [
      "Real-time execution, code sharing, collaboration, snippet starring, commenting, execution stats and theme customization.",
      "Clerk for auth, Zustand for state, Convex as the real-time database; Dockerized deployment with tiered pricing through LemonSqueezy.",
    ],
    stack: ["Next.js", "TypeScript", "Convex", "Docker", "Clerk"],
    links: [
      {
        label: "Live",
        href: "https://devium-nine.vercel.app/",
        display: "devium-nine.vercel.app",
      },
      {
        label: "Source",
        href: "https://github.com/EcstaticFly/Devium",
        display: "github.com/EcstaticFly/Devium",
      },
    ],
  },
];
