"use server";

import { revalidatePath } from "next/cache";
import { BookingRepository } from "@/lib/repositories/bookings";
import { generateBookingCode } from "@/lib/bookings/booking-code";
import { calculatePrice } from "@/lib/pricing";
import { getSiteSettings, getTourById } from "@/lib/repository";
import type { BookingStatus, PaymentStatus } from "@/types/domain";

const repo = new BookingRepository();

/** Valid booking status transitions (admin). */
const TRANSITIONS: Record<string, string[]> = {
  pending: ["awaiting_payment", "confirmed", "cancelled", "completed"],
  awaiting_payment: ["confirmed", "cancelled", "completed", "pending"],
  confirmed: ["completed", "cancelled", "awaiting_payment"],
  completed: [],
  cancelled: ["pending"],
};

export async function setBookingStatus(
  bookingCode: string,
  status: BookingStatus,
  opts: { restoreCapacity?: boolean } = {}
) {
  const booking = await repo.getByCode(bookingCode);
  if (!booking) return { error: "Booking not found" };

  const allowed = TRANSITIONS[booking.bookingStatus] ?? [];
  if (!allowed.includes(status)) {
    return {
      error: `Cannot change from ${booking.bookingStatus} to ${status}`,
    };
  }

  await repo.setStatus(bookingCode, status, opts);
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingCode}`);
  revalidatePath(`/booking/${bookingCode}`);
  return { ok: true };
}

export async function updateInternalNotes(bookingCode: string, notes: string) {
  await repo.updateBooking(bookingCode, { internalNotes: notes });
  revalidatePath(`/admin/bookings/${bookingCode}`);
}

/** Manual payment confirmation (zalo/manual or phone payments). */
export async function confirmPayment(bookingCode: string) {
  const booking = await repo.getByCode(bookingCode);
  if (!booking) return { error: "Booking not found" };
  if (booking.payment.status === "paid") return { error: "Already paid" };

  const now = new Date().toISOString();
  await repo.updateBookingPayment(bookingCode, { status: "paid", paidAt: now });
  await repo.updateBooking(bookingCode, { bookingStatus: "confirmed" });
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingCode}`);
  revalidatePath(`/booking/${bookingCode}`);
  return { ok: true };
}

/**
 * Manually create a booking from Admin (phone/Zalo customers).
 * Pricing is derived server-side from tour/variant/add-ons — never client input.
 */
export async function manualCreateBooking(input: {
  tourId: string;
  variantId: string;
  startDate: string;
  guestCount: number;
  addOnIds?: string[];
  paymentMethod: "vnpay" | "zalo_manual";
  paymentPlan?: "deposit" | "full";
  payByCard?: boolean;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    zaloPhone?: string;
    nationality?: string;
    note?: string;
  };
}) {
  // Resolve authoritative entities + price.
  const tour = await getTourById(input.tourId);
  if (!tour) return { error: "Tour not found" };
  const variant = tour.variants.find((v) => v.id === input.variantId);
  if (!variant) return { error: "Variant not found" };
  const addOns = tour.addOns.filter((a) => input.addOnIds?.includes(a.id));
  const settings = await getSiteSettings();
  const price = calculatePrice(
    {
      tourId: input.tourId,
      variantId: input.variantId,
      startDate: input.startDate,
      guestCount: input.guestCount,
      addOnIds: input.addOnIds ?? [],
      paymentPlan: input.paymentPlan ?? "full",
      payByCard: input.payByCard ?? false,
    },
    { tour, variant, addOns, promo: null, settings }
  );

  let booking = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    booking = await repo
      .create({
        bookingCode: generateBookingCode(),
        tourId: tour.id,
        tourSlug: tour.slug,
        tourTitle: tour.title,
        variantId: variant.id,
        variantName: variant.name,
        departureDate: input.startDate,
        guestCount: input.guestCount,
        addOns: addOns.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          perPerson: a.perPerson,
        })),
        customer: input.customer,
        unitPrice: variant.basePrice,
        subtotal: price.subtotal,
        discount: price.discount,
        vat: price.vat,
        cardFee: price.cardFee,
        totalAmount: price.total,
        amountToPayNow: price.amountToPayNow,
        paymentPlan: input.paymentPlan ?? "full",
        paymentMethod: input.paymentMethod,
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "BOOKING_CODE_COLLISION") {
          return null;
        }
        throw err;
      });
    if (booking) break;
  }

  if (!booking) return { error: "Could not generate a unique booking code" };
  revalidatePath("/admin/bookings");
  return { bookingCode: booking.bookingCode };
}

export async function getBookingList(opts: {
  query?: string;
  tourId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
}) {
  return repo.list({
    query: opts.query,
    tourId: opts.tourId,
    status: opts.status,
    paymentStatus: opts.paymentStatus,
    limit: 20,
    offset: ((opts.page ?? 1) - 1) * 20,
  });
}

export async function getBookingDetail(bookingCode: string) {
  return repo.getByCode(bookingCode);
}

export type { BookingStatus, PaymentStatus };
