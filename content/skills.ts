/**
 * Each entry carries a simple-icons slug so the Skills grid can render a
 * real mark. `icon: null` means the concept has no logo (it isn't a
 * product), and the grid falls back to a typographic monogram rather
 * than an approximate or unrelated glyph.
 */
export interface Skill {
  name: string;
  /** simple-icons slug, or null where no brand mark exists */
  icon: string | null;
}

export interface SkillGroup {
  label: string;
  items: Skill[];
}

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    items: [
      { name: "C++", icon: "cplusplus" },
      { name: "Python", icon: "python" },
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "SQL", icon: null },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "Next.js", icon: "nextdotjs" },
      { name: "React", icon: "react" },
      { name: "React Native", icon: "react" },
      { name: "Redux", icon: "redux" },
      { name: "TanStack Query", icon: "reactquery" },
      { name: "Zustand", icon: null },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js", icon: "nodedotjs" },
      { name: "Express", icon: "express" },
      { name: "NestJS", icon: "nestjs" },
      { name: "GraphQL", icon: "graphql" },
      { name: "Socket.io", icon: "socketdotio" },
      { name: "Prisma", icon: "prisma" },
      { name: "Drizzle ORM", icon: "drizzle" },
    ],
  },
  {
    label: "Databases",
    items: [
      { name: "MongoDB", icon: "mongodb" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MySQL", icon: "mysql" },
      { name: "Redis", icon: "redis" },
      { name: "Neon", icon: "neon" },
      { name: "Convex", icon: null },
      { name: "Firebase", icon: "firebase" },
      { name: "Supabase", icon: "supabase" },
    ],
  },
  {
    label: "Tools and platforms",
    items: [
      { name: "Docker", icon: "docker" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Nginx", icon: "nginx" },
      { name: "Postman", icon: "postman" },
      { name: "AWS", icon: null },
      { name: "Google Cloud", icon: "googlecloud" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  {
    label: "Concepts",
    items: [
      { name: "Data structures and algorithms", icon: null },
      { name: "Microservices", icon: null },
      { name: "Full-stack development", icon: null },
      { name: "DBMS", icon: null },
    ],
  },
];
