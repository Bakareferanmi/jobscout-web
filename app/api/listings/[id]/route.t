import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { rows } = await pool.query(
    "SELECT * FROM listings WHERE id = $1 OR id LIKE $2",
    [params.id, `${params.id}%`]
  );
  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(rows[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validStatuses = ["new", "saved", "applied", "rejected"];
  if (!validStatuses.includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  const result = await pool.query(
    "UPDATE listings SET status = $1 WHERE id = $2 OR id LIKE $3",
    [body.status, params.id, `${params.id}%`]
  );
  return Response.json({ updated: (result.rowCount ?? 0) > 0 });
}
