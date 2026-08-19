import { NextRequest, NextResponse } from "next/server";
import { createBooking, BookingError } from "@/lib/bookings";
import type { BookingCustomer, PaymentMethod } from "@/types/domain";

/**
 * POST /api/bookings
 * Create a pending booking. The client sends selection + customer info only —
 * the server derives the authoritative price and reserves departure capacity.
 *
 * Body:
 * {
 *   tourId, variantId, startDate, guestCount,
 *   addOnIds?, promoCode?, paymentPlan?, payByCard?,
 *   customer: { fullName, phone, email?, zaloPhone?, nationality?, note? },
 *   paymentMethod: "vnpay" | "zalo/manual"
 * }
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const customer = body.customer as BookingCustomer | undefined;
  const paymentMethod = body.paymentMethod as PaymentMethod | undefined;

  if (!customer || typeof customer !== "object") {
    return NextResponse.json(
      { error: "Customer information is required" },
      { status: 400 }
    );
  }
  if (paymentMethod !== "vnpay" && paymentMethod !== "zalo/manual") {
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  }

  try {
    const { booking, price } = await createBooking({
      tourId: String(body.tourId ?? ""),
      variantId: String(body.variantId ?? ""),
      startDate: String(body.startDate ?? ""),
      guestCount: Number(body.guestCount ?? 0),
      addOnIds: Array.isArray(body.addOnIds)
        ? body.addOnIds.map(String)
        : [],
      promoCode: body.promoCode ? String(body.promoCode) : undefined,
      paymentPlan: body.paymentPlan === "deposit" ? "deposit" : "full",
      payByCard: Boolean(body.payByCard),
      customer,
      paymentMethod,
    });

    return NextResponse.json(
      { booking, price, paymentUrl: null },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof BookingError) {
      const status =
        err.code === "INVALID_CUSTOMER" ||
        err.code === "INVALID_DATE" ||
        err.code === "INVALID_GUESTS" ||
        err.code === "INVALID_VARIANT" ||
        err.code === "INVALID_TOUR"
          ? 400
          : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[bookings] create failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
