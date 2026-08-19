import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  departures,
  destinations,
  tourAddons,
  tourImages,
  tours,
  tourVariants,
} from "@/lib/db/schema";
import { mapDestination, mapTour, type TourWithChildren } from "@/lib/db/mappers";
import { publicUrlFor } from "@/lib/storage/media";
import type {
  Destination,
  HomepageTour,
  HomepageTourSectionData,
  Tour,
} from "@/types/domain";

/**
 * Postgres-backed tour repository (server-only).
 * Reads tour + variants + add-ons + images + departures + destination in one
 * query set, then maps to the domain Tour shape.
 */

async function loadTourChildren(
  tourRows: (typeof tours.$inferSelect)[]
): Promise<TourWithChildren[]> {
  if (tourRows.length === 0) return [];

  const ids = tourRows.map((t) => t.id);

  const [variants, addOns, images, deps, destRows] = await Promise.all([
    db
      .select({
        id: tourVariants.id,
        tourId: tourVariants.tourId,
        name: tourVariants.name,
        description: tourVariants.description,
        priceType: tourVariants.priceType,
        basePrice: tourVariants.basePrice,
        attrs: tourVariants.attrs,
        maxGroupSize: tourVariants.maxGroupSize,
        position: tourVariants.position,
      })
      .from(tourVariants)
      .where(inArray(tourVariants.tourId, ids))
      .orderBy(tourVariants.position),
    db
      .select({
        id: tourAddons.id,
        tourId: tourAddons.tourId,
        name: tourAddons.name,
        description: tourAddons.description,
        price: tourAddons.price,
        perPerson: tourAddons.perPerson,
        position: tourAddons.position,
      })
      .from(tourAddons)
      .where(inArray(tourAddons.tourId, ids))
      .orderBy(tourAddons.position),
    db
      .select({
        id: tourImages.id,
        tourId: tourImages.tourId,
        storageKey: tourImages.storageKey,
        alt: tourImages.alt,
        position: tourImages.position,
      })
      .from(tourImages)
      .where(inArray(tourImages.tourId, ids))
      .orderBy(tourImages.position),
    db
      .select({
        id: departures.id,
        tourId: departures.tourId,
        date: departures.date,
        capacity: departures.capacity,
        booked: departures.booked,
      })
      .from(departures)
      .where(inArray(departures.tourId, ids)),
    db
      .select({
        id: destinations.id,
        slug: destinations.slug,
        name: destinations.name,
        tagline: destinations.tagline,
        description: destinations.description,
        heroImageKey: destinations.heroImageKey,
      })
      .from(destinations)
      .where(
        inArray(
          destinations.id,
          [...new Set(tourRows.map((t) => t.destinationId))]
        )
      ),
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

export class TourRepository {
  /** Published tours only (public site). */
  async listHomepage(): Promise<HomepageTourSectionData> {
    const rows = await db
      .select({
        id: tours.id,
        slug: tours.slug,
        title: tours.title,
        subtitle: tours.subtitle,
        description: tours.description,
        durationDays: tours.durationDays,
        durationNights: tours.durationNights,
        fromPrice: tours.fromPrice,
        heroImageKey: tours.heroImageKey,
        rating: tours.rating,
        featured: tours.featured,
        destinationId: tours.destinationId,
      })
      .from(tours)
      .where(eq(tours.status, "published"))
      .orderBy(asc(tours.createdAt));

    const destRows = await db
      .select({ id: destinations.id, slug: destinations.slug, name: destinations.name })
      .from(destinations)
      .where(
        inArray(
          destinations.id,
          [...new Set(rows.map((t) => t.destinationId))]
        )
      );
    const destMap = new Map(destRows.map((d) => [d.id, d]));

    const ids = rows.map((t) => t.id);
    const [variantRows, addOnRows] = await Promise.all([
      ids.length
        ? db
            .select({
              id: tourVariants.id,
              tourId: tourVariants.tourId,
              name: tourVariants.name,
              description: tourVariants.description,
              priceType: tourVariants.priceType,
              basePrice: tourVariants.basePrice,
              attrs: tourVariants.attrs,
              maxGroupSize: tourVariants.maxGroupSize,
              position: tourVariants.position,
            })
            .from(tourVariants)
            .where(inArray(tourVariants.tourId, ids))
            .orderBy(tourVariants.position)
        : Promise.resolve([]),
      ids.length
        ? db
            .select({
              id: tourAddons.id,
              tourId: tourAddons.tourId,
              name: tourAddons.name,
              description: tourAddons.description,
              price: tourAddons.price,
              perPerson: tourAddons.perPerson,
              position: tourAddons.position,
            })
            .from(tourAddons)
            .where(inArray(tourAddons.tourId, ids))
            .orderBy(tourAddons.position)
        : Promise.resolve([]),
    ]);

    const variantsByTour = new Map<string, typeof variantRows>();
    for (const v of variantRows) {
      const list = variantsByTour.get(v.tourId) ?? [];
      list.push(v);
      variantsByTour.set(v.tourId, list);
    }
    const addOnsByTour = new Map<string, typeof addOnRows>();
    for (const a of addOnRows) {
      const list = addOnsByTour.get(a.tourId) ?? [];
      list.push(a);
      addOnsByTour.set(a.tourId, list);
    }

    const all: HomepageTourSectionData["booking"] = rows.map((row) => {
      const destination = destMap.get(row.destinationId);
      const base: HomepageTour = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle ?? "",
        description: row.description ?? "",
        durationDays: row.durationDays,
        durationNights: row.durationNights,
        fromPrice: row.fromPrice,
        heroImage: row.heroImageKey ? publicUrlFor(row.heroImageKey) : "",
        rating: row.rating,
        featured: row.featured,
        destination: destination?.name ?? "",
        destinationSlug: destination?.slug ?? "",
      };
      const variants = (variantsByTour.get(row.id) ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description ?? "",
        priceType: v.priceType,
        basePrice: v.basePrice,
        attrs: v.attrs ?? undefined,
        maxGroupSize: v.maxGroupSize ?? undefined,
      }));
      const addOns = (addOnsByTour.get(row.id) ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description ?? "",
        price: a.price,
        perPerson: a.perPerson,
      }));
      return { ...base, variants, addOns };
    });

    return {
      featured: all.filter((t) => t.featured),
      booking: all,
    };
  }

  /** Published tours only (public site). */
  async listPublished(): Promise<Tour[]> {
    const rows = await db
      .select()
      .from(tours)
      .where(eq(tours.status, "published"))
      .orderBy(asc(tours.createdAt));
    const withChildren = await loadTourChildren(rows);
    return withChildren.map(mapTour);
  }

  async listFeatured(): Promise<Tour[]> {
    const rows = await db
      .select()
      .from(tours)
      .where(and(eq(tours.status, "published"), eq(tours.featured, true)))
      .orderBy(asc(tours.createdAt));
    const withChildren = await loadTourChildren(rows);
    return withChildren.map(mapTour);
  }

  async listAll(): Promise<Tour[]> {
    const rows = await db
      .select()
      .from(tours)
      .orderBy(desc(tours.updatedAt));
    const withChildren = await loadTourChildren(rows);
    return withChildren.map(mapTour);
  }

  async getBySlug(slug: string, opts: { publishedOnly?: boolean } = {}): Promise<Tour | null> {
    const { publishedOnly = true } = opts;
    const rows = await db
      .select()
      .from(tours)
      .where(eq(tours.slug, slug))
      .limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    if (publishedOnly && row.status !== "published") return null;
    const [withChildren] = await loadTourChildren([row]);
    return mapTour(withChildren);
  }

  async getById(id: string, opts: { publishedOnly?: boolean } = {}): Promise<Tour | null> {
    const { publishedOnly = true } = opts;
    const rows = await db
      .select()
      .from(tours)
      .where(eq(tours.id, id))
      .limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    if (publishedOnly && row.status !== "published") return null;
    const [withChildren] = await loadTourChildren([row]);
    return mapTour(withChildren);
  }

  async getPricingEntities(
    tourId: string,
    variantId: string,
    addOnIds: string[]
  ): Promise<{ tour: Tour; variant: Tour["variants"][number]; addOns: Tour["addOns"] } | null> {
    const tourRows = await db
      .select()
      .from(tours)
      .where(eq(tours.id, tourId))
      .limit(1);
    const tourRow = tourRows[0];
    if (!tourRow || tourRow.status !== "published") return null;

    const [variantRows, addOnRows] = await Promise.all([
      db
        .select({
          id: tourVariants.id,
          tourId: tourVariants.tourId,
          name: tourVariants.name,
          description: tourVariants.description,
          priceType: tourVariants.priceType,
          basePrice: tourVariants.basePrice,
          attrs: tourVariants.attrs,
          maxGroupSize: tourVariants.maxGroupSize,
          position: tourVariants.position,
        })
        .from(tourVariants)
        .where(and(eq(tourVariants.tourId, tourId), eq(tourVariants.id, variantId)))
        .limit(1),
      addOnIds.length > 0
        ? db
            .select({
              id: tourAddons.id,
              tourId: tourAddons.tourId,
              name: tourAddons.name,
              description: tourAddons.description,
              price: tourAddons.price,
              perPerson: tourAddons.perPerson,
              position: tourAddons.position,
            })
            .from(tourAddons)
            .where(and(eq(tourAddons.tourId, tourId), inArray(tourAddons.id, addOnIds)))
            .orderBy(tourAddons.position)
        : Promise.resolve([]),
    ]);

    const variantRow = variantRows[0];
    if (!variantRow) return null;

    const tour = mapTour({
      tour: tourRow,
      variants: [variantRow],
      addOns: addOnRows,
      images: [],
      departures: [],
      destination: null,
    });

    return {
      tour,
      variant: tour.variants[0],
      addOns: tour.addOns,
    };
  }

  /** Tours in the same destination as `slug`, excluding it, limited by count. */
  async getRelatedBySlug(slug: string, limit = 2): Promise<HomepageTour[]> {
    const sourceRows = await db
      .select({ id: tours.id, destinationId: tours.destinationId })
      .from(tours)
      .where(eq(tours.slug, slug))
      .limit(1);
    const source = sourceRows[0];
    if (!source) return [];

    const rows = await db
      .select({
        id: tours.id,
        slug: tours.slug,
        title: tours.title,
        subtitle: tours.subtitle,
        description: tours.description,
        durationDays: tours.durationDays,
        durationNights: tours.durationNights,
        fromPrice: tours.fromPrice,
        heroImageKey: tours.heroImageKey,
        rating: tours.rating,
        featured: tours.featured,
        destinationId: tours.destinationId,
      })
      .from(tours)
      .where(
        and(
          eq(tours.status, "published"),
          eq(tours.destinationId, source.destinationId),
          sql`${tours.slug} != ${slug}`
        )
      )
      .orderBy(desc(tours.updatedAt))
      .limit(limit);

    const destRows = await db
      .select({ slug: destinations.slug, name: destinations.name })
      .from(destinations)
      .where(
        inArray(
          destinations.id,
          [...new Set(rows.map((t) => t.destinationId))]
        )
      );
    const destMap = new Map(destRows.map((d) => [d.slug, d]));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle ?? "",
      description: row.description ?? "",
      durationDays: row.durationDays,
      durationNights: row.durationNights,
      fromPrice: row.fromPrice,
      heroImage: row.heroImageKey ? publicUrlFor(row.heroImageKey) : "",
      rating: row.rating,
      featured: row.featured,
      destination: destMap.get(row.destinationId)?.name ?? "",
      destinationSlug: destMap.get(row.destinationId)?.slug ?? "",
    }));
  }

  async getByDestination(slug: string): Promise<Tour[]> {
    const destRows = await db
      .select()
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    if (destRows.length === 0) return [];
    const rows = await db
      .select()
      .from(tours)
      .where(
        and(
          eq(tours.status, "published"),
          eq(tours.destinationId, destRows[0].id)
        )
      );
    const withChildren = await loadTourChildren(rows);
    return withChildren.map(mapTour);
  }
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

