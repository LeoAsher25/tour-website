import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getBlogPosts, getPublishedTours } from "@/lib/repository";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tour-website-kohl.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, posts] = await Promise.all([
    getPublishedTours(),
    getBlogPosts(),
  ]);

  const tourEntries: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${siteUrl}/tours/${tour.slug}`,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blogs/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...tourEntries,
    ...blogEntries,
  ];
}
