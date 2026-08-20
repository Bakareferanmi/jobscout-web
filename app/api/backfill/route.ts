import { pool, ensureSchema } from "@/lib/db";
import { classifyOpportunity, calculateMatch } from "@/lib/opportunities";
import { analyzeLead } from "@/lib/leads";
import { getProfile } from "@/lib/profile";
import { NextRequest } from "next/server";

// GET /api/backfill            -> only classifies rows that have never been
//                                  classified (opportunity_type IS NULL)
// GET /api/backfill?all=1      -> re-classifies every row, mirroring the
//                                  CLI's `reanalyze` — use after changing
//                                  lib/profile.ts so old listings pick up
//                                  the new skills/roles too
export async function GET(request: NextRequest) {
  await ensureSchema();
  const profile = getProfile();
  const all = new URL(request.url).searchParams.get("all") === "1";

  const { rows } = await pool.query(
    all
      ? "SELECT id, title, company, category, kind FROM listings"
      : "SELECT id, title, company, category, kind FROM listings WHERE opportunity_type IS NULL"
  );

  let updated = 0;
  for (const row of rows) {
    const opportunityType = classifyOpportunity(row.title);
    const { score: matchScore, matchedSkills } = calculateMatch(row.title, "", profile);
    const lead = analyzeLead(row.title, row.company || "", row.category, row.kind, opportunityType, matchScore);

    await pool.query(
      `UPDATE listings SET
         opportunity_type = $1, match_score = $2, matched_skills = $3,
         lead_type = $4, intent = $5, commercial_value = $6, recommended_action = $7
       WHERE id = $8`,
      [
        opportunityType, matchScore, JSON.stringify(matchedSkills),
        lead.leadType, lead.intent, lead.commercialValue, lead.recommendedAction,
        row.id,
      ]
    );
    updated++;
  }

  return Response.json({ mode: all ? "all" : "new-only", updated });
}
