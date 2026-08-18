/**
 * Apply Supabase RLS policies (supabase/rls.sql) as a single SQL script.
 * Uses DATABASE_URL (service role / superuser via connection string) so it can
 * manage policies on storage.objects and auth.uid() references.
 *
 * Usage:
 *   npm run db:rls
 */
import "dotenv/config";

import { readFileSync } from "node:fs";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing DATABASE_URL in .env — cannot apply RLS.");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });
  try {
    const script = readFileSync("supabase/rls.sql", "utf8");
    await sql.unsafe(script);
    console.log("RLS policies applied.");
  } catch (err) {
    console.error("RLS apply failed:", err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
