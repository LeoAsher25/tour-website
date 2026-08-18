import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, payments, tours, blogs, departures } from "@/lib/db/schema";

/** Dashboard stats — aggregate counts + revenue, all server-side. */
export async function getDashboardStats() {
  const [tourCount, blogCount, bookingCount, departureCount, revenueRow, pendingRow] =
    await Promise.all([
      db.select({ n: sql<number>`count(*)::int` }).from(tours),
      db.select({ n: sql<number>`count(*)::int` }).from(blogs),
      db.select({ n: sql<number>`count(*)::int` }).from(bookings),
      db.select({ n: sql<number>`count(*)::int` }).from(departures),
      db
        .select({
          total: sql<number>`coalesce(sum(total_amount), 0)::bigint`,
        })
        .from(bookings)
        .where(sql`booking_status = 'confirmed'`),
      db
        .select({
          total: sql<number>`coalesce(sum(amount), 0)::bigint`,
        })
        .from(payments)
        .where(sql`status = 'paid'`),
    ]);

  return {
    tours: tourCount[0]?.n ?? 0,
    blogs: blogCount[0]?.n ?? 0,
    bookings: bookingCount[0]?.n ?? 0,
    departures: departureCount[0]?.n ?? 0,
    confirmedRevenue: revenueRow[0]?.total ?? 0,
    paidAmount: pendingRow[0]?.total ?? 0,
  };
}
