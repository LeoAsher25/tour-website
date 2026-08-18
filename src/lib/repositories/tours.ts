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
import type { Destination, Tour } from "@/types/domain";

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
      .select()
      .from(tourVariants)
      .where(inArray(tourVariants.tourId, ids))
      .orderBy(tourVariants.position),
    db
      .select()
      .from(tourAddons)
      .where(inArray(tourAddons.tourId, ids))
      .orderBy(tourAddons.position),
    db
      .select()
      .from(tourImages)
      .where(inArray(tourImages.tourId, ids))
      .orderBy(tourImages.position),
    db.select().from(departures).where(inArray(departures.tourId, ids)),
    db
      .select()
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
