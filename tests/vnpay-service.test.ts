import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import {
  handleVnpayCallback,
  createVnpayPaymentUrl,
  type VnpayStore,
} from "@/lib/vnpay/service";
import type { VnpayConfig } from "@/lib/vnpay";
import type { Booking, PaymentTransaction } from "@/types/domain";

const config: VnpayConfig = {
  tmnCode: "TESTTMN",
  hashSecret: "test-hash-secret-123456",
  payUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: "http://localhost:3000/api/payments/vnpay/return",
};

// Set env so getVnpayConfig() works inside the service.
process.env.VNPAY_TMN_CODE = config.tmnCode;
process.env.VNPAY_HASH_SECRET = config.hashSecret;
process.env.VNPAY_PAY_URL = config.payUrl;
process.env.VNPAY_RETURN_URL = config.returnUrl;

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    bookingCode: "JAS-ABC123",
    tourId: "tour-1",
    tourSlug: "ha-giang-loop-3d2n",
    tourTitle: "3 Days 2 Nights Motorbike",
    variant: "Self-Riding",
    variantId: "v1-self",
    departureDate: "2026-09-12",
    guestCount: 2,
    addOns: [],
    customer: { fullName: "Test Rider", phone: "+84912345678" },
    unitPrice: 3_408_000,
    subtotal: 6_816_000,
    discount: 0,
    vat: 545_280,
    cardFee: 0,
    totalAmount: 7_361_280,
    amountToPayNow: 7_361_280,
    currency: "VND",
    paymentPlan: "full",
    bookingStatus: "pending",
    payment: { method: "vnpay", status: "pending" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Sign a VNPay-style query (sorted, URL-encoded) like the real gateway. */
function signQuery(query: Record<string, string>): string {
  const sorted = Object.keys(query)
    .filter((k) => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
    .filter((k) => query[k] !== "")
    .sort();
  const usp = new URLSearchParams();
  for (const k of sorted) usp.append(k, query[k]);
  return crypto
    .createHmac("sha512", config.hashSecret)
    .update(Buffer.from(usp.toString(), "utf-8"))
    .digest("hex");
}

function buildIpnQuery(overrides: Record<string, string> = {}) {
  const base: Record<string, string> = {
    vnp_Amount: "736128000", // totalAmount ×100
    vnp_BankCode: "NCB",
    vnp_OrderInfo: "Thanh toan don JAS-ABC123",
    vnp_ResponseCode: "00",
    vnp_TmnCode: config.tmnCode,
    vnp_TransactionNo: "987654321",
    vnp_TransactionStatus: "00",
    vnp_TxnRef: "JAS-ABC123-1",
    vnp_Version: "2.1.0",
  };
  const query = { ...base, ...overrides };
  query.vnp_SecureHash = signQuery(query);
  return query;
}

class FakeStore implements VnpayStore {
  bookings = new Map<string, Booking>();
  transactions = new Map<string, PaymentTransaction>();

  async getBooking(code: string) {
    return this.bookings.get(code) ?? null;
  }
  async getTransaction(txnRef: string) {
    return this.transactions.get(txnRef) ?? null;
  }
  async saveTransaction(txn: Partial<PaymentTransaction> & { txnRef: string }) {
    const prev = this.transactions.get(txn.txnRef) ?? {};
    this.transactions.set(txn.txnRef, { ...prev, ...txn } as PaymentTransaction);
  }
  async updateBooking(code: string, patch: Partial<Booking>) {
    const b = this.bookings.get(code);
    if (b) this.bookings.set(code, { ...b, ...patch });
  }
  async updateBookingPayment(code: string, patch: Partial<Booking["payment"]>) {
    const b = this.bookings.get(code);
    if (b) {
      this.bookings.set(code, {
        ...b,
        payment: { ...b.payment, ...patch } as Booking["payment"],
      });
    }
  }
}

let store: FakeStore;

beforeEach(() => {
  store = new FakeStore();
});

describe("vnpay service — create payment URL", () => {
  it("creates a URL with a unique txnRef per attempt", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const first = await createVnpayPaymentUrl(
      { bookingCode: "JAS-ABC123", ipAddr: "127.0.0.1" },
      store
    );
    assert.match(first.url, /^https:\/\/sandbox\.vnpayment\.vn/);
    assert.equal(first.txnRef, "JAS-ABC123-1");

    // Booking now has vnpayTxnRef = -1 → next attempt is -2
    const second = await createVnpayPaymentUrl(
      { bookingCode: "JAS-ABC123", ipAddr: "127.0.0.1" },
      store
    );
    assert.equal(second.txnRef, "JAS-ABC123-2");
  });

  it("refuses to create a URL for an already-paid booking", async () => {
    store.bookings.set(
      "JAS-ABC123",
      makeBooking({ payment: { method: "vnpay", status: "paid" } })
    );
    await assert.rejects(
      () => createVnpayPaymentUrl({ bookingCode: "JAS-ABC123", ipAddr: "1.2.3.4" }, store),
      /already paid/
    );
  });

  it("refuses when booking is not found", async () => {
    await assert.rejects(
      () => createVnpayPaymentUrl({ bookingCode: "JAS-NOPE", ipAddr: "1.2.3.4" }, store),
      /Booking not found/
    );
  });
});

describe("vnpay service — IPN/Return callback", () => {
  it("marks a pending booking paid + confirmed on a successful IPN", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const query = buildIpnQuery();

    const result = await handleVnpayCallback({ query, ipn: true }, store);
    assert.equal(result.valid, true);
    assert.equal(result.isSuccess, true);

    const booking = store.bookings.get("JAS-ABC123")!;
    assert.equal(booking.payment.status, "paid");
    assert.equal(booking.bookingStatus, "confirmed");

    const txn = store.transactions.get("JAS-ABC123-1");
    assert.equal(txn?.status, "paid");
  });

  it("is idempotent — repeated successful callbacks do not double-confirm", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const query = buildIpnQuery();

    await handleVnpayCallback({ query, ipn: true }, store);
    const afterFirst = store.bookings.get("JAS-ABC123")!;

    // Fire the same IPN again (VNPay retries).
    await handleVnpayCallback({ query, ipn: true }, store);
    const afterSecond = store.bookings.get("JAS-ABC123")!;

    assert.equal(afterFirst.payment.status, "paid");
    assert.equal(afterSecond.payment.status, "paid");
    assert.equal(afterFirst.bookingStatus, "confirmed");
    assert.equal(afterSecond.bookingStatus, "confirmed");
    // No duplicate payment records.
    assert.equal(store.transactions.size, 1);
  });

  it("rejects invalid signature and never updates the booking", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const query = buildIpnQuery();
    query.vnp_SecureHash = "tampered-signature";

    const result = await handleVnpayCallback({ query, ipn: true }, store);
    assert.equal(result.valid, false);
    assert.equal(result.isSuccess, false);

    const booking = store.bookings.get("JAS-ABC123")!;
    assert.equal(booking.payment.status, "pending");
    assert.equal(booking.bookingStatus, "pending");
  });

  it("rejects amount mismatch even with a valid signature", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    // Signed with the WRONG amount (1 VND) — valid signature, wrong amount.
    const query = buildIpnQuery({ vnp_Amount: "100" });

    const result = await handleVnpayCallback({ query, ipn: true }, store);
    assert.equal(result.valid, true);
    assert.equal(result.isSuccess, false);

    const booking = store.bookings.get("JAS-ABC123")!;
    assert.equal(booking.payment.status, "pending");
  });

  it("marks a failed/cancelled IPN as failed", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const query = buildIpnQuery({
      vnp_ResponseCode: "24",
      vnp_TransactionStatus: "24",
    });

    const result = await handleVnpayCallback({ query, ipn: true }, store);
    assert.equal(result.valid, true);
    assert.equal(result.isSuccess, false);

    const booking = store.bookings.get("JAS-ABC123")!;
    assert.equal(booking.payment.status, "failed");
    assert.equal(booking.bookingStatus, "pending");
  });

  it("does not mark paid from the Return URL alone when signature is fine but status non-zero", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const query = buildIpnQuery({
      vnp_ResponseCode: "24",
      vnp_TransactionStatus: "24",
    });
    const result = await handleVnpayCallback({ query, ipn: false }, store);
    assert.equal(result.isSuccess, false);
    assert.equal(store.bookings.get("JAS-ABC123")!.payment.status, "pending");
  });
});

describe("vnpay service — end-to-end payment URL + return", () => {
  it("creates a URL, then verifies the return query", async () => {
    store.bookings.set("JAS-ABC123", makeBooking());
    const { txnRef } = await createVnpayPaymentUrl(
      { bookingCode: "JAS-ABC123", ipAddr: "127.0.0.1" },
      store
    );

    // VNPay echoes back the return query signed with the same secret.
    const query = buildIpnQuery({ vnp_TxnRef: txnRef });
    const result = await handleVnpayCallback({ query, ipn: true }, store);
    assert.equal(result.isSuccess, true);
  });
});
