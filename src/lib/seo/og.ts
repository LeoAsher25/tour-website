import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${siteConfig.domain}`;

/** Default OG image — used when a page has no specific image. */
export const defaultOgImage = `${siteUrl}/images/logo.png`;

/**
 * Build a complete, share-ready OpenGraph + Twitter card block.
 * Facebook, Instagram, Zalo, LinkedIn and iMessage all read the same
 * `og:*` tags — there are no per-platform tags. The things that actually
 * make previews work everywhere: absolute image URLs, correct dimensions,
 * and the twitter: card tags for X/Twitter.
 */
export function buildOpenGraph(overrides: {
  title: string;
  description: string;
  type?: "website" | "article";
  url?: string;
  images?: string[];
  publishedTime?: string;
  authors?: string[];
  locale?: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    title: overrides.title,
    description: overrides.description,
    type: overrides.type ?? "website",
    url: overrides.url,
    siteName: siteConfig.brand.fullName,
    locale: overrides.locale === "vi" ? "vi_VN" : "en_US",
    images: overrides.images?.length
      ? overrides.images.map((url) => ({ url }))
      : [{ url: defaultOgImage }],
    ...(overrides.publishedTime
      ? { publishedTime: overrides.publishedTime }
      : {}),
  };
}

/** Twitter card block mirroring the OpenGraph fields above. */
export function buildTwitterCard(overrides: {
  title: string;
  description: string;
  images?: string[];
}): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title: overrides.title,
    description: overrides.description,
    images: overrides.images?.length ? overrides.images : [defaultOgImage],
  };
}
