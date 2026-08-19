import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookingAddons, bookings, departures, payments } from "@/lib/db/schema";
import { mapBooking, mapPayment } from "@/lib/db/mappers";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
import type {
  Booking,
  BookingStatus,
  PaymentStatus,
  PaymentTransaction,
} from "@/types/domain";

/**
 * Postgres-backed booking + payment repositories (server-only).
 *
 * Capacity reservation is concurrency-safe: an atomic
 * `UPDATE departures SET booked = booked + n WHERE tour_id = ? AND date = ?
 *  AND status = 'open' AND (capacity <= 0 OR booked + n <= capacity)`
 * guarantees we never oversell, even under concurrent requests.
 */

export class BookingRepository {
  /**
   * Create a booking inside a transaction that also reserves capacity.
   * Throws a BookingError-compatible error via callback codes; returns the
   * created Booking (or null on booking-code collision).
   */
  async create(
    input: {
      bookingCode: string;
      tourId: string;
      tourSlug: string;
      tourTitle: string;
      variantId: string;
      variantName: string;
      departureDate: string;
      guestCount: number;
      addOns: { id: string; name: string; price: number; perPerson: boolean }[];
      customer: Record<string, unknown>;
      unitPrice: number;
      subtotal: number;
      discount: number;
      vat: number;
      cardFee: number;
      totalAmount: number;
      amountToPayNow: number;
      paymentPlan: "deposit" | "full";
      paymentMethod: "vnpay" | "zalo_manual";
    }
  ): Promise<Booking | null> {
    let booking: Booking | null = null;

    try {
      await db.transaction(async (tx) => {
        // Reserve capacity atomically.
        const res = await tx.execute(sql`
          update departures
          set booked = booked + ${input.guestCount}, updated_at = now()
          where tour_id = ${input.tourId}
            and date = ${input.departureDate}
            and status = 'open'
            and (capacity <= 0 or booked + ${input.guestCount} <= capacity)
        `);
        const changed = res.count === 1;

        // If a departure row exists for this tour+date, it MUST have been updated.
        const depRows = await tx
          .select({ id: departures.id })
          .from(departures)
          .where(
            and(
              eq(departures.tourId, input.tourId),
              eq(departures.date, input.departureDate)
            )
          )
          .limit(1);

        if (depRows.length > 0 && !changed) {
          throw new Error("BOOKING_SOLD_OUT");
        }

        const now = new Date();

        const [inserted] = await tx
          .insert(bookings)
          .values({
            bookingCode: input.bookingCode,
            tourId: input.tourId,
            tourSlug: input.tourSlug,
            tourTitle: input.tourTitle,
            variantId: input.variantId,
            variantName: input.variantName,
            departureDate: input.departureDate,
            guestCount: input.guestCount,
            customer: input.customer as never,
            unitPrice: input.unitPrice,
            subtotal: input.subtotal,
            discount: input.discount,
            vat: input.vat,
            cardFee: input.cardFee,
            totalAmount: input.totalAmount,
            amountToPayNow: input.amountToPayNow,
            paymentPlan: input.paymentPlan,
            bookingStatus: "pending",
            paymentMethod: input.paymentMethod,
            paymentStatus: "pending",
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        if (input.addOns.length > 0) {
          await tx.insert(bookingAddons).values(
            input.addOns.map((a) => ({
              bookingId: inserted.id,
              addonId: a.id,
              name: a.name,
              price: a.price,
              perPerson: a.perPerson,
            }))
          );
        }

        booking = mapBooking(inserted, input.addOns);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new Error("BOOKING_CODE_COLLISION");
      }
      throw error;
    }

    return booking;
  }

  async getByCode(bookingCode: string): Promise<Booking | null> {
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingCode, bookingCode))
      .limit(1);
    if (rows.length === 0) return null;
    const addOns = await this.getAddOnsByBookingId(rows[0].id);
    return this.mapWithAddOns(rows[0], addOns);
  }

  async getById(id: string): Promise<Booking | null> {
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);
    if (rows.length === 0) return null;
    const addOns = await this.getAddOnsByBookingId(rows[0].id);
    return this.mapWithAddOns(rows[0], addOns);
  }

  private mapWithAddOns(
    row: typeof bookings.$inferSelect,
    addOns: (typeof bookingAddons.$inferSelect)[]
  ): Booking {
    return mapBooking(
      row,
      addOns.map((a) => ({
        id: a.addonId ?? "",
        name: a.name,
        price: a.price,
        perPerson: a.perPerson,
      }))
    );
  }

  private async getAddOnsByBookingId(bookingId: string) {
    return db
      .select()
      .from(bookingAddons)
      .where(eq(bookingAddons.bookingId, bookingId));
  }

