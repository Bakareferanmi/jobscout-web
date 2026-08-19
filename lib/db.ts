import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type Listing = {
  id: string;
  kind: "job" | "client";
  category: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  source: string;
  posted: string | null;
  score: number;
  status: "new" | "saved" | "applied" | "rejected";
  fingerprint: string | null;
  fetched_at: string;
  opportunity_type: string | null;
  match_score: number | null;
  matched_skills: string | null;
  lead_type: string | null;
  intent: string | null;
  commercial_value: string | null;
  recommended_action: string | null;
};

let schemaReady: Promise<void> | null = null;

// Idempotent — safe to call on every request. Only does real work the
// first time per serverless instance (or if a column is genuinely missing).
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .query(`
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS opportunity_type TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS match_score INTEGER;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS matched_skills TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS lead_type TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS intent TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS commercial_value TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS recommended_action TEXT;
      `)
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}
