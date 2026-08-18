import type { BlogPost } from "@/types/domain";

import { mockBlogPosts } from "./mock-blog-posts";
import type { BlogRepository } from "./blog-repository";

/** In-memory implementation backed by realistic seed data. */
export class MockBlogRepository implements BlogRepository {
  async listPublished(): Promise<BlogPost[]> {
    return sortNewestFirst(mockBlogPosts.filter((p) => p.status === "published"));
  }

  async listFeatured(limit = 3): Promise<BlogPost[]> {
    return sortNewestFirst(
      mockBlogPosts.filter((p) => p.status === "published" && p.featured)
    ).slice(0, limit);
  }

  async listLatest(limit = 3): Promise<BlogPost[]> {
    return sortNewestFirst(
      mockBlogPosts.filter((p) => p.status === "published")
    ).slice(0, limit);
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const post = mockBlogPosts.find(
      (p) => p.status === "published" && p.slug === slug
    );
    return post ?? null;
  }
}

function sortNewestFirst(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );
}
