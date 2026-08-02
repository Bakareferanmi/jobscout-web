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
};	

