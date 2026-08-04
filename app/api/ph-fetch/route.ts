import { pool } from "@/lib/db";
import { fetchProductHuntLaunches } from "@/lib/producthunt";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || undefined;

  const launches = await fetchProductHuntLaunches(topic);
  let newCount = 0;

  for (const l of launches) {
    if (!l.productName || !l.url) continue;

    const existing = await pool.query("SELECT id FROM leads WHERE id = $1", [l.id]);
    if (existing.rows.length > 0) continue;

    await pool.query(
      `INSERT INTO leads (id, product_name, tagline, description, url, website, votes, comments_count, maker_name, maker_username, topics, launched_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'new')`,
      [l.id, l.productName, l.tagline, l.description, l.url, l.website, l.votes, l.commentsCount, l.makerName, l.makerUsername, l.topics, l.launchedAt || null]
    );
    newCount++;
  }

  return Response.json({ totalNew: newCount, fetched: launches.length });
}
