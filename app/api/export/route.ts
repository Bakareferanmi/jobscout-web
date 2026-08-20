import { pool } from "@/lib/db";
import { buildListingFilters, buildOrderClause } from "@/lib/query";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const { conditions, params } = buildListingFilters(searchParams);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = buildOrderClause(searchParams.get("sort"));

  const query = `SELECT * FROM listings ${where} ${orderBy}`;
  const { rows } = await pool.query(query, params);

  const headers = [
    "id", "kind", "category", "title", "company", "location",
    "url", "source", "posted", "score", "status", "fetched_at",
    "opportunity_type", "match_score", "matched_skills",
    "lead_type", "intent", "commercial_value", "recommended_action",
  ];
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
