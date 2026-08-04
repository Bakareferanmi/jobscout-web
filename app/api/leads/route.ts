import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);

  const { rows } = await pool.query(
    `SELECT * FROM leads ${where} ORDER BY votes DESC, fetched_at DESC LIMIT $${params.length}`,
    params
  );
  return Response.json(rows);
}