export class DestinationRepository {
  async list(): Promise<Destination[]> {
    const rows = await db.select().from(destinations).orderBy(asc(destinations.name));
    return rows.map(mapDestination);
  }

  async getBySlug(slug: string): Promise<Destination | null> {
    const rows = await db
      .select()
      .from(destinations)
      .where(eq(destinations.slug, slug))
      .limit(1);
    return rows.length ? mapDestination(rows[0]) : null;
  }

  async getById(id: string): Promise<typeof destinations.$inferSelect | null> {
    const rows = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);
    return rows[0] ?? null;
  }
}

// ---------------------------------------------------------------------------
// Departures (concurrency-safe capacity)
// ---------------------------------------------------------------------------

export interface DepartureWithTour {
  id: string;
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  date: string;
  capacity: number;
  booked: number;
  remaining: number;
  status: "open" | "closed" | "cancelled";
  notes?: string | null;
}

export class DepartureRepository {
  /**
   * Atomically reserve capacity. Returns true when the reservation succeeded
   * (guaranteed not to oversell thanks to the WHERE clause), false when sold
   * out / closed / cancelled. No departure row for (tourId, date) means the
   * tour is flexible — no hard cap, returns true.
   */
  async reserve(
    tourId: string,
    date: string,
    guests: number
  ): Promise<boolean> {
    await db.execute(
      sql`
        update departures
        set booked = booked + ${guests}, updated_at = now()
        where tour_id = ${tourId}
          and date = ${date}
          and status = 'open'
          and (capacity <= 0 or booked + ${guests} <= capacity)
      `
    );
    // No departure row for (tourId, date) → flexible tour, no cap.
    return true;
  }

