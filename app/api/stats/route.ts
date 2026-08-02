import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT category, status, COUNT(*)::int as n FROM listings GROUP BY category, status"
  );
  return Response.json(rows);
}
