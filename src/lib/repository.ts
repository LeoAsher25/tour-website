import "server-only";

import { cache } from "react";

import { BlogRepository } from "@/lib/repositories/blogs";
import { PromoRepository, ReviewRepository, SettingsRepository } from "@/lib/repositories/blogs";
import {
  DestinationRepository,
  TourRepository,
} from "@/lib/repositories/tours";
import type {
  AddOn,
  BlogPost,
  Destination,
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

const getPublishedToursCached = cache(async () => tourRepo.listPublished());
const getFeaturedToursCached = cache(async () => tourRepo.listFeatured());
const getTourBySlugCached = cache(async (slug: string) => tourRepo.getBySlug(slug));

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
): Promise<Tour[]> {
  const source = await getPublishedTours();
  const current = source.find((t) => t.slug === slug);
  return source
    .filter(
      (t) =>
        t.slug !== slug && t.destinationSlug === current?.destinationSlug
    )
    .slice(0, limit);
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
  const tour = await getTourById(tourId);
  if (!tour) return null;
  const variant = tour.variants.find((v) => v.id === variantId);
  if (!variant) return null;
  const addOns = tour.addOns.filter((a) => addOnIds.includes(a.id));
  return { tour, variant, addOns };
}
