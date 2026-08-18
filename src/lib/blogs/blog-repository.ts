import type { BlogPost } from "@/types/domain";

/**
 * Blog data access contract. UI components depend on this interface only —
 * swap the implementation (mock vs Firebase) without touching callers.
 */
export interface BlogRepository {
  /** All published posts, newest first (publishedAt DESC). */
  listPublished(): Promise<BlogPost[]>;
  /** Published posts marked featured, newest first. */
  listFeatured(limit?: number): Promise<BlogPost[]>;
  /** Latest published posts, newest first. */
  listLatest(limit?: number): Promise<BlogPost[]>;
  /** Single published post by slug, or null. */
  getBySlug(slug: string): Promise<BlogPost | null>;
}
