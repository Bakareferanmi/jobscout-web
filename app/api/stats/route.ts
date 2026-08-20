import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { rows } = await pool.query(
    "SELECT category, status, COUNT(*)::int as n FROM listings GROUP BY category, status"
  );
  return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
}