  /** Remaining seats for a departure date. */
  async checkAvailability(
    tourId: string,
    date: string
  ): Promise<{ capacity: number; booked: number; remaining: number } | null> {
    const rows = await db
      .select()
      .from(departures)
      .where(and(eq(departures.tourId, tourId), eq(departures.date, date)))
      .limit(1);
    if (rows.length === 0) return null;
    const d = rows[0];
    return {
      capacity: d.capacity,
      booked: d.booked,
      remaining: Math.max(0, d.capacity - d.booked),
    };
  }

  async listUpcoming(tourId?: string): Promise<DepartureWithTour[]> {
    const query = db
      .select({
        id: departures.id,
        tourId: departures.tourId,
        tourSlug: tours.slug,
        tourTitle: tours.title,
        date: departures.date,
        capacity: departures.capacity,
        booked: departures.booked,
        status: departures.status,
        notes: departures.notes,
      })
      .from(departures)
      .innerJoin(tours, eq(tours.id, departures.tourId))
      .where(
        and(
          tourId ? eq(departures.tourId, tourId) : undefined,
          sql`${departures.date} >= current_date`
        )
      )
      .orderBy(asc(departures.date));

    const rows = await query;
    return rows.map((r) => ({
      ...r,
      id: String(r.id),
      date: String(r.date),
      remaining: Math.max(0, r.capacity - r.booked),
    }));
  }

  async setStatus(
    id: string,
    status: "open" | "closed" | "cancelled"
  ): Promise<void> {
    await db
      .update(departures)
      .set({ status, updatedAt: new Date() })
      .where(eq(departures.id, id));
  }
}
