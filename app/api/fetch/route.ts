import { pool } from "@/lib/db";
import { CATEGORIES, REDDIT_SUBS, WWR_FEEDS } from "@/lib/config";
import { fetchRemotive, fetchRemoteok, fetchArbeitnow, fetchJobicy, fetchWwrRss, fetchReddit, RawListing } from "@/lib/sources";
import { matchesCategory, scoreListing } from "@/lib/scoring";
import { createHash } from "crypto";
import { NextRequest } from "next/server";

export const maxDuration = 60; // Vercel Hobby allows up to 60s for Node functions

function makeId(source: string, url: string): string {
  return createHash("sha256").update(`${source}:${url}`).digest("hex").slice(0, 16);
}

function makeFingerprint(title: string, company: string): string {
  const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${norm(title)}|${norm(company)}`;
}

async function saveListings(raw: RawListing[], category: string): Promise<number> {
  let newCount = 0;
  for (const item of raw) {
    if (!item.title || !item.url) continue;
    if (!matchesCategory(item.title, category)) continue;

    const id = makeId(item.source, item.url);
    const fingerprint = makeFingerprint(item.title, item.company);
    const score = scoreListing(item.title, category, item.posted);

    const existing = await pool.query("SELECT id FROM listings WHERE id = $1", [id]);
    if (existing.rows.length > 0) continue;

    const dupe = await pool.query(
      "SELECT id FROM listings WHERE category = $1 AND kind = $2 AND fingerprint = $3",
      [category, item.kind, fingerprint]
    );
    if (dupe.rows.length > 0) continue;

    await pool.query(
      `INSERT INTO listings (id, kind, category, title, company, location, url, source, posted, score, status, fingerprint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new', $11)`,
      [id, item.kind, category, item.title.trim(), item.company, item.location, item.url, item.source, item.posted, score, fingerprint]
    );
    newCount++;
  }
  return newCount;
}

export async function POST(request: NextRequest) {
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
    ];
    if (WWR_FEEDS[cat]) tasks.push(fetchWwrRss(WWR_FEEDS[cat]));

    const jobResults = await Promise.all(tasks);
    let raw: RawListing[] = jobResults.flat();

    // Reddit stays sequential — it's rate-limit sensitive
    for (const sub of REDDIT_SUBS[cat] || []) {
      raw = raw.concat(await fetchReddit(sub));
    }

    results[cat] = await saveListings(raw, cat);
  }

  const totalNew = Object.values(results).reduce((a, b) => a + b, 0);
  return Response.json({ totalNew, byCategory: results });
}
