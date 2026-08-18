import "server-only";
import "dotenv/config";

import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

/**
 * PostgreSQL client (server-only).
 *
 * - DATABASE_URL (Supavisor transaction pooler, port 6543) is used for
 *   runtime/serverless request handling.
 * - DATABASE_DIRECT_URL (direct connection, port 5432) is used by
 *   migrations/seeding (drizzle.config.ts + scripts/db-migrate.ts).
 *
 * `max: 1` keeps a single pooled connection per serverless instance to avoid
 * connection exhaustion; the `postgres` driver supports pipelining, so one
 * connection is enough for OLTP-style queries.
 */
function createRuntimeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env (Supavisor transaction pooler, port 6543)."
    );
  }
  return postgres(url, {
    // Small pool for serverless/Next.js: enough for concurrent page renders
    // without exhausting Supavisor connections.
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

// Reuse the client across hot reloads / warm serverless instances.
const globalForDb = globalThis as unknown as {
  __pg?: ReturnType<typeof postgres>;
  __drizzle?: PostgresJsDatabase<typeof schema>;
};

export const pg = globalForDb.__pg ?? (globalForDb.__pg = createRuntimeClient());

/** Drizzle ORM client (typed, server-only). */
export const db: PostgresJsDatabase<typeof schema> =
  globalForDb.__drizzle ?? (globalForDb.__drizzle = drizzle(pg, { schema }));

export { schema };
