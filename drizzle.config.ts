import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config.
 * Migrations use DATABASE_DIRECT_URL (direct connection, port 5432) so DDL
 * can run through the Postgres pooler host. Runtime/serverless code uses
 * DATABASE_URL (Supavisor transaction pooler, port 6543).
 */
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_DIRECT_URL ??
      process.env.DATABASE_URL ??
      "",
  },
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },
  strict: true,
  verbose: true,
});
