import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import {
  departures,
  destinations,
  tourAddons,
  tourImages,
  tours,
  tourVariants,
} from "@/lib/db/schema";
import { mapTour, type TourWithChildren } from "@/lib/db/mappers";
import { keyFromPublicUrl } from "@/lib/storage/media";
import {
  collectTourKeys,
  removeOrphanedKeys,
} from "@/lib/storage/media-keys";
import type { Tour } from "@/types/domain";
import {
  tourInputSchema,
  type TourInput,
} from "./tour-schema";

/**
 * Admin tour repository + actions (server-only).
 * All admin mutations revalidate public tour paths so static pages refresh.
 */

export { tourInputSchema };
export type { TourInput };

export class TourAdminRepository {
  async listAll(): Promise<Tour[]> {
    const rows = await db.select().from(tours).orderBy(desc(tours.updatedAt));
    return (await this.loadChildren(rows)).map(mapTour);
  }

  /** Lightweight id+title list for dropdowns (no child rows). */
  async listLight(): Promise<{ id: string; title: string; slug: string }[]> {
    const rows = await db
      .select({ id: tours.id, title: tours.title, slug: tours.slug })
      .from(tours)
      .orderBy(asc(tours.title));
    return rows;
  }

  async getById(id: string): Promise<Tour | null> {
    const rows = await db
      .select()
      .from(tours)
      .where(eq(tours.id, id))
      .limit(1);
    if (rows.length === 0) return null;
    return mapTour((await this.loadChildren([rows[0]]))[0]);
  }

  async listDestinations() {
    return db.select().from(destinations).orderBy(desc(destinations.name));
  }

