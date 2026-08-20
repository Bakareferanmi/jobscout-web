import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const showDone = searchParams.get("showDone") === "1";

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  } else if (!showDone) {
    // Hide contacted/dismissed by default, same as the Jobs page — once
    // you're through with a launch it shouldn't keep cluttering the feed.
    conditions.push(`status NOT IN ('contacted', 'dismissed')`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);

  const { rows } = await pool.query(
    `SELECT * FROM leads ${where} ORDER BY votes DESC, fetched_at DESC LIMIT $${params.length}`,
    params
  );
  return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
}
