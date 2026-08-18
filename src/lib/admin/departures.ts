"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { departures } from "@/lib/db/schema";

/** Create a departure (or update existing for same tour+date). */
export async function createDeparture(input: {
  tourId: string;
  date: string;
  capacity: number;
  notes?: string;
}) {
  await db
    .insert(departures)
    .values({
      tourId: input.tourId,
      date: input.date,
      capacity: input.capacity,
      booked: 0,
      status: "open",
      notes: input.notes ?? null,
    })
    .onConflictDoUpdate({
      target: [departures.tourId, departures.date],
      set: { capacity: input.capacity, status: "open", notes: input.notes ?? null },
    });
  revalidatePath("/admin/departures");
  revalidatePath("/tours/[slug]", "page");
}

/** Bulk create departures for a range of dates. */
export async function bulkCreateDepartures(input: {
  tourId: string;
  dates: string[];
  capacity: number;
}) {
  if (input.dates.length === 0) return;
  await db
    .insert(departures)
    .values(
      input.dates.map((date) => ({
        tourId: input.tourId,
        date,
        capacity: input.capacity,
        booked: 0,
        status: "open" as const,
      }))
    )
    .onConflictDoNothing({ target: [departures.tourId, departures.date] });
  revalidatePath("/admin/departures");
  revalidatePath("/tours/[slug]", "page");
}

export async function setDepartureStatus(
  id: string,
  status: "open" | "closed" | "cancelled"
) {
  await db
    .update(departures)
    .set({ status, updatedAt: new Date() })
    .where(eq(departures.id, id));
  revalidatePath("/admin/departures");
  revalidatePath("/tours/[slug]", "page");
}

export async function deleteDeparture(id: string) {
  await db.delete(departures).where(eq(departures.id, id));
  revalidatePath("/admin/departures");
  revalidatePath("/tours/[slug]", "page");
}
