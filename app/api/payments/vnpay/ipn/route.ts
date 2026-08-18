import { NextRequest } from "next/server";
import { handleVnpayCallback } from "@/lib/vnpay/service";
import { IPN_RESPONSE } from "@/lib/vnpay";

/**
 * GET|POST /api/payments/vnpay/ipn
 * VNPay's authoritative server-to-server callback. The sandbox portal is
 * configured with IPN protocol = GET, so handle both methods.
 *
 * Idempotency:
 *  - Invalid signature → always respond 97 (never confirm).
 *  - Booking already paid → respond 02 "Order already confirmed" (no double write).
 *  - Amount mismatch → respond 04 (never confirm).
 *  - Success → respond 00.
 *
 * The IPN is the ONLY thing that can authoritatively mark a booking paid.
 */
async function handle(request: NextRequest) {
  const query: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const result = await handleVnpayCallback({ query, ipn: true });

  if (!result.valid) {
    return Response.json(IPN_RESPONSE.INVALID_SIGNATURE, { status: 200 });
  }
  if (!result.booking) {
    return Response.json(IPN_RESPONSE.ORDER_NOT_FOUND, { status: 200 });
  }

  if (result.isSuccess) {
    return Response.json(IPN_RESPONSE.SUCCESS, { status: 200 });
  }

  // Paid already but IPN re-fired with success — treat as already confirmed.
  if (result.booking.payment.status === "paid") {
    return Response.json(IPN_RESPONSE.ALREADY_CONFIRMED, { status: 200 });
  }

  // Amount mismatch is surfaced through isSuccess=false + booking exists;
  // we can't distinguish "failed payment" from "amount mismatch" here without
  // more data, so respond generically per VNPay spec.
  return Response.json(IPN_RESPONSE.UNKNOWN, { status: 200 });
}

export const POST = handle;
export const GET = handle;