  async create(input: TourInput, id?: string): Promise<Tour> {
    const tourId = id ?? `tour-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const norm = normalizeInput(input);

    await db
      .insert(tours)
      .values({
        id: tourId,
        slug: norm.slug,
        title: norm.title,
        subtitle: norm.subtitle ?? null,
        description: norm.description ?? null,
        overview: norm.overview ?? null,
        destinationId: norm.destinationId,
        startLocation: norm.startLocation ?? null,
        endLocation: norm.endLocation ?? null,
        durationDays: norm.durationDays,
        durationNights: norm.durationNights,
        difficulty: norm.difficulty,
        groupSize: norm.groupSize ?? null,
        vehicle: norm.vehicle ?? null,
        suitableFor: norm.suitableFor ?? null,
        warnings: norm.warnings,
        rating: norm.rating,
        reviewCount: norm.reviewCount,
        fromPrice: norm.fromPrice,
        heroImageKey: norm.heroImageKey ?? null,
        highlights: norm.highlights,
        included: norm.included,
        excluded: norm.excluded,
        accommodation: norm.accommodation ?? null,
        transportation: norm.transportation ?? null,
        meals: norm.meals ?? null,
        itinerary: norm.itinerary as typeof tours.$inferInsert["itinerary"],
        faqs: norm.faqs as typeof tours.$inferInsert["faqs"],
        bookingMode: norm.bookingMode,
        status: norm.status,
        featured: norm.featured,
        seoTitle: norm.seoTitle ?? null,
        seoDescription: norm.seoDescription ?? null,
        createdAt: now,
        updatedAt: now,
      });

    await this.replaceChildren(tourId, norm);
    this.revalidate();
    return (await this.getById(tourId))!;
  }

  async update(id: string, input: TourInput): Promise<Tour> {
    const norm = normalizeInput(input);
    // Collect keys in use BEFORE updating (hero may change).
    const before = await collectTourKeys(id);
    await db
      .update(tours)
      .set({
        slug: norm.slug,
        title: norm.title,
        subtitle: norm.subtitle ?? null,
        description: norm.description ?? null,
        overview: norm.overview ?? null,
        destinationId: norm.destinationId,
        startLocation: norm.startLocation ?? null,
        endLocation: norm.endLocation ?? null,
        durationDays: norm.durationDays,
        durationNights: norm.durationNights,
        difficulty: norm.difficulty,
        groupSize: norm.groupSize ?? null,
        vehicle: norm.vehicle ?? null,
        suitableFor: norm.suitableFor ?? null,
        warnings: norm.warnings,
        rating: norm.rating,
        reviewCount: norm.reviewCount,
        fromPrice: norm.fromPrice,
        heroImageKey: norm.heroImageKey ?? null,
        highlights: norm.highlights,
        included: norm.included,
        excluded: norm.excluded,
        accommodation: norm.accommodation ?? null,
        transportation: norm.transportation ?? null,
        meals: norm.meals ?? null,
        itinerary: norm.itinerary as typeof tours.$inferInsert["itinerary"],
        faqs: norm.faqs as typeof tours.$inferInsert["faqs"],
        bookingMode: norm.bookingMode,
        status: norm.status,
        featured: norm.featured,
        seoTitle: norm.seoTitle ?? null,
        seoDescription: norm.seoDescription ?? null,
        updatedAt: new Date(),
      })
      .where(eq(tours.id, id));

    // replaceChildren collects keys again — pass the pre-update set so removed
    // files are cleaned after the transaction.
    await this.replaceChildren(id, norm, before);
    this.revalidate();
    return (await this.getById(id))!;
  }

  async setStatus(id: string, status: "draft" | "published" | "archived") {
    await db
      .update(tours)
      .set({ status, updatedAt: new Date() })
      .where(eq(tours.id, id));
    this.revalidate();
  }

  async duplicate(id: string): Promise<Tour | null> {
    const source = await this.getById(id);
    if (!source) return null;
    const dest = await this.listDestinations();
    const destinationId =
      dest.find((d) => d.slug === source.destinationSlug)?.id ?? "";
    const input: TourInput = {
      title: `${source.title} (copy)`,
      slug: `${source.slug}-copy`,
      subtitle: source.subtitle,
      description: source.description,
      overview: source.overview,
      destinationId,
      startLocation: source.startLocation,
      endLocation: source.endLocation,
      durationDays: source.durationDays,
      durationNights: source.durationNights,
      difficulty: source.difficulty,
      groupSize: source.groupSize,
      vehicle: source.vehicle,
      suitableFor: source.suitableFor,
      warnings: source.warnings ?? [],
      rating: source.rating,
      reviewCount: source.reviewCount,
      fromPrice: source.fromPrice,
      highlights: source.highlights ?? [],
      included: source.included ?? [],
      excluded: source.excluded ?? [],
      accommodation: source.accommodation,
      transportation: source.transportation,
      meals: source.meals,
      itinerary: source.itinerary,
      faqs: source.faqs ?? [],
      bookingMode: source.bookingMode ?? "flexible",
      status: "draft",
      featured: false,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      variants: source.variants,
      addOns: source.addOns,
      images: source.images.map((img) => ({
        storageKey: keyFromPublicUrl(img.url) ?? "",
        alt: img.alt,
      })),
    };
    return this.create(input, `tour-${crypto.randomUUID().slice(0, 8)}`);
  }

  async delete(id: string) {
    const keys = await collectTourKeys(id);
    await db.delete(tours).where(eq(tours.id, id));
    // Remove objects no longer referenced (e.g. a key shared with a blog stays).
    await removeOrphanedKeys(keys);
    this.revalidate();
  }

  private async replaceChildren(
    tourId: string,
    input: TourInput,
    beforeKeys?: string[]
  ) {
    // Collect keys in use BEFORE replacing so we can clean up removed files.
    const before = beforeKeys ?? (await collectTourKeys(tourId));

    await db.transaction(async (tx) => {
      await tx.delete(tourVariants).where(eq(tourVariants.tourId, tourId));
      await tx.delete(tourAddons).where(eq(tourAddons.tourId, tourId));
      await tx.delete(tourImages).where(eq(tourImages.tourId, tourId));

      if (input.variants?.length) {
        await tx.insert(tourVariants).values(
          input.variants.map((v, i) => ({
            id: v.id || `v-${crypto.randomUUID().slice(0, 6)}`,
            tourId,
            name: v.name,
            description: v.description ?? null,
            priceType: v.priceType,
            basePrice: v.basePrice,
            attrs: (v.attrs ?? null) as Record<string, string> | null,
            maxGroupSize: v.maxGroupSize ?? null,
            position: i,
          }))
        );
      }
      if (input.addOns?.length) {
        await tx.insert(tourAddons).values(
          input.addOns.map((a, i) => ({
            id: a.id || `a-${crypto.randomUUID().slice(0, 6)}`,
            tourId,
            name: a.name,
            description: a.description ?? null,
            price: a.price,
            perPerson: a.perPerson,
            position: i,
          }))
        );
      }
      if (input.images?.length) {
        await tx.insert(tourImages).values(
          input.images.map((img, i) => ({
            id: img.id || `ti-${crypto.randomUUID().slice(0, 6)}`,
            tourId,
            storageKey: img.storageKey,
            alt: img.alt ?? null,
            position: i,
          }))
        );
      }
    });

    // Keys removed from the gallery → delete objects if nothing else uses them.
    const after = [
      input.heroImageKey,
      ...(input.images ?? []).map((img) => img.storageKey),
    ].filter((k): k is string => Boolean(k));
    const removed = before.filter((k) => !after.includes(k));
    await removeOrphanedKeys(removed);
  }

  private revalidate() {
    revalidateTag("public-tours", "max");
    revalidatePath("/tours/[slug]", "page");
    revalidatePath("/", "page");
    revalidatePath("/admin/tours", "page");
  }

  private async loadChildren(
    tourRows: (typeof tours.$inferSelect)[]
  ): Promise<TourWithChildren[]> {
    if (tourRows.length === 0) return [];
    const ids = tourRows.map((t) => t.id);
    const [variants, addOns, images, deps, destRows] = await Promise.all([
      db.select().from(tourVariants).where(inArray(tourVariants.tourId, ids)),
      db.select().from(tourAddons).where(inArray(tourAddons.tourId, ids)),
      db.select().from(tourImages).where(inArray(tourImages.tourId, ids)),
      db.select().from(departures).where(inArray(departures.tourId, ids)),
      db.select().from(destinations).where(inArray(destinations.id, [...new Set(tourRows.map((t) => t.destinationId))])),
    ]);
    const destMap = new Map(destRows.map((d) => [d.id, d]));
    return tourRows.map((tour) => ({
      tour,
      variants: variants.filter((v) => v.tourId === tour.id),
      addOns: addOns.filter((a) => a.tourId === tour.id),
      images: images.filter((i) => i.tourId === tour.id),
      departures: deps.filter((d) => d.tourId === tour.id),
      destination: destMap.get(tour.destinationId),
    }));
  }
}

/** Assign stable IDs to itinerary days/stops and FAQs that lack them. */
function normalizeInput(input: TourInput): TourInput {
  return {
    ...input,
    itinerary: input.itinerary.map((day) => ({
      ...day,
      id: day.id ?? `d-${crypto.randomUUID().slice(0, 6)}`,
      stops: (day.stops ?? []).map((stop) => ({
        ...stop,
        id: stop.id ?? `s-${crypto.randomUUID().slice(0, 6)}`,
      })),
    })),
    faqs: input.faqs.map((f) => ({
      ...f,
      id: f.id ?? `f-${crypto.randomUUID().slice(0, 6)}`,
    })),
  };
}
