import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs, promoCodes, reviews, siteSettings } from "@/lib/db/schema";
import { mapBlog, mapPromo, mapReview, mapSettings } from "@/lib/db/mappers";
import { estimateReadingMinutes } from "@/lib/blogs/tiptap";
import { publicUrlFor } from "@/lib/storage/media";
import type {
  BlogCardPost,
  BlogPost,
  PromoCode,
  Review,
  SiteSettings,
} from "@/types/domain";

/**
 * Postgres-backed blog repository (server-only).
 * Canonical content is Tiptap JSON (content_json); content_text is derived for
 * search/SEO. Only published posts are exposed to the public site.
 */
export class BlogRepository {
  async listPublished(): Promise<BlogPost[]> {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, "published"))
      .orderBy(desc(blogs.publishedAt));
    return rows.map(mapBlog);
  }

  async listFeatured(limit = 3): Promise<BlogPost[]> {
    const rows = await db
      .select()
      .from(blogs)
      .where(and(eq(blogs.status, "published"), eq(blogs.featured, true)))
      .orderBy(desc(blogs.publishedAt))
      .limit(limit);
    return rows.map(mapBlog);
  }

  /** Lightweight cards for homepage — no content_json/content_text transfer. */
  async listLatestCards(limit = 3): Promise<BlogCardPost[]> {
    const rows = await db
      .select({
        slug: blogs.slug,
        title: blogs.title,
        excerpt: blogs.excerpt,
        coverImageKey: blogs.coverImageKey,
        tags: blogs.tags,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        contentText: blogs.contentText,
      })
      .from(blogs)
      .where(eq(blogs.status, "published"))
      .orderBy(desc(blogs.publishedAt))
      .limit(limit);
    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      coverImage: row.coverImageKey ? publicUrlFor(row.coverImageKey) : "",
      tags: row.tags ?? [],
      publishedAt:
        row.publishedAt?.toISOString() ??
        (row.createdAt?.toISOString() ?? ""),
      readingMinutes: estimateReadingMinutes(row.contentText ?? ""),
    }));
  }

  async listLatest(limit = 3): Promise<BlogPost[]> {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, "published"))
      .orderBy(desc(blogs.publishedAt))
      .limit(limit);
    return rows.map(mapBlog);
  }

  async getBySlug(
    slug: string,
    opts: { publishedOnly?: boolean } = {}
  ): Promise<BlogPost | null> {
    const { publishedOnly = true } = opts;
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    if (publishedOnly && row.status !== "published") return null;
    return mapBlog(row);
  }

  async getById(id: string): Promise<BlogPost | null> {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);
    return rows.length ? mapBlog(rows[0]) : null;
  }
}

// ---------------------------------------------------------------------------
// Promo codes / reviews / settings
// ---------------------------------------------------------------------------

export class PromoRepository {
  async getByCode(code: string): Promise<PromoCode | null> {
    const normalized = code.trim().toUpperCase();
    const rows = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, normalized))
      .limit(1);
    return rows.length ? mapPromo(rows[0]) : null;
  }
}

export class SettingsRepository {
  async get(): Promise<SiteSettings> {
    const rows = await db.select().from(siteSettings).limit(1);
    if (rows.length === 0) {
      return {
        depositPercent: 30,
        vatPercent: 8,
        cardFeePercent: 4,
        currency: "VND",
        supportPhone: "",
        supportWhatsapp: "",
        supportEmail: "",
      };
    }
    return mapSettings(rows[0]);
  }
}

export class ReviewRepository {
  async listPublished(): Promise<Review[]> {
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.published, true))
      .orderBy(desc(reviews.date));
    return rows.map(mapReview);
  }
}
