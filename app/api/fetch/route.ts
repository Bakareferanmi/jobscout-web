import { pool, ensureSchema } from "@/lib/db";
import { CATEGORIES, REDDIT_SUBS, WWR_FEEDS } from "@/lib/config";
import { fetchRemotive, fetchRemoteok, fetchArbeitnow, fetchJobicy, fetchWwrRss, fetchReddit, fetchHimalayas, RawListing } from "@/lib/sources";
import { matchesCategory, matchesClientIntent, scoreListing } from "@/lib/scoring";
import { classifyOpportunity, calculateMatch } from "@/lib/opportunities";
import { analyzeLead } from "@/lib/leads";
import { getProfile } from "@/lib/profile";
import { createHash } from "crypto";
import { NextRequest } from "next/server";

export const maxDuration = 60;

function makeId(source: string, url: string): string {
  return createHash("sha256").update(`${source}:${url}`).digest("hex").slice(0, 16);
}

function makeFingerprint(title: string, company: string): string {
  const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${norm(title)}|${norm(company)}`;
}

async function saveListings(raw: RawListing[], category: string): Promise<number> {
  const profile = getProfile();
  let newCount = 0;
  for (const item of raw) {
    if (!item.title || !item.url) continue;

    // Client-kind items (currently Reddit's r/forhire etc.) describe what
    // someone wants built, not a job title — match them against broad
    // client-intent terms instead of the category's job-title keywords.
    const isMatch = item.kind === "client"
      ? matchesClientIntent(item.title)
      : matchesCategory(item.title, category);
    if (!isMatch) continue;

    const id = makeId(item.source, item.url);
    const fingerprint = makeFingerprint(item.title, item.company);
    const score = scoreListing(item.title, category, item.posted);

    const opportunityType = classifyOpportunity(item.title);
    const { score: matchScore, matchedSkills } = calculateMatch(item.title, "", profile);
    const lead = analyzeLead(item.title, item.company || "", category, item.kind, opportunityType, matchScore);

    const existing = await pool.query("SELECT id FROM listings WHERE id = $1", [id]);
    if (existing.rows.length > 0) continue;

    const dupe = await pool.query(
      "SELECT id FROM listings WHERE category = $1 AND kind = $2 AND fingerprint = $3",
      [category, item.kind, fingerprint]
    );
    if (dupe.rows.length > 0) continue;

    await pool.query(
      `INSERT INTO listings (
         id, kind, category, title, company, location, url, source, posted, score, status, fingerprint,
         opportunity_type, match_score, matched_skills, lead_type, intent, commercial_value, recommended_action
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new', $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id, item.kind, category, item.title.trim(), item.company, item.location, item.url, item.source, item.posted, score, fingerprint,
        opportunityType, matchScore, JSON.stringify(matchedSkills), lead.leadType, lead.intent, lead.commercialValue, lead.recommendedAction,
      ]
    );
    newCount++;
  }
  return newCount;
}

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  await ensureSchema();

  const { searchParams } = new URL(request.url);
  const requestedCategory = searchParams.get("category");
  const categories = requestedCategory ? [requestedCategory] : Object.keys(CATEGORIES);

  const results: Record<string, number> = {};

  for (const cat of categories) {
    const cfg = CATEGORIES[cat];
    if (!cfg) continue;

    const tasks: Promise<RawListing[]>[] = [
      fetchRemotive(cfg.remotiveCategory),
      fetchRemoteok(cfg.remoteokTags),
      fetchArbeitnow(cfg.mustIncludeAny[0] || ""),
      fetchJobicy(cfg.remoteokTags[0] || ""),
      fetchHimalayas(cfg.mustIncludeAny[0] || ""),
    ];
    if (WWR_FEEDS[cat]) tasks.push(fetchWwrRss(WWR_FEEDS[cat]));

    const jobResults = await Promise.all(tasks);
    let raw: RawListing[] = jobResults.flat();

    for (const sub of REDDIT_SUBS[cat] || []) {
      raw = raw.concat(await fetchReddit(sub));
    }

    results[cat] = await saveListings(raw, cat);
  }

  const totalNew = Object.values(results).reduce((a, b) => a + b, 0);
  return Response.json({ totalNew, byCategory: results });
}
