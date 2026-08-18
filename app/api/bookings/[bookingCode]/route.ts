import { NextRequest, NextResponse } from "next/server";
import { getBookingByCode } from "@/lib/bookings";

/**
 * GET /api/bookings/[bookingCode]
 * Fetch a booking by its (unguessable) booking code. No auth — the code itself
 * is the capability token; codes are 9 random chars, not sequential IDs.
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/bookings/[bookingCode]">
) {
  const { bookingCode } = await ctx.params;
  const booking = await getBookingByCode(bookingCode.toUpperCase());

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
