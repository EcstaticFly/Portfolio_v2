export interface Role {
  company: string;
  title: string;
  location: string;
  /** Rail text. Kept as written so the timeline reads as real dates. */
  period: string;
  /** Sort/eyebrow value for the rail's year marker */
  year: string;
  current?: boolean;
  /**
   * Anything still bracketed as [INSERT_…] is skipped by the UI rather
   * than rendered, so a missing link never ships as a dead one.
   */
  certificateUrl?: string;
  points: string[];
}

export const experience: Role[] = [
  {
    company: "Outlier.ai",
    title: "Freelance Frontend Developer, AI Data Annotator",
    location: "Remote",
    period: "March 2026 — Present",
    year: "2026",
    current: true,
    points: [
      "Built fast, lightweight Next.js/TypeScript and React.js frontend pages to support evaluation of pre-release AI models.",
      "Annotated data for AI platforms including ElevenLabs and Omni TTS to improve model output quality; earned $4,000+ on contract work.",
    ],
  },
  {
    company: "Target Board",
    title: "Software Developer Intern",
    location: "Remote",
    period: "January 2026 — April 2026",
    year: "2026",
    certificateUrl: "[INSERT_TARGET_BOARD_CERTIFICATE_URL]",
    points: [
      "Developed scalable backend APIs using Node.js/Express.js to handle high concurrent traffic.",
      "Deployed production infrastructure on DigitalOcean, integrating AWS S3 for secure object storage and MongoDB for data management.",
      "Engineered the platform to handle 100,000+ registrations within 2 days of launch, ensuring stability under heavy load.",
    ],
  },
  {
    company: "SecNode",
    title: "Full Stack Developer Intern",
    location: "Remote",
    period: "August 2025 — September 2025",
    year: "2025",
    certificateUrl: "[INSERT_SECNODE_CERTIFICATE_URL]",
    points: [
      "Engineered real-time scan progress updates with SSE and WebSockets in Node.js/Express.js.",
      "Integrated OWASP ZAP with a headless Chrome agent for automated vulnerability scans.",
      "Implemented AI-based reporting to generate concise post-scan vulnerability summaries.",
      "Optimized PostgreSQL queries and API gateway with an Nginx reverse proxy.",
      "Built frontend components in React.js, TypeScript, and Tailwind CSS.",
    ],
  },
  {
    company: "HR Sutra",
    title: "Full Stack Developer Intern",
    location: "Remote",
    period: "May 2025 — August 2025",
    year: "2025",
    points: [
      "Led system architecture: user flows and technology stack selection.",
      "Built the backend with Node.js/Express.js, including database schema design — ~90% of API integrations, using MongoDB and Redis.",
      "Built 50% of the frontend using Next.js. Containerized the application with Docker.",
    ],
  },
];
