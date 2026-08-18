import "server-only";

import { generateBookingCode } from "@/lib/bookings/booking-code";
import { calculatePrice } from "@/lib/pricing";
import { getPromoByCode, getSiteSettings, resolvePricingEntities } from "@/lib/repository";
import { BookingRepository } from "@/lib/repositories/bookings";
import type {
  Booking,
  BookingCustomer,
  PaymentMethod,
  PriceBreakdown,
} from "@/types/domain";

export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_TOUR"
      | "INVALID_VARIANT"
      | "INVALID_DATE"
      | "INVALID_GUESTS"
      | "INVALID_CUSTOMER"
      | "SOLD_OUT"
      | "UNAVAILABLE"
      | "BOOKING_CODE_COLLISION"
  ) {
    super(message);
    this.name = "BookingError";
  }
}

export interface CreateBookingParams {
  tourId: string;
  variantId: string;
  startDate: string; // YYYY-MM-DD
  guestCount: number;
  addOnIds?: string[];
  promoCode?: string;
  paymentPlan?: "deposit" | "full";
  payByCard?: boolean;
  customer: BookingCustomer;
  paymentMethod: PaymentMethod;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Drop keys whose value is `undefined` (keeps JSONB clean). */
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Pure availability check — returns true when capacity allows `guests` more. */
export function canReserve(
  departure: { capacity: number; booked: number } | null,
  guests: number
): boolean {
  if (!departure) return true; // no departure record → no hard cap
  return departure.capacity <= 0 || departure.booked + guests <= departure.capacity;
}

/** Pure validation of a departure date (YYYY-MM-DD, in the future). */
export function isValidDepartureDate(value: string, now = new Date()): boolean {
  if (!DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return date >= new Date(now.toDateString());
}

/** Pure guest count validation. */
export function isValidGuestCount(guestCount: number): boolean {
  const guests = Math.floor(guestCount);
  return Number.isFinite(guests) && guests >= 1 && guests <= 30;
}

const bookingRepo = new BookingRepository();

/**
 * Server-side booking creation. All pricing is derived here from the
 * authoritative tour/variant/add-on data — never from the client. Availability
 * is reserved atomically with booking creation inside a Postgres transaction.
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<{ booking: Booking; price: PriceBreakdown }> {
  const {
    tourId,
    variantId,
    startDate,
    guestCount,
    addOnIds = [],
    promoCode,
    paymentPlan = "full",
    payByCard = false,
    customer,
    paymentMethod,
  } = params;

  // ---- Validate inputs ----
  if (!isValidDepartureDate(startDate)) {
    throw new BookingError("Invalid departure date", "INVALID_DATE");
  }
  const guests = Math.floor(guestCount);
  if (!isValidGuestCount(guestCount)) {
    throw new BookingError("Invalid guest count", "INVALID_GUESTS");
  }

  const fullName = customer.fullName?.trim();
  const phone = customer.phone?.trim();
  if (!fullName || fullName.length < 2) {
    throw new BookingError("Full name is required", "INVALID_CUSTOMER");
  }
  if (!phone || phone.replace(/\D/g, "").length < 8) {
    throw new BookingError("Valid phone number is required", "INVALID_CUSTOMER");
  }

  // ---- Resolve authoritative entities ----
  const entities = await resolvePricingEntities(tourId, variantId, addOnIds);
  if (!entities) {
    throw new BookingError("Tour or variant not found", "INVALID_VARIANT");
  }
  const { tour, variant, addOns } = entities;

  // ---- Authoritative price ----
  const promo = promoCode ? await getPromoByCode(promoCode) : null;
  const settings = await getSiteSettings();
  const price = calculatePrice(
    { tourId, variantId, startDate, guestCount: guests, addOnIds, promoCode, paymentPlan, payByCard },
    { tour, variant, addOns, promo, settings }
  );

  // ---- Create booking + reserve capacity atomically ----
  let booking: Booking | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const bookingCode = generateBookingCode();
    const addOnSnapshot = addOns.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.price,
      perPerson: a.perPerson,
    }));

    const created = await bookingRepo
      .create({
        bookingCode,
        tourId: tour.id,
        tourSlug: tour.slug,
        tourTitle: tour.title,
        variantId: variant.id,
        variantName: variant.name,
        departureDate: startDate,
        guestCount: guests,
        addOns: addOnSnapshot,
        customer: compact({
          fullName,
          phone,
          email: customer.email?.trim(),
          zaloPhone: customer.zaloPhone?.trim(),
          nationality: customer.nationality?.trim(),
          note: customer.note?.trim(),
        }),
        unitPrice: variant.basePrice,
        subtotal: price.subtotal,
        discount: price.discount,
        vat: price.vat,
        cardFee: price.cardFee,
        totalAmount: price.total,
        amountToPayNow: price.amountToPayNow,
        paymentPlan,
        paymentMethod: paymentMethod === "zalo/manual" ? "zalo_manual" : "vnpay",
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "BOOKING_CODE_COLLISION") {
          return null; // retry with a fresh code
        }
        if (err instanceof Error && err.message === "BOOKING_SOLD_OUT") {
          throw new BookingError(
            "This departure date is sold out",
            "SOLD_OUT"
          );
        }
        throw err;
      });

    if (created) {
      booking = created;
      break;
    }
  }

  if (!booking) {
    throw new BookingError(
      "Could not generate a unique booking code — please retry",
      "BOOKING_CODE_COLLISION"
    );
  }

  return { booking, price };
}

export async function getBookingByCode(bookingCode: string): Promise<Booking | null> {
  return bookingRepo.getByCode(bookingCode);
}
