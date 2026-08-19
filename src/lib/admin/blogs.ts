import "server-only";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { mapBlog } from "@/lib/db/mappers";
import { textFromTiptap } from "@/lib/blogs/tiptap";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { blogInputSchema, type BlogInput } from "./blog-schema";
import {
  collectBlogKeys,
  collectImageKeysFromTiptap,
  removeOrphanedKeys,
} from "@/lib/storage/media-keys";

/**
 * Admin blog repository + actions.
 * Canonical content is Tiptap JSON (content_json); content_text is derived.
 * All mutations revalidate public blog pages + the blog list.
 */

export { blogInputSchema };
export type { BlogInput };

export class BlogAdminRepository {
  async listAll() {
    const rows = await db
      .select()
      .from(blogs)
      .orderBy(desc(blogs.updatedAt));
    return rows.map(mapBlog);
  }

  async getById(id: string) {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);
    return rows.length ? mapBlog(rows[0]) : null;
  }

  async create(input: BlogInput): Promise<string> {
    const admin = await getCurrentAdmin();
    const now = new Date();
    const contentText = textFromTiptap(input.contentJson) || "";
    const publishedAt =
      input.status === "published"
        ? now
        : null;

    const [row] = await db
      .insert(blogs)
      .values({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt ?? null,
        coverImageKey: input.coverImageKey ?? null,
        contentJson: input.contentJson,
        contentText,
        status: input.status,
        featured: input.featured,
        tags: input.tags,
        authorId: admin?.id ?? null,
        authorName: admin?.name ?? admin?.email ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        publishedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: blogs.id });

    this.revalidate();
    return row.id;
  }

  async update(id: string, input: BlogInput): Promise<void> {
    const existing = await this.getById(id);
    // Collect keys in use BEFORE updating (cover / inline images may change).
    const before = await collectBlogKeys(id);
    const now = new Date();
    const contentText = textFromTiptap(input.contentJson) || "";

    await db
      .update(blogs)
      .set({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt ?? null,
        coverImageKey: input.coverImageKey ?? null,
        contentJson: input.contentJson,
        contentText,
        status: input.status,
        featured: input.featured,
        tags: input.tags,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        // Set publishedAt when transitioning to published.
        publishedAt:
          input.status === "published"
            ? existing?.publishedAt
              ? new Date(existing.publishedAt)
              : now
            : null,
        updatedAt: now,
      })
      .where(eq(blogs.id, id));

    // Clean up removed cover/inline images if nothing else references them.
    const after = [
      input.coverImageKey,
      ...collectImageKeysFromTiptap(input.contentJson ?? null),
    ].filter((k): k is string => Boolean(k));
    const removed = before.filter((k) => !after.includes(k));
    await removeOrphanedKeys(removed);

    this.revalidate();
  }

  async setStatus(id: string, status: "draft" | "published" | "archived") {
    const now = new Date();
    const existing = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);
    if (existing.length === 0) return;

    await db
      .update(blogs)
      .set({
        status,
        publishedAt:
          status === "published"
            ? existing[0].publishedAt ?? now
            : status === "archived"
              ? existing[0].publishedAt
              : null,
        updatedAt: now,
      })
      .where(eq(blogs.id, id));
    this.revalidate();
  }

  async delete(id: string) {
    const keys = await collectBlogKeys(id);
    await db.delete(blogs).where(eq(blogs.id, id));
    // Remove objects no longer referenced (shared keys with tours/blogs stay).
    await removeOrphanedKeys(keys);
    this.revalidate();
  }

  private revalidate() {
    revalidatePath("/blogs", "page");
    revalidatePath("/blogs/[slug]", "page");
    revalidatePath("/admin/blogs", "page");
  }
}
