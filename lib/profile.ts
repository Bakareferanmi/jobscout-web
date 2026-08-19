export type Profile = {
  name: string;
  title: string;
  level: string;
  email: string;
  portfolio: string;
  github: string;
  skills: string[];
  services: string[];
  targetRoles: string[];
  targetOpportunities: string[];
  remote: boolean;
};

export const DEFAULT_PROFILE: Profile = {
  name: "Bakare Feranmi",
  title: "Frontend Software Engineer",
  level: "Junior / Intern",
  email: "bakareferanmi96@gmail.com",
  portfolio: "https://BeepeeLabs.vercel.app",
  github: "https://github.com/Bakareferanmi",
  skills: [
    "React",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "React Native",
    "AI/API Integration",
  ],
  services: [
    "Business websites",
    "Web applications",
    "Startup MVPs",
    "Landing pages",
    "AI integrations",
    "Mobile applications",
  ],
  targetRoles: [
    "Frontend Software Engineer",
    "Junior Software Engineer",
    "React Developer",
    "Frontend Developer",
  ],
  targetOpportunities: [
    "Junior roles",
    "Internships",
    "Startup collaborations",
    "Freelance projects",
    "Web3 projects",
  ],
  remote: true,
};

export function getProfile(): Profile {
  return DEFAULT_PROFILE;
}
