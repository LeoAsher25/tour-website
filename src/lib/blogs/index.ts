import "server-only";

import { BlogRepository } from "@/lib/repositories/blogs";
import type { BlogRepository as BlogRepositoryInterface } from "./blog-repository";

let cached: BlogRepositoryInterface | null = null;

/**
 * Blog repository factory — Postgres-backed (canonical). The mock repository
 * is no longer the runtime default; public pages read published posts from
 * Postgres. (Mock data remains available for tests/dev via direct import.)
 */
export async function getBlogRepository(): Promise<BlogRepositoryInterface> {
  if (!cached) {
    cached = new BlogRepository();
  }
  return cached;
}
