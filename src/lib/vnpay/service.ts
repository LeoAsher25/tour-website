import "server-only";

import { BookingRepository, PaymentRepository } from "@/lib/repositories/bookings";
import {
  createPaymentUrl,
  getVnpayConfig,
  verifyReturn,
  type VerifyResult,
} from "@/lib/vnpay";
import type { Booking, PaymentTransaction } from "@/types/domain";

/**
 * High-level VNPay flow, wired to Postgres bookings/payments.
 * All payment state transitions are idempotent — repeated callbacks (Return
 * URL, IPN) converge on the same result and never double-confirm.
 */

export class VnpayFlowError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_CONFIGURED"
      | "BOOKING_NOT_FOUND"
      | "BOOKING_NOT_PAYABLE"
      | "INVALID_SIGNATURE"
      | "AMOUNT_MISMATCH"
      | "NOT_APPLICABLE"
  ) {
    super(message);
    this.name = "VnpayFlowError";
  }
}

export function isVnpayConfigured(): boolean {
  return Boolean(
    process.env.VNPAY_TMN_CODE &&
      process.env.VNPAY_HASH_SECRET &&
      process.env.VNPAY_PAY_URL &&
      process.env.VNPAY_RETURN_URL
  );
}

/** Injectable data store (tests substitute an in-memory fake). */
export interface VnpayStore {
  getBooking(bookingCode: string): Promise<Booking | null>;
  getTransaction(txnRef: string): Promise<PaymentTransaction | null>;
  saveTransaction(txn: Partial<PaymentTransaction> & { txnRef: string }): Promise<void>;
  updateBooking(bookingCode: string, patch: Partial<Booking>): Promise<void>;
  updateBookingPayment(
    bookingCode: string,
    patch: Partial<Booking["payment"]>
  ): Promise<void>;
}

class PostgresVnpayStore implements VnpayStore {
  private bookings = new BookingRepository();
  private payments = new PaymentRepository();

  getBooking(bookingCode: string): Promise<Booking | null> {
    return this.bookings.getByCode(bookingCode);
  }
  getTransaction(txnRef: string): Promise<PaymentTransaction | null> {
    return this.payments.getTransaction(txnRef);
  }
  saveTransaction(
    txn: Partial<PaymentTransaction> & { txnRef: string }
  ): Promise<void> {
    return this.payments.saveTransaction(txn);
  }
  updateBooking(
    bookingCode: string,
    patch: Partial<Booking>
  ): Promise<void> {
    return this.bookings.updateBooking(bookingCode, patch);
  }
  updateBookingPayment(
    bookingCode: string,
    patch: Partial<Booking["payment"]>
  ): Promise<void> {
    return this.bookings.updateBookingPayment(bookingCode, patch);
  }
}

const defaultStore: VnpayStore = new PostgresVnpayStore();

/**
 * Create the VNPay payment URL for a pending booking.
 * `txnRef` is unique per attempt (bookingCode + attempt counter) so a user can
 * retry payment without clashing with a previous attempt.
 */
