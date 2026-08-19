import { NextRequest, NextResponse } from "next/server";
import { createVnpayPaymentUrl, VnpayFlowError } from "@/lib/vnpay/service";

/**
 * POST /api/payments/vnpay/create
 * Create a VNPay payment URL for an existing pending booking.
 *
 * Body: { bookingCode, locale? }
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bookingCode = String(body.bookingCode ?? "");
  if (!bookingCode) {
    return NextResponse.json(
      { error: "bookingCode is required" },
      { status: 400 }
    );
  }

  const ipAddr =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  try {
    const { url, txnRef } = await createVnpayPaymentUrl({
      bookingCode,
      ipAddr,
      locale: body.locale === "en" ? "en" : "vn",
    });
    return NextResponse.json({ url, txnRef });
  } catch (err) {
    if (err instanceof VnpayFlowError) {
      const status =
        err.code === "NOT_CONFIGURED"
          ? 503
          : err.code === "BOOKING_NOT_FOUND"
            ? 404
            : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[vnpay] create failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
