import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const kind = searchParams.get("kind");
  const minScore = searchParams.get("minScore");
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (kind) {
    params.push(kind);
    conditions.push(`kind = $${params.length}`);
  }
  if (minScore) {
    params.push(parseInt(minScore, 10));
    conditions.push(`score >= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);

  const query = `SELECT * FROM listings ${where} ORDER BY score DESC, fetched_at DESC LIMIT $${params.length}`;

  try {
    const { rows } = await pool.query(query, params);
    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }
}
