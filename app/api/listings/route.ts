import { pool, ensureSchema } from "@/lib/db";
import { buildListingFilters, buildOrderClause } from "@/lib/query";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  await ensureSchema();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const { conditions, params } = buildListingFilters(searchParams);

  // By default, hide applied/rejected listings so the screen stays focused
  // on what's still actionable. Only applies when no explicit status filter
  // is set, and can be turned off with showDone=1 (the frontend's "Show
  // completed" toggle).
  if (!searchParams.get("status") && searchParams.get("showDone") !== "1") {
    conditions.push(`status NOT IN ('applied', 'rejected')`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = buildOrderClause(searchParams.get("sort"));

  params.push(limit);
  const query = `SELECT * FROM listings ${where} ${orderBy} LIMIT $${params.length}`;

  try {
    const { rows } = await pool.query(query, params);
    return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }
}
