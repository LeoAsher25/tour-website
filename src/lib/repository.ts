import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { BlogRepository } from "@/lib/repositories/blogs";
import { PromoRepository, ReviewRepository, SettingsRepository } from "@/lib/repositories/blogs";
import {
  DestinationRepository,
  TourRepository,
} from "@/lib/repositories/tours";
import type {
  AddOn,
  BlogCardPost,
  BlogPost,
  Destination,
  HomepageTour,
  HomepageTourSectionData,
  PromoCode,
  Review,
  SiteSettings,
  Tour,
  TourVariant,
} from "@/types/domain";

/**
 * Repository is the single access point for domain data (public site).
 * Postgres-backed. Next.js `cache()` dedupes within a request; use
 * revalidateTag/revalidatePath after admin mutations to invalidate public
 * pages.
 *
 * Tour/blog reads are wrapped in `cache()` for per-request dedupe. Page-level
 * static generation + revalidation is configured at the route level.
 */

const tourRepo = new TourRepository();
const blogRepo = new BlogRepository();
const destinationRepo = new DestinationRepository();
const promoRepo = new PromoRepository();
const settingsRepo = new SettingsRepository();
const reviewRepo = new ReviewRepository();

const getHomepageToursPersistent = unstable_cache(
  async () => tourRepo.listHomepage(),
  ["homepage-tours"],
  { revalidate: 60, tags: ["public-tours"] }
);
const getPublishedToursPersistent = unstable_cache(
  async () => tourRepo.listPublished(),
  ["published-tours"],
  { revalidate: 60, tags: ["public-tours"] }
);
const getFeaturedToursPersistent = unstable_cache(
  async () => tourRepo.listFeatured(),
  ["featured-tours"],
  { revalidate: 60, tags: ["public-tours"] }
);
const getTourBySlugPersistent = (slug: string) =>
  unstable_cache(
    async () => tourRepo.getBySlug(slug),
    ["tour-by-slug", slug],
    { revalidate: 60, tags: ["public-tours", `public-tour:${slug}`] }
  )();

const getHomepageToursCached = cache(async () => getHomepageToursPersistent());
const getPublishedToursCached = cache(async () => getPublishedToursPersistent());
const getFeaturedToursCached = cache(async () => getFeaturedToursPersistent());
const getTourBySlugCached = cache(async (slug: string) => getTourBySlugPersistent(slug));

export async function getHomepageTours(): Promise<HomepageTourSectionData> {
  return getHomepageToursCached();
}

export async function getPublishedTours(): Promise<Tour[]> {
  return getPublishedToursCached();
}

export async function getFeaturedTours(): Promise<Tour[]> {
  return getFeaturedToursCached();
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  return getTourBySlugCached(slug);
}

export async function getTourById(id: string): Promise<Tour | null> {
  return tourRepo.getById(id);
}

export async function getRelatedTours(
  slug: string,
  limit = 2
): Promise<HomepageTour[]> {
  return tourRepo.getRelatedBySlug(slug, limit);
}

export async function getDestinations(): Promise<Destination[]> {
  return destinationRepo.list();
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination | null> {
  return destinationRepo.getBySlug(slug);
}

export async function getToursByDestination(slug: string): Promise<Tour[]> {
  return tourRepo.getByDestination(slug);
}

export async function getReviews(): Promise<Review[]> {
  return reviewRepo.listPublished();
}

const getLatestBlogCardsPersistent = (limit: number) =>
  unstable_cache(
    async () => blogRepo.listLatestCards(limit),
    ["latest-blog-cards", String(limit)],
    { revalidate: 300, tags: ["public-blogs"] }
  )();

const getBlogPostsCached = cache(async () => blogRepo.listPublished());
const getLatestBlogPostsCached = cache(async (limit: number) =>
  blogRepo.listLatest(limit)
);
const getFeaturedBlogPostsCached = cache(async (limit: number) =>
  blogRepo.listFeatured(limit)
);
const getBlogPostBySlugCached = cache(async (slug: string) =>
  blogRepo.getBySlug(slug)
);

export async function getLatestBlogCards(limit = 3): Promise<BlogCardPost[]> {
  return getLatestBlogCardsPersistent(limit);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return getBlogPostsCached();
}

export async function getLatestBlogPosts(limit = 3): Promise<BlogPost[]> {
  return getLatestBlogPostsCached(limit);
}

export async function getFeaturedBlogPosts(limit = 3): Promise<BlogPost[]> {
  return getFeaturedBlogPostsCached(limit);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return getBlogPostBySlugCached(slug);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return settingsRepo.get();
}

export async function getPromoByCode(code: string): Promise<PromoCode | null> {
  return promoRepo.getByCode(code);
}

// Resolve pricing entities for a booking selection — server side only.
export async function resolvePricingEntities(
  tourId: string,
  variantId: string,
  addOnIds: string[]
): Promise<{ tour: Tour; variant: TourVariant; addOns: AddOn[] } | null> {
  return tourRepo.getPricingEntities(tourId, variantId, addOnIds);
}
