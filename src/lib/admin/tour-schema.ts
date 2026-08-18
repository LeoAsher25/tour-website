import { z } from "zod";

/**
 * Tour input schema (Zod) — shared between the client editor and server API.
 * This file must stay free of server-only imports so the client editor can
 * validate without pulling the DB/repository into the browser bundle.
 */

export const itineraryStopSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  time: z.string().optional(),
  description: z.string(),
});

export const itineraryDaySchema = z.object({
  id: z.string().optional(),
  dayNumber: z.coerce.number(),
  title: z.string(),
  summary: z.string(),
  stops: z.array(itineraryStopSchema).default([]),
});

export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  answer: z.string(),
});

export const tourVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  description: z.string().optional(),
  priceType: z.enum(["per_person", "per_group"]).default("per_person"),
  basePrice: z.coerce.number().int().min(0),
  attrs: z.record(z.string(), z.string()).optional(),
  maxGroupSize: z.coerce.number().int().min(0).optional(),
});

export const tourAddOnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Add-on name is required"),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0),
  perPerson: z.boolean().default(false),
});

export const tourImageSchema = z.object({
  id: z.string().optional(),
  storageKey: z.string().min(1),
  alt: z.string().optional(),
});

export const tourInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  overview: z.string().optional(),
  destinationId: z.string().min(1, "Destination is required"),
  startLocation: z.string().optional(),
  endLocation: z.string().optional(),
  durationDays: z.coerce.number().int().min(0),
  durationNights: z.coerce.number().int().min(0),
  difficulty: z.enum(["easy", "moderate", "challenging", "expert"]).default("easy"),
  groupSize: z.string().optional(),
  vehicle: z.string().optional(),
  suitableFor: z.string().optional(),
  warnings: z.array(z.string()).default([]),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().int().min(0).default(0),
  fromPrice: z.coerce.number().int().min(0).default(0),
  heroImageKey: z.string().optional().nullable(),
  highlights: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  accommodation: z.string().optional(),
  transportation: z.string().optional(),
  meals: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).default([]),
  faqs: z.array(faqSchema).default([]),
  bookingMode: z.enum(["scheduled", "flexible"]).default("flexible"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  variants: z.array(tourVariantSchema).default([]),
  addOns: z.array(tourAddOnSchema).default([]),
  images: z.array(tourImageSchema).default([]),
});

export type TourInput = z.infer<typeof tourInputSchema>;
