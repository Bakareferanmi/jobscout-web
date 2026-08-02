export type CategoryConfig = {
  label: string;
  mustIncludeAny: string[];
  levelInclude: string[];
  exclude: string[];
  remotiveCategory: string;
  remoteokTags: string[];
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  frontend: {
    label: "Frontend (Intern/Junior)",
    mustIncludeAny: ["frontend", "front-end", "front end", "react", "javascript", "html", "css", "web developer"],
    levelInclude: ["junior", "intern", "entry", "graduate", "trainee", "associate", "jr."],
    exclude: ["senior", "lead", "staff", "principal", "head of", "manager", "director", "10+ years", "8+ years"],
    remotiveCategory: "software-dev",
    remoteokTags: ["frontend", "junior", "react"],
  },
  "data-analysis": {
    label: "Data Analysis",
    mustIncludeAny: ["data analyst", "data analysis", "data science", "sql", "power bi", "tableau", "excel analyst"],
    levelInclude: ["junior", "intern", "entry", "graduate", "trainee", "associate", "jr."],
    exclude: ["senior", "lead", "staff", "principal", "head of", "director", "10+ years", "8+ years"],
    remotiveCategory: "data",
    remoteokTags: ["data", "junior", "analyst"],
  },
  "digital-marketing": {
    label: "Social Media / Digital Marketing",
    mustIncludeAny: ["digital marketing", "social media", "content marketing", "seo", "marketing assistant", "community manager", "growth marketing", "brand", "content creator"],
    levelInclude: [],
    exclude: ["senior", "director", "vp ", "head of", "10+ years"],
    remotiveCategory: "marketing",
    remoteokTags: ["marketing", "social", "content"],
  },
  electrical: {
    label: "Electrical/Electronics Engineering (Entry-level)",
    mustIncludeAny: ["electrical engineer", "electronics engineer", "electrical technician", "power systems", "embedded", "control systems", "instrumentation", "iot engineer"],
    levelInclude: ["junior", "intern", "entry", "graduate", "trainee", "associate", "jr.", "grad"],
    exclude: ["senior", "lead", "principal", "10+ years", "8+ years"],
    remotiveCategory: "all-others",
    remoteokTags: ["engineer", "iot", "embedded"],
  },
  "it-support": {
    label: "IT Support",
    mustIncludeAny: ["it support", "helpdesk", "help desk", "technical support", "desktop support", "systems administrator", "it technician", "service desk"],
    levelInclude: [],
    exclude: ["senior", "lead", "manager", "director", "10+ years"],
    remotiveCategory: "all-others",
    remoteokTags: ["support", "helpdesk", "it"],
  },
};

// Upwork's public RSS is confirmed dead (410 Gone as of last check), so this
// isn't wired into the fetch route by default — kept here in case it returns.
export const CLIENT_SEARCH_TERMS: Record<string, string[]> = {
  frontend: ["react developer", "frontend developer", "landing page developer"],
  "data-analysis": ["data analyst", "excel data entry analysis", "dashboard sql"],
  "digital-marketing": ["social media manager", "digital marketing", "content marketing"],
  electrical: ["iot developer", "embedded systems", "electrical design"],
  "it-support": ["it support", "technical support specialist", "helpdesk"],
};

export const REDDIT_SUBS: Record<string, string[]> = {
  frontend: ["forhire", "jobbit", "remotejs"],
  "data-analysis": ["forhire", "jobbit"],
  "digital-marketing": ["forhire", "socialmediajobs"],
  electrical: ["forhire"],
  "it-support": ["forhire", "jobbit"],
};

// Corrected URL — WeWorkRemotely renamed this category from
// "remote-marketing-jobs" to "remote-sales-and-marketing-jobs".
export const WWR_FEEDS: Record<string, string> = {
  frontend: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "digital-marketing": "https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss",
  "it-support": "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
};

