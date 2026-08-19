import { pool, ensureSchema } from "@/lib/db";
import { generatePitch } from "@/lib/pitch";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSchema();
  const { id } = await params;

  const { rows } = await pool.query(
    "SELECT title, company, opportunity_type FROM listings WHERE id = $1",
    [id]
  );

  if (rows.length === 0) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  const pitch = generatePitch(rows[0]);
  return Response.json(pitch);
}
