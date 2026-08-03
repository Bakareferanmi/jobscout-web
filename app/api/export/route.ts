import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const kind = searchParams.get("kind");
  const minScore = searchParams.get("minScore");

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
  const query = `SELECT * FROM listings ${where} ORDER BY score DESC, fetched_at DESC`;

  const { rows } = await pool.query(query, params);

  const headers = ["id", "kind", "category", "title", "company", "location", "url", "source", "posted", "score", "status", "fetched_at"];
  const escape = (val: unknown) => {
    const s = String(val ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csvLines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  const csv = csvLines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="jobscout_export.csv"`,
    },
  });
}
