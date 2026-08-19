import { OpportunityType } from "./opportunities";

export type CommercialValue = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type LeadAnalysis = {
  leadType: OpportunityType;
  intent: string;
  commercialValue: CommercialValue;
  recommendedAction: string;
};

export function analyzeLead(
  title: string,
  company: string,
  category: string,
  kind: string,
  opportunityType: OpportunityType,
  matchScore: number
): LeadAnalysis {
  const text = `${title} ${company} ${category} ${kind}`.toLowerCase();

  if (opportunityType === "IGNORE") {
    return { leadType: "IGNORE", intent: "SELF_PROMOTION", commercialValue: "NONE", recommendedAction: "IGNORE" };
  }

  if (opportunityType === "CLIENT") {
    return {
      leadType: "CLIENT",
      intent: "SERVICE_REQUEST",
      commercialValue: matchScore >= 60 ? "HIGH" : "MEDIUM",
      recommendedAction: "CONTACT",
    };
  }

  if (opportunityType === "STARTUP") {
    return {
      leadType: "STARTUP",
      intent: "PRODUCT_BUILD",
      commercialValue: matchScore >= 60 ? "HIGH" : "MEDIUM",
      recommendedAction: "PITCH",
    };
  }

  if (opportunityType === "WEB3") {
    return {
      leadType: "WEB3",
      intent: "TALENT_REQUEST",
      commercialValue: matchScore >= 60 ? "HIGH" : "MEDIUM",
      recommendedAction: "CONTACT",
    };
  }

  if (opportunityType === "FREELANCE") {
    return {
      leadType: "FREELANCE",
      intent: "PROJECT_REQUEST",
      commercialValue: matchScore >= 60 ? "HIGH" : "MEDIUM",
      recommendedAction: "APPLY",
    };
  }

  let value: CommercialValue;
  if (text.includes("intern") || text.includes("internship")) value = "MEDIUM";
  else if (matchScore >= 70) value = "HIGH";
  else value = "LOW";

  return { leadType: "JOB", intent: "EMPLOYMENT", commercialValue: value, recommendedAction: "APPLY" };
}
