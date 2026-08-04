import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const validStatuses = ["new", "saved", "contacted", "dismissed"];
  if (!validStatuses.includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  const result = await pool.query(
    "UPDATE leads SET status = $1 WHERE id = $2",
    [body.status, id]
  );
  return Response.json({ updated: (result.rowCount ?? 0) > 0 });
}
