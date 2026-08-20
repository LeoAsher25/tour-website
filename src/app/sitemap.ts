import type { MetadataRoute } from "next";

import { getBlogPosts, getPublishedTours } from "@/lib/repository";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tour-website-kohl.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, posts] = await Promise.all([
    getPublishedTours(),
    getBlogPosts(),
  ]);

  const localizedUrl = (path: string) => ({
    en: `${siteUrl}/en${path}`,
    vi: `${siteUrl}/vi${path}`,
  });

  const tourEntries: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${siteUrl}/en/tours/${tour.slug}`,
    changeFrequency: "yearly",
    priority: 0.8,
    alternates: {
      languages: localizedUrl(`/tours/${tour.slug}`),
    },
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/en/blogs/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: "yearly",
    priority: 0.6,
    alternates: {
      languages: localizedUrl(`/blogs/${post.slug}`),
    },
  }));

  return [
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: localizedUrl(""),
      },
    },
    {
      url: `${siteUrl}/en/blogs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: localizedUrl("/blogs"),
      },
    },
    ...tourEntries,
    ...blogEntries,
  ];
}
