import { pool, ensureSchema } from "@/lib/db";
import { buildListingFilters, buildOrderClause } from "@/lib/query";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await ensureSchema();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const { conditions, params } = buildListingFilters(searchParams);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = buildOrderClause(searchParams.get("sort"));

  params.push(limit);
  const query = `SELECT * FROM listings ${where} ${orderBy} LIMIT $${params.length}`;

  try {
    const { rows } = await pool.query(query, params);
    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }
}
