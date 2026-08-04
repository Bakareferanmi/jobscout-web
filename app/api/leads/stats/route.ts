import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT status, COUNT(*)::int as n FROM leads GROUP BY status"
  );
  return Response.json(rows);
}
