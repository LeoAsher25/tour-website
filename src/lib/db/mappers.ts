import type {
  BlogPost,
  Booking,
  BookingCustomer,
  Destination,
  MediaItem,
  PaymentTransaction,
  PromoCode,
  Review,
  SiteSettings,
  Tour,
  TourImage,
} from "@/types/domain";
import type { TiptapDoc } from "@/types/domain";
import { estimateReadingMinutes, textFromTiptap } from "@/lib/blogs/tiptap";
import { publicUrlFor } from "@/lib/storage/media";

import {
  adminUsers,
  blogs,
  bookings,
  departures,
  destinations,
  media,
  payments,
  promoCodes,
  reviews,
  siteSettings,
  tourAddons,
  tourImages,
  tours,
  tourVariants,
  type BookingCustomer as DbBookingCustomer,
  type TiptapDoc as DbTiptapDoc,
} from "@/lib/db/schema";

/**
 * Map DB rows (Drizzle) → domain types.
 * Storage keys are converted to public URLs at the boundary; domain code keeps
 * working with `heroImage`/`coverImage` URLs exactly as before.
 */

function toIso(value: Date | string | null | undefined): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

function dateToIso(value: Date | string | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  // date column returns YYYY-MM-DD
  return `${String(value)}T00:00:00.000Z`;
}

type TourRow = typeof tours.$inferSelect;
type VariantRow = typeof tourVariants.$inferSelect;
type AddonRow = typeof tourAddons.$inferSelect;
type ImageRow = typeof tourImages.$inferSelect;
type DepartureRow = typeof departures.$inferSelect;
type DestinationRow = typeof destinations.$inferSelect;

export interface TourWithChildren {
  tour: TourRow;
  variants: VariantRow[];
  addOns: AddonRow[];
  images: ImageRow[];
  departures: DepartureRow[];
  destination?: DestinationRow | null;
}

export function mapTour(row: TourWithChildren): Tour {
  const { tour, variants, addOns, images, departures: deps, destination } = row;

  const heroKey = tour.heroImageKey;
  const heroImage = heroKey ? publicUrlFor(heroKey) : "";

  const gallery: TourImage[] = [...images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      id: img.id,
      url: publicUrlFor(img.storageKey),
      alt: img.alt ?? tour.title,
      position: img.position,
    }));

  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    subtitle: tour.subtitle ?? "",
    description: tour.description ?? "",
    overview: tour.overview ?? "",
    destination: destination?.name ?? "",
    destinationSlug: destination?.slug ?? "",
    startLocation: tour.startLocation ?? "",
    endLocation: tour.endLocation ?? "",
    durationDays: tour.durationDays,
    durationNights: tour.durationNights,
    difficulty: tour.difficulty,
    groupSize: tour.groupSize ?? undefined,
    vehicle: tour.vehicle ?? undefined,
    suitableFor: tour.suitableFor ?? "",
    warnings: tour.warnings ?? [],
    rating: tour.rating,
    reviewCount: tour.reviewCount,
    fromPrice: tour.fromPrice,
    heroImage,
    images: gallery,
    highlights: tour.highlights ?? [],
    included: tour.included ?? [],
    excluded: tour.excluded ?? [],
    accommodation: tour.accommodation ?? "",
    transportation: tour.transportation ?? "",
    meals: tour.meals ?? "",
    itinerary: tour.itinerary ?? [],
    variants: [...variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description ?? "",
        priceType: v.priceType,
        basePrice: v.basePrice,
        attrs: v.attrs ?? undefined,
        maxGroupSize: v.maxGroupSize ?? undefined,
      })),
    addOns: [...addOns]
      .sort((a, b) => a.position - b.position)
      .map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description ?? "",
        price: a.price,
        perPerson: a.perPerson,
      })),
    faqs: tour.faqs ?? [],
    departures: deps.map((d) => ({
      id: String(d.id),
      date: d.date,
      capacity: d.capacity,
      booked: d.booked,
    })),
    bookingMode: tour.bookingMode,
    featured: tour.featured,
    published: tour.status === "published",
    seoTitle: tour.seoTitle ?? undefined,
    seoDescription: tour.seoDescription ?? undefined,
  };
}

export function mapDestination(row: DestinationRow): Destination {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    heroImage: row.heroImageKey ? publicUrlFor(row.heroImageKey) : "",
  };
}

export function mapPromo(row: typeof promoCodes.$inferSelect): PromoCode {
  return {
    code: row.code,
    discountType: row.discountType,
    discountValue: Number(row.discountValue),
    minSubtotal: row.minSubtotal ?? undefined,
    maxRedemptions: row.maxRedemptions ?? undefined,
    redemptions: row.redemptions,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : undefined,
    active: row.active,
  };
}

