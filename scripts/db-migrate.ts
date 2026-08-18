/**
 * Apply Drizzle SQL migrations against the database.
 * Uses DATABASE_DIRECT_URL (direct connection, port 5432) so DDL can run
 * through the pooler host.
 *
 * Usage:
 *   npm run db:migrate
 */
import "dotenv/config";

import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Resolve a usable Postgres connection URL.
 * Prefers DATABASE_DIRECT_URL (port 5432 direct) but falls back to
 * DATABASE_URL (pooler 6543) when the direct URL is missing or malformed
 * (e.g. a `jdbc:` scheme or empty credentials).
 */
function resolveDbUrl(): string {
  const direct = process.env.DATABASE_DIRECT_URL?.trim();
  const pooler = process.env.DATABASE_URL?.trim();

  const usable = (u: string | undefined) =>
    !!u &&
    (u.startsWith("postgres://") || u.startsWith("postgresql://")) &&
    /@/.test(u) &&
    !u.includes("jdbc:");

  if (usable(direct)) return direct as string;
  if (usable(pooler)) return pooler as string;
  throw new Error(
    "No usable Postgres connection URL. Set DATABASE_DIRECT_URL (postgresql://) or DATABASE_URL."
  );
}

async function main() {
  const url = resolveDbUrl();
  if (!url) {
    console.error(
      "Missing DATABASE_DIRECT_URL (or DATABASE_URL) in .env — cannot migrate."
    );
    process.exit(1);
  }

  const client = postgres(url, { max: 1, prepare: false });
  try {
    // drizzle-orm/postgres-js/migrator uses the same driver type as `postgres`.
    // We pass the raw client (it exposes query/transaction) — migrate() accepts it.
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
