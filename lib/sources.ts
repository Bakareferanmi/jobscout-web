import { XMLParser } from "fast-xml-parser";

export type RawListing = {
  title: string;
  company: string;
  location: string;
  url: string;
  posted: string;
  source: string;
  kind: "job" | "client";
};

const HEADERS = { "User-Agent": "JobScoutWeb/1.0 (personal job search tool)" };
const REDDIT_HEADERS = { "User-Agent": "web:jobscout-web:1.0 (personal use)" };
const parser = new XMLParser({ ignoreAttributes: false });

async function safeFetch(url: string, headers: Record<string, string> = HEADERS): Promise<Response | null> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (res.status === 429) {
      console.warn(`rate limited: ${url}`);
      return null;
    }
    if (res.status >= 400 && res.status < 500) {
      console.warn(`${url} returned ${res.status} — not retrying`);
      return null;
    }
    if (!res.ok) return null;
    return res;
  } catch (e) {
    console.warn(`request failed for ${url}: ${e}`);
    return null;
  }
}

export async function fetchRemotive(remotiveCategory: string): Promise<RawListing[]> {
  const res = await safeFetch(`https://remotive.com/api/remote-jobs?category=${remotiveCategory}`);
  if (!res) return [];
  const data = await res.json();
  return (data.jobs || []).map((j: any) => ({
    title: j.title || "",
    company: j.company_name || "",
    location: j.candidate_required_location || "",
    url: j.url || "",
    posted: j.publication_date || "",
    source: "remotive",
    kind: "job" as const,
  }));
}

export async function fetchRemoteok(tags: string[]): Promise<RawListing[]> {
  const res = await safeFetch("https://remoteok.com/api");
  if (!res) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter((j: any) => j && typeof j === "object" && j.position)
    .filter((j: any) => {
      if (!tags.length) return true;
      const jobTags = (j.tags || []).map((t: string) => t.toLowerCase());
      return tags.some((t) => jobTags.includes(t.toLowerCase()));
    })
    .map((j: any) => ({
      title: j.position || "",
      company: j.company || "",
      location: j.location || "Remote",
      url: j.url || "",
      posted: j.date || "",
      source: "remoteok",
      kind: "job" as const,
    }));
}

export async function fetchArbeitnow(search: string): Promise<RawListing[]> {
  const res = await safeFetch("https://arbeitnow.com/api/job-board-api");
  if (!res) return [];
  const data = await res.json();
  const searchL = search.toLowerCase();
  return (data.data || [])
    .filter((j: any) => {
      const haystack = `${j.title || ""} ${(j.tags || []).join(" ")}`.toLowerCase();
      return !searchL || haystack.includes(searchL);
    })
    .map((j: any) => ({
      title: j.title || "",
      company: j.company_name || "",
      location: j.location || "Remote",
      url: j.url || "",
      posted: String(j.created_at || ""),
      source: "arbeitnow",
      kind: "job" as const,
    }));
}

export async function fetchJobicy(tag: string): Promise<RawListing[]> {
  const res = await safeFetch(`https://jobicy.com/api/v2/remote-jobs?count=30&tag=${encodeURIComponent(tag)}`);
  if (!res) return [];
  const data = await res.json();
  return (data.jobs || []).map((j: any) => ({
    title: j.jobTitle || "",
    company: j.companyName || "",
    location: j.jobGeo || "Remote",
    url: j.url || "",
    posted: j.pubDate || "",
    source: "jobicy",
    kind: "job" as const,
  }));
}

export async function fetchHimalayas(query: string): Promise<RawListing[]> {
  const res = await safeFetch(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(query)}`);
  if (!res) return [];
  const data = await res.json();
  return (data.jobs || []).map((j: any) => ({
    title: j.title || "",
    company: j.companyName || "",
    location: Array.isArray(j.locationRestrictions) && j.locationRestrictions.length > 0
      ? j.locationRestrictions.map((l: any) => l.name).join(", ")
      : "Worldwide",
    url: j.applicationLink || "",
    posted: j.pubDate ? new Date(j.pubDate).toISOString() : "",
    source: "himalayas",
    kind: "job" as const,
  }));
}

export async function fetchWwrRss(feedUrl: string): Promise<RawListing[]> {
  const res = await safeFetch(feedUrl);
  if (!res) return [];
  try {
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item;
    const list = Array.isArray(items) ? items : items ? [items] : [];
    return list.map((item: any) => ({
      title: String(item.title || ""),
      company: "",
      location: "Remote",
      url: String(item.link || ""),
      posted: String(item.pubDate || ""),
      source: "weworkremotely",
      kind: "job" as const,
    }));
  } catch {
    console.warn(`weworkremotely feed didn't parse — check ${feedUrl}`);
    return [];
  }
}

export async function fetchReddit(subreddit: string): Promise<RawListing[]> {
  await new Promise((r) => setTimeout(r, 1500));
  const res = await safeFetch(`https://www.reddit.com/r/${subreddit}/new/.rss`, REDDIT_HEADERS);
  if (!res) return [];
  try {
    const xml = await res.text();
    const data = parser.parse(xml);
    const entries = data?.feed?.entry;
    const list = Array.isArray(entries) ? entries : entries ? [entries] : [];
    return list
      .filter((e: any) => !String(e.title || "").toUpperCase().startsWith("[FORHIRE]"))
      .map((e: any) => ({
        title: String(e.title || ""),
        company: `r/${subreddit}`,
        location: "Remote",
        url: e.link?.["@_href"] || "",
        posted: String(e.updated || ""),
        source: "reddit",
        kind: "client" as const,
      }));
  } catch {
    console.warn(`r/${subreddit} feed didn't parse — likely rate-limited`);
    return [];
  }
}