  async updateBooking(bookingCode: string, patch: Partial<Booking>): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.bookingStatus) set.bookingStatus = patch.bookingStatus;
    if (patch.internalNotes !== undefined) set.internalNotes = patch.internalNotes;
    await db.update(bookings).set(set).where(eq(bookings.bookingCode, bookingCode));
  }

  async updateBookingPayment(
    bookingCode: string,
    patch: Partial<Booking["payment"]>
  ): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.status) set.paymentStatus = patch.status;
    if (patch.paidAt) set.paidAt = new Date(patch.paidAt);
    if (patch.vnpayTxnRef !== undefined) set.vnpayTxnRef = patch.vnpayTxnRef;
    if (patch.vnpayResponseCode !== undefined) set.vnpayResponseCode = patch.vnpayResponseCode;
    if (patch.vnpayTransactionStatus !== undefined) set.vnpayTransactionStatus = patch.vnpayTransactionStatus;
    if (patch.vnpayTransactionNo !== undefined) set.vnpayTransactionNo = patch.vnpayTransactionNo;
    await db.update(bookings).set(set).where(eq(bookings.bookingCode, bookingCode));
  }

  /** Set booking status + optionally restore departure capacity. */
  async setStatus(
    bookingCode: string,
    status: BookingStatus,
    opts: { restoreCapacity?: boolean } = {}
  ): Promise<void> {
    const { restoreCapacity = false } = opts;
    await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.bookingCode, bookingCode))
        .limit(1);
      const booking = rows[0];
      if (!booking) return;

      await tx
        .update(bookings)
        .set({ bookingStatus: status, updatedAt: new Date() })
        .where(eq(bookings.bookingCode, bookingCode));

      if (restoreCapacity) {
        await tx.execute(sql`
          update departures
          set booked = greatest(0, booked - ${booking.guestCount}), updated_at = now()
          where tour_id = ${booking.tourId}
            and date = ${booking.departureDate}
            and status = 'open'
        `);
      }
    });
  }

  async list(opts: {
    query?: string;
    tourId?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: Booking[]; total: number }> {
    const { query, tourId, status, paymentStatus, limit = 20, offset = 0 } = opts;

    const conds = [];
    if (query) conds.push(sql`(booking_code ilike ${`%${query}%`} or customer->>'fullName' ilike ${`%${query}%`} or customer->>'phone' ilike ${`%${query}%`})`);
    if (tourId) conds.push(eq(bookings.tourId, tourId));
    if (status) conds.push(eq(bookings.bookingStatus, status));
    if (paymentStatus) conds.push(eq(bookings.paymentStatus, paymentStatus));

    const where = conds.length ? and(...conds) : undefined;

    const totalRows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(bookings)
      .where(where);
    const total = totalRows[0]?.n ?? 0;

    const rows = await db
      .select()
      .from(bookings)
      .where(where)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    const bookingIds = rows.map((row) => row.id);
    const addonRows = bookingIds.length
      ? await db
          .select()
          .from(bookingAddons)
          .where(inArray(bookingAddons.bookingId, bookingIds))
      : [];
    const addonsByBookingId = new Map<string, typeof addonRows>();
    for (const addon of addonRows) {
      const existing = addonsByBookingId.get(addon.bookingId) ?? [];
      existing.push(addon);
      addonsByBookingId.set(addon.bookingId, existing);
    }

    return {
      rows: rows.map((row) =>
        this.mapWithAddOns(row, addonsByBookingId.get(row.id) ?? [])
      ),
      total,
    };
  }
}

// ---------------------------------------------------------------------------
// Payments (VNPay attempt audit log)
// ---------------------------------------------------------------------------

export class PaymentRepository {
  async saveTransaction(txn: Partial<PaymentTransaction> & { txnRef: string }): Promise<void> {
    const existing = await this.getTransaction(txn.txnRef);
    const now = new Date();

    if (existing) {
      await db
        .update(payments)
        .set({
          status: txn.status ?? existing.status,
          amount: txn.amount ?? existing.amount,
          vnpayResponseCode: txn.vnpayResponseCode ?? existing.vnpayResponseCode,
          vnpayTransactionStatus: txn.vnpayTransactionStatus ?? existing.vnpayTransactionStatus,
          vnpayTransactionNo: txn.vnpayTransactionNo ?? existing.vnpayTransactionNo,
          raw: txn.raw ?? existing.raw,
          updatedAt: now,
        })
        .where(eq(payments.txnRef, txn.txnRef));
      return;
    }

    // Find booking id from code.
    const bookingCode = txn.bookingCode ?? "";
    const bookingRows = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingCode, bookingCode))
      .limit(1);

    await db.insert(payments).values({
      bookingId: bookingRows[0]?.id,
      bookingCode,
      txnRef: txn.txnRef,
      amount: txn.amount ?? 0,
      method: txn.method ?? "vnpay",
      status: txn.status ?? "pending",
      vnpayResponseCode: txn.vnpayResponseCode,
      vnpayTransactionStatus: txn.vnpayTransactionStatus,
      vnpayTransactionNo: txn.vnpayTransactionNo,
      raw: txn.raw,
      createdAt: now,
      updatedAt: now,
    });
  }

  async getTransaction(txnRef: string): Promise<PaymentTransaction | null> {
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.txnRef, txnRef))
      .limit(1);
    return rows.length ? mapPayment(rows[0]) : null;
  }

  async listForBooking(bookingCode: string): Promise<PaymentTransaction[]> {
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingCode, bookingCode))
      .orderBy(asc(payments.createdAt));
    return rows.map(mapPayment);
  }

  async list(opts: {
    bookingCode?: string;
    status?: PaymentStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: PaymentTransaction[]; total: number }> {
    const { bookingCode, status, limit = 20, offset = 0 } = opts;
    const conds = [];
    if (bookingCode) conds.push(eq(payments.bookingCode, bookingCode));
    if (status) conds.push(eq(payments.status, status));

    const where = conds.length ? and(...conds) : undefined;
    const totalRows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(payments)
      .where(where);
    const total = totalRows[0]?.n ?? 0;

    const rows = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);
    return { rows: rows.map(mapPayment), total };
  }
}
