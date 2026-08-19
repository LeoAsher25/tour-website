import { NextRequest, NextResponse } from "next/server";
import { handleVnpayCallback } from "@/lib/vnpay/service";

/**
 * GET /api/payments/vnpay/return
 * VNPay redirects the user's browser here after payment.
 * This is UX-only — the authoritative update is the IPN. We still verify the
 * signature and update status idempotently, then send the user to the result
 * page. Never trust this alone to mark a booking paid.
 */
export async function GET(request: NextRequest) {
  const query: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const result = await handleVnpayCallback({ query, ipn: false });

  if (!result.valid) {
    return NextResponse.redirect(
      new URL("/booking/failed?reason=invalid_signature", request.url)
    );
  }

  if (!result.booking) {
    return NextResponse.redirect(
      new URL("/booking/failed?reason=not_found", request.url)
    );
  }

  if (result.isSuccess) {
    return NextResponse.redirect(
      new URL(`/booking/success?code=${result.bookingCode}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL(
      `/booking/failed?code=${result.bookingCode}&reason=${result.responseCode || "cancelled"}`,
      request.url
    )
  );
}
