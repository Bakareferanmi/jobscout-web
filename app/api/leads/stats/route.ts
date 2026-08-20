import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { rows } = await pool.query(
    "SELECT status, COUNT(*)::int as n FROM leads GROUP BY status"
  );
  return Response.json(rows, { headers: { "Cache-Control": "no-store" } });
}