export async function createVnpayPaymentUrl(
  params: {
    bookingCode: string;
    ipAddr: string;
    locale?: "vn" | "en";
  },
  store: VnpayStore = defaultStore
): Promise<{ url: string; txnRef: string }> {
  if (!isVnpayConfigured()) {
    throw new VnpayFlowError("VNPay is not configured", "NOT_CONFIGURED");
  }
  const config = getVnpayConfig();
  const booking = await store.getBooking(params.bookingCode);
  if (!booking) {
    throw new VnpayFlowError("Booking not found", "BOOKING_NOT_FOUND");
  }
  if (booking.bookingStatus === "cancelled") {
    throw new VnpayFlowError("Booking is cancelled", "BOOKING_NOT_PAYABLE");
  }
  if (booking.payment.status === "paid") {
    throw new VnpayFlowError("Booking is already paid", "BOOKING_NOT_PAYABLE");
  }

  // Unique transaction ref per attempt: <code>-<attempt>
  const attempt = (booking.payment.vnpayTxnRef?.split("-").pop() ??
    "0") as string;
  const nextAttempt = Number.isFinite(Number(attempt)) ? Number(attempt) + 1 : 1;
  const txnRef = `${params.bookingCode}-${nextAttempt}`;

  const amount = booking.amountToPayNow;
  // VNPay rejects special characters in vnp_OrderInfo (docs: no diacritics, no
  // special chars). Keep letters, digits, spaces and hyphens; drop the rest.
  const rawOrderInfo = `Thanh toan don ${params.bookingCode} - ${booking.tourTitle} (${booking.variant})`;
  const orderInfo = rawOrderInfo.replace(/[^A-Za-z0-9 _-]/g, "");

  const url = createPaymentUrl(
    {
      amount,
      orderId: txnRef,
      orderInfo,
      ipAddr: params.ipAddr,
      locale: params.locale ?? "vn",
    },
    config
  );

  // Record the pending attempt for audit + idempotency.
  const now = new Date().toISOString();
  await store.saveTransaction({
    bookingCode: params.bookingCode,
    txnRef,
    amount,
    method: "vnpay",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
  await store.updateBookingPayment(params.bookingCode, {
    vnpayTxnRef: txnRef,
    status: "processing",
  });

  return { url, txnRef };
}

/**
 * Handle a VNPay callback (Return URL or IPN). Returns a normalized outcome.
 * Idempotent: if the payment is already confirmed/paid, it returns the same
 * outcome without re-writing.
 */
export async function handleVnpayCallback(
  params: {
    query: Record<string, string>;
    ipn?: boolean;
  },
  store: VnpayStore = defaultStore
): Promise<{
  valid: boolean;
  txnRef: string;
  bookingCode: string;
  isSuccess: boolean;
  responseCode: string;
  transactionStatus: string;
  booking: Booking | null;
}> {
  const config = getVnpayConfig();
  const result = verifyReturn(params.query, config);

  const txnRef = result.txnRef;
  const bookingCode = txnRef.split("-").slice(0, -1).join("-");

  if (!result.valid) {
    return {
      valid: false,
      txnRef,
      bookingCode,
      isSuccess: false,
      responseCode: result.responseCode,
      transactionStatus: result.transactionStatus,
      booking: null,
    };
  }

  const booking = await store.getBooking(bookingCode);
  if (!booking) {
    return {
      valid: true,
      txnRef,
      bookingCode,
      isSuccess: false,
      responseCode: result.responseCode,
      transactionStatus: result.transactionStatus,
      booking: null,
    };
  }

  // Amount must match the authoritative total exactly.
  if (result.amountVnd !== booking.amountToPayNow) {
    return {
      valid: true,
      txnRef,
      bookingCode,
      isSuccess: false,
      responseCode: result.responseCode,
      transactionStatus: result.transactionStatus,
      booking,
    };
  }

  // Idempotency: if already paid, stay paid.
  if (booking.payment.status === "paid") {
    return {
      valid: true,
      txnRef,
      bookingCode,
      isSuccess: true,
      responseCode: "00",
      transactionStatus: "00",
      booking,
    };
  }

  const isSuccess = result.isSuccess;

  // Record the transaction outcome (audit trail).
  const existing = await store.getTransaction(txnRef);
  const now = new Date().toISOString();
  await store.saveTransaction({
    bookingCode,
    txnRef,
    amount: result.amountVnd,
    method: "vnpay",
    status: isSuccess ? "paid" : "failed",
    vnpayResponseCode: result.responseCode,
    vnpayTransactionStatus: result.transactionStatus,
    vnpayTransactionNo: params.query.vnp_TransactionNo,
    raw: params.query,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  if (isSuccess) {
    await store.updateBookingPayment(bookingCode, {
      status: "paid",
      paidAt: now,
      vnpayResponseCode: result.responseCode,
      vnpayTransactionStatus: result.transactionStatus,
      vnpayTransactionNo: params.query.vnp_TransactionNo,
    });
    await store.updateBooking(bookingCode, {
      bookingStatus: "confirmed",
    });
  } else if (params.ipn) {
    // IPN authoritative failure — mark failed (Return URL may have been the
    // first to record it; this just converges).
    await store.updateBookingPayment(bookingCode, {
      status: "failed",
      vnpayResponseCode: result.responseCode,
      vnpayTransactionStatus: result.transactionStatus,
    });
  }

  const updated = await store.getBooking(bookingCode);
  return {
    valid: true,
    txnRef,
    bookingCode,
    isSuccess,
    responseCode: result.responseCode,
    transactionStatus: result.transactionStatus,
    booking: updated,
  };
}

export type { VerifyResult };