export function mapReview(row: typeof reviews.$inferSelect): Review {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    trip: row.trip ?? "",
    quote: row.quote,
    date: row.date ? String(row.date) : "",
  };
}

export function mapSettings(row: typeof siteSettings.$inferSelect): SiteSettings {
  return {
    depositPercent: row.depositPercent,
    vatPercent: row.vatPercent,
    cardFeePercent: row.cardFeePercent,
    currency: row.currency as "VND",
    supportPhone: row.supportPhone ?? "",
    supportWhatsapp: row.supportZalo ?? "",
    supportEmail: row.supportEmail ?? "",
  };
}

// ---- Blogs ----

type BlogRow = typeof blogs.$inferSelect;

export function mapBlog(row: BlogRow): BlogPost {
  const contentJson = normalizeTiptap(row.contentJson);
  const contentText = row.contentText ?? textFromTiptap(contentJson);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    coverImage: row.coverImageKey ? publicUrlFor(row.coverImageKey) : "",
    coverImageKey: row.coverImageKey ?? undefined,
    contentJson,
    contentText,
    content: contentText,
    author: row.authorName ?? "",
    authorId: row.authorId ?? undefined,
    tags: row.tags ?? [],
    featured: row.featured,
    status: row.status,
    publishedAt: toIso(row.publishedAt) || toIso(row.createdAt),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    readingMinutes: estimateReadingMinutes(contentText),
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
  };
}

function normalizeTiptap(doc: DbTiptapDoc | null): TiptapDoc {
  if (
    doc &&
    typeof doc === "object" &&
    (doc as TiptapDoc).type === "doc" &&
    Array.isArray((doc as TiptapDoc).content)
  ) {
    return doc as TiptapDoc;
  }
  return { type: "doc", content: [] };
}


// ---- Bookings & payments ----

type BookingRow = typeof bookings.$inferSelect;
type PaymentRow = typeof payments.$inferSelect;

export function mapBooking(
  row: BookingRow,
  addOns: { id: string; name: string; price: number; perPerson: boolean }[] = []
): Booking {
  const customer = (row.customer ?? {}) as BookingCustomer;

  return {
    bookingCode: row.bookingCode,
    tourId: row.tourId,
    tourSlug: row.tourSlug,
    tourTitle: row.tourTitle,
    variant: row.variantName,
    variantId: row.variantId ?? "",
    departureDate: dateToIso(row.departureDate),
    guestCount: row.guestCount,
    addOns,
    customer,
    unitPrice: row.unitPrice,
    subtotal: row.subtotal,
    discount: row.discount,
    vat: row.vat,
    cardFee: row.cardFee,
    totalAmount: row.totalAmount,
    amountToPayNow: row.amountToPayNow,
    currency: row.currency as "VND",
    paymentPlan: row.paymentPlan,
    bookingStatus: row.bookingStatus,
    payment: {
      method: row.paymentMethod === "zalo_manual" ? "zalo/manual" : "vnpay",
      status: row.paymentStatus,
      vnpayTxnRef: row.vnpayTxnRef ?? undefined,
      vnpayTransactionNo: row.vnpayTransactionNo ?? undefined,
      vnpayResponseCode: row.vnpayResponseCode ?? undefined,
      vnpayTransactionStatus: row.vnpayTransactionStatus ?? undefined,
      paidAt: row.paidAt ? toIso(row.paidAt) : undefined,
    },
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapPayment(row: PaymentRow): PaymentTransaction {
  return {
    id: row.id,
    bookingCode: row.bookingCode,
    txnRef: row.txnRef,
    amount: row.amount,
    method: row.method as "vnpay",
    status: row.status,
    vnpayResponseCode: row.vnpayResponseCode ?? undefined,
    vnpayTransactionStatus: row.vnpayTransactionStatus ?? undefined,
    vnpayTransactionNo: row.vnpayTransactionNo ?? undefined,
    raw: row.raw ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapMedia(row: typeof media.$inferSelect): MediaItem {
  return {
    id: row.id,
    storageKey: row.storageKey,
    bucket: row.bucket,
    mimeType: row.mimeType ?? undefined,
    sizeBytes: row.sizeBytes ?? undefined,
    alt: row.alt ?? undefined,
    caption: row.caption ?? undefined,
    createdAt: toIso(row.createdAt),
  };
}

export function mapAdminUser(row: typeof adminUsers.$inferSelect) {
  return {
    id: row.id,
    authUserId: row.authUserId,
    email: row.email,
    name: row.name ?? undefined,
    role: row.role,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt ? toIso(row.lastLoginAt) : undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

// Re-export the DB customer shape so booking code can construct it.
export type { DbBookingCustomer };
