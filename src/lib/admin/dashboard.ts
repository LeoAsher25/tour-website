import "server-only";

import { cache } from "react";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * Dashboard stats — single aggregate query (server-side).
 * Wrapped in React `cache()` so multiple admin components within one request
 * share the result instead of hitting the DB repeatedly.
 */
export const getDashboardStats = cache(async () => {
  const rows = await db.execute(sql`
    select
      (select count(*)::int from tours) as tours,
      (select count(*)::int from blogs) as blogs,
      (select count(*)::int from bookings) as bookings,
      (select count(*)::int from departures) as departures,
      coalesce((select sum(total_amount) from bookings where booking_status = 'confirmed'), 0)::bigint as confirmed_revenue,
      coalesce((select sum(amount) from payments where status = 'paid'), 0)::bigint as paid_amount
  `);

  const r = rows[0] as unknown as {
    tours: number;
    blogs: number;
    bookings: number;
    departures: number;
    confirmed_revenue: number;
    paid_amount: number;
  };

  return {
    tours: r.tours ?? 0,
    blogs: r.blogs ?? 0,
    bookings: r.bookings ?? 0,
    departures: r.departures ?? 0,
    confirmedRevenue: Number(r.confirmed_revenue ?? 0),
    paidAmount: Number(r.paid_amount ?? 0),
  };
});
