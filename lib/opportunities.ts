import { Profile } from "./profile";

export type OpportunityType =
  | "JOB"
  | "CLIENT"
  | "STARTUP"
  | "FREELANCE"
  | "WEB3"
  | "IGNORE";

const NEGATIVE_INTENT_TERMS = [
  "[for hire]",
  "for hire",
  "available for hire",
  "seeking work",
  "looking for work",
  "looking for a job",
  "open to work",
  "freelance developer available",
  "developer available",
  "i am a developer",
  "i'm a developer",
];

const WEB3_TERMS = ["web3", "blockchain", "defi", "dao", "crypto", "smart contract", "dapp"];

const CLIENT_TERMS = [
  "website",
  "web site",
  "landing page",
  "business website",
  "web application",
  "web app",
  "mobile app",
  "application development",
  "build a website",
  "build a web app",
  "build an app",
  "need a developer",
  "need a web developer",
  "need someone to build",
  "developer needed",
  "website needed",
  "website development",
  "web development",
];

const STARTUP_TERMS = [
  "startup",
  "start-up",
  "mvp",
  "founder",
  "early stage",
  "product launch",
  "build a product",
];

const FREELANCE_TERMS = ["freelance", "freelancer", "contract", "gig", "fixed price", "client project"];

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "business websites": ["website", "web site", "business website", "landing page"],
  "web applications": ["web app", "web application", "web platform"],
  "startup mvps": ["mvp", "startup", "prototype", "product"],
  "landing pages": ["landing page"],
  "ai integrations": ["ai", "artificial intelligence", "gemini", "chatbot", "ai agent"],
  "mobile applications": ["mobile app", "android app", "ios app", "react native"],
};

export function classifyOpportunity(title: string, description = ""): OpportunityType {
  const text = `${title} ${description}`.toLowerCase();

  if (NEGATIVE_INTENT_TERMS.some((term) => text.includes(term))) return "IGNORE";
  if (WEB3_TERMS.some((term) => text.includes(term))) return "WEB3";
  if (CLIENT_TERMS.some((term) => text.includes(term))) return "CLIENT";
  if (STARTUP_TERMS.some((term) => text.includes(term))) return "STARTUP";
  if (FREELANCE_TERMS.some((term) => text.includes(term))) return "FREELANCE";
  return "JOB";
}

export function calculateMatch(
  title: string,
  description: string,
  profile: Profile
): { score: number; matchedSkills: string[] } {
  const text = `${title} ${description}`.toLowerCase();
  const matchedSkills: string[] = [];

  for (const skill of profile.skills) {
    if (text.includes(skill.toLowerCase())) matchedSkills.push(skill);
  }

  let score = Math.min(matchedSkills.length * 12, 48);

  const roleText = title.toLowerCase();
  for (const role of profile.targetRoles) {
    const roleWords = role.toLowerCase().split(" ");
    if (roleWords.some((word) => roleText.includes(word))) {
      score += 15;
      break;
    }
  }

  let serviceMatches = 0;
  for (const keywords of Object.values(SERVICE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) serviceMatches += 1;
  }
  score += Math.min(serviceMatches * 18, 36);

  const opportunityType = classifyOpportunity(title, description);

  if (opportunityType === "IGNORE") return { score: 0, matchedSkills };
  if (opportunityType === "CLIENT") score += 16;
  else if (opportunityType === "STARTUP") score += 10;
  else if (opportunityType === "FREELANCE") score += 8;
  else if (opportunityType === "WEB3") score += 6;

  return { score: Math.min(score, 100), matchedSkills };
}
