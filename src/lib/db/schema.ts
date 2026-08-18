import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  bigint,
} from "drizzle-orm/pg-core";

/**
 * Database schema (PostgreSQL / Supabase).
 *
 * Conventions:
 * - Money is BIGINT VND, always integer (never floats, never cents).
 * - `*_key` columns store Supabase Storage object keys, NOT URLs. Public URLs
 *   are derived at render time by MediaStorage.
 * - Timestamps are `timestamptz`.
 * - JSONB is used where normalization adds no value (itinerary, FAQ,
 *   highlights, included/excluded, customer snapshot, VNPay raw).
 * - RLS policies live in supabase/rls.sql (defense-in-depth; the app uses the
 *   service role / Postgres directly for admin operations).
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const tourStatusEnum = pgEnum("tour_status", [
  "draft",
  "published",
  "archived",
]);

export const blogStatusEnum = pgEnum("blog_status", [
  "draft",
  "published",
  "archived",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "per_person",
  "per_group",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "awaiting_payment",
  "confirmed",
  "cancelled",
  "completed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "paid",
  "failed",
  "expired",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["vnpay", "zalo_manual"]);

export const departureStatusEnum = pgEnum("departure_status", [
  "open",
  "closed",
  "cancelled",
]);

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "admin",
  "editor",
]);

export const bookingModeEnum = pgEnum("booking_mode", [
  "scheduled",
  "flexible",
]);

export const paymentPlanEnum = pgEnum("payment_plan", ["deposit", "full"]);

export const discountTypeEnum = pgEnum("discount_type", ["percent", "fixed"]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "moderate",
  "challenging",
  "expert",
]);

// ---------------------------------------------------------------------------
// Admin & auth
// ---------------------------------------------------------------------------

/**
 * Admin users. `auth_user_id` links to Supabase Auth (auth.users) — the link
 * is created in code (seed / admin service) rather than a DB FK so the schema
 * stays portable across Postgres hosts. RLS policies join on it via auth.uid().
 */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authUserId: uuid("auth_user_id").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name"),
    role: adminRoleEnum("role").notNull().default("editor"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("admin_users_role_idx").on(t.role),
    index("admin_users_email_idx").on(t.email),
  ]
);

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    heroImageKey: text("hero_image_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("destinations_slug_idx").on(t.slug)]
);

// ---------------------------------------------------------------------------
// Tours
// ---------------------------------------------------------------------------

export const tours = pgTable(
  "tours",
  {
    id: text("id").primaryKey(), // short stable id, e.g. "tour-1"
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    overview: text("overview"),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => destinations.id),
    startLocation: text("start_location"),
    endLocation: text("end_location"),
    durationDays: integer("duration_days").notNull().default(0),
    durationNights: integer("duration_nights").notNull().default(0),
    difficulty: difficultyEnum("difficulty").notNull().default("easy"),
    groupSize: text("group_size"),
    vehicle: text("vehicle"),
    suitableFor: text("suitable_for"),
    warnings: jsonb("warnings").$type<string[]>().notNull().default([]),
    rating: doublePrecision("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    fromPrice: bigint("from_price", { mode: "number" }).notNull().default(0),
    heroImageKey: text("hero_image_key"),
    highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
    included: jsonb("included").$type<string[]>().notNull().default([]),
    excluded: jsonb("excluded").$type<string[]>().notNull().default([]),
    accommodation: text("accommodation"),
    transportation: text("transportation"),
    meals: text("meals"),
    itinerary: jsonb("itinerary").$type<ItineraryDay[]>().notNull().default([]),
    faqs: jsonb("faqs").$type<Faq[]>().notNull().default([]),
    bookingMode: bookingModeEnum("booking_mode").notNull().default("flexible"),
    status: tourStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tours_status_idx").on(t.status),
    index("tours_destination_id_idx").on(t.destinationId),
    index("tours_featured_idx").on(t.featured),
  ]
);

export const toursRelations = relations(tours, ({ many, one }) => ({
  destination: one(destinations, {
    fields: [tours.destinationId],
    references: [destinations.id],
  }),
  variants: many(tourVariants),
  addOns: many(tourAddons),
  images: many(tourImages),
  departures: many(departures),
}));

export const tourVariants = pgTable(
  "tour_variants",
  {
    id: text("id").primaryKey(), // e.g. "v1-self"
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priceType: priceTypeEnum("price_type").notNull().default("per_person"),
    basePrice: bigint("base_price", { mode: "number" }).notNull(),
    attrs: jsonb("attrs").$type<Record<string, string>>(),
    maxGroupSize: integer("max_group_size"),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("tour_variants_tour_id_idx").on(t.tourId)]
);

export const tourVariantsRelations = relations(tourVariants, ({ one }) => ({
  tour: one(tours, {
    fields: [tourVariants.tourId],
    references: [tours.id],
  }),
}));

export const tourAddons = pgTable(
  "tour_addons",
  {
    id: text("id").primaryKey(), // e.g. "a1-private"
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    price: bigint("price", { mode: "number" }).notNull(),
    perPerson: boolean("per_person").notNull().default(false),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("tour_addons_tour_id_idx").on(t.tourId)]
);

export const tourAddonsRelations = relations(tourAddons, ({ one }) => ({
  tour: one(tours, {
    fields: [tourAddons.tourId],
    references: [tours.id],
  }),
}));

export const tourImages = pgTable(
  "tour_images",
  {
    id: text("id").primaryKey(), // e.g. "t1-1"
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    alt: text("alt"),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    index("tour_images_tour_id_idx").on(t.tourId),
    index("tour_images_position_idx").on(t.tourId, t.position),
  ]
);

export const tourImagesRelations = relations(tourImages, ({ one }) => ({
  tour: one(tours, {
    fields: [tourImages.tourId],
    references: [tours.id],
  }),
}));

// ---------------------------------------------------------------------------
// Departures (concurrency-safe capacity)
// ---------------------------------------------------------------------------

/**
 * One row per tour departure date. Capacity updates must be atomic:
 * `UPDATE departures SET booked = booked + $n WHERE tour_id = $t AND date = $d
 *  AND (capacity <= 0 OR booked + $n <= capacity)`
 * (see BookingRepository.reserveDeparture). The unique(tour_id, date) index
 * prevents duplicate departure rows for the same tour+date.
 */
export const departures = pgTable(
  "departures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    date: date("date").notNull(), // YYYY-MM-DD
    capacity: integer("capacity").notNull().default(0),
    booked: integer("booked").notNull().default(0),
    status: departureStatusEnum("status").notNull().default("open"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("departures_tour_date_uq").on(t.tourId, t.date),
    index("departures_date_idx").on(t.date),
    index("departures_tour_id_idx").on(t.tourId),
  ]
);

export const departuresRelations = relations(departures, ({ one }) => ({
  tour: one(tours, {
    fields: [departures.tourId],
    references: [tours.id],
  }),
}));

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingCode: text("booking_code").notNull().unique(), // e.g. "JAS-ABC123"
    tourId: text("tour_id").notNull().references(() => tours.id),
    // Snapshots — admin price edits must never mutate past bookings.
    tourSlug: text("tour_slug").notNull(),
    tourTitle: text("tour_title").notNull(),
    variantId: text("variant_id"),
    variantName: text("variant_name").notNull(),
    departureDate: date("departure_date").notNull(), // YYYY-MM-DD
    guestCount: integer("guest_count").notNull(),
    customer: jsonb("customer").$type<BookingCustomer>().notNull(),
    unitPrice: bigint("unit_price", { mode: "number" }).notNull().default(0),
    subtotal: bigint("subtotal", { mode: "number" }).notNull().default(0),
    discount: bigint("discount", { mode: "number" }).notNull().default(0),
    vat: bigint("vat", { mode: "number" }).notNull().default(0),
    cardFee: bigint("card_fee", { mode: "number" }).notNull().default(0),
    totalAmount: bigint("total_amount", { mode: "number" }).notNull(),
    amountToPayNow: bigint("amount_to_pay_now", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("VND"),
    paymentPlan: paymentPlanEnum("payment_plan").notNull().default("full"),
    bookingStatus: bookingStatusEnum("booking_status").notNull().default("pending"),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    vnpayTxnRef: text("vnpay_txn_ref"),
    vnpayTransactionNo: text("vnpay_transaction_no"),
    vnpayResponseCode: text("vnpay_response_code"),
    vnpayTransactionStatus: text("vnpay_transaction_status"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bookings_tour_id_idx").on(t.tourId),
    index("bookings_departure_date_idx").on(t.departureDate),
    index("bookings_status_idx").on(t.bookingStatus),
    index("bookings_created_at_idx").on(t.createdAt),
  ]
);

export const bookingsRelations = relations(bookings, ({ many, one }) => ({
  addOns: many(bookingAddons),
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
  payments: many(payments),
}));

export const bookingAddons = pgTable(
  "booking_addons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    addonId: text("addon_id"),
    name: text("name").notNull(), // snapshot
    price: bigint("price", { mode: "number" }).notNull(), // snapshot
    perPerson: boolean("per_person").notNull().default(false), // snapshot
  },
  (t) => [index("booking_addons_booking_id_idx").on(t.bookingId)]
);

export const bookingAddonsRelations = relations(bookingAddons, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingAddons.bookingId],
    references: [bookings.id],
  }),
}));

// ---------------------------------------------------------------------------
// Payments (VNPay attempt audit log)
// ---------------------------------------------------------------------------

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "cascade",
    }),
    bookingCode: text("booking_code").notNull(), // snapshot for audit/UI
    txnRef: text("txn_ref").notNull().unique(), // vnp_TxnRef — unique per attempt
    amount: bigint("amount", { mode: "number" }).notNull(),
    method: text("method").notNull().default("vnpay"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    vnpayResponseCode: text("vnpay_response_code"),
    vnpayTransactionStatus: text("vnpay_transaction_status"),
    vnpayTransactionNo: text("vnpay_transaction_no"),
    raw: jsonb("raw").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("payments_booking_id_idx").on(t.bookingId),
    index("payments_booking_code_idx").on(t.bookingCode),
    index("payments_status_idx").on(t.status),
    index("payments_created_at_idx").on(t.createdAt),
  ]
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

// ---------------------------------------------------------------------------
// Blogs
// ---------------------------------------------------------------------------

/**
 * Canonical blog content is Tiptap JSON stored in `content_json`. `content_text`
 * is a derived plain-text version (search/SEO/excerpt fallback).
 */
export const blogs = pgTable(
  "blogs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    coverImageKey: text("cover_image_key"),
    contentJson: jsonb("content_json").$type<TiptapDoc>().notNull(),
    contentText: text("content_text"),
    status: blogStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    authorId: uuid("author_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("blogs_status_idx").on(t.status),
    index("blogs_featured_idx").on(t.featured),
    index("blogs_published_at_idx").on(t.publishedAt),
  ]
);

export const blogsRelations = relations(blogs, ({ one }) => ({
  author: one(adminUsers, {
    fields: [blogs.authorId],
    references: [adminUsers.id],
  }),
}));

// ---------------------------------------------------------------------------
// Promo codes
// ---------------------------------------------------------------------------

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(), // stored uppercase
    discountType: discountTypeEnum("discount_type").notNull().default("percent"),
    discountValue: bigint("discount_value", { mode: "number" }).notNull(),
    minSubtotal: bigint("min_subtotal", { mode: "number" }),
    maxRedemptions: integer("max_redemptions"),
    redemptions: integer("redemptions").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("promo_codes_active_idx").on(t.active)]
);

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(), // e.g. "r1"
    name: text("name").notNull(),
    rating: integer("rating").notNull().default(5),
    trip: text("trip"),
    quote: text("quote").notNull(),
    date: date("date"),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reviews_published_idx").on(t.published)]
);

// ---------------------------------------------------------------------------
// Site settings (single row, id = 1)
// ---------------------------------------------------------------------------

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  depositPercent: integer("deposit_percent").notNull().default(30),
  vatPercent: integer("vat_percent").notNull().default(8),
  cardFeePercent: integer("card_fee_percent").notNull().default(4),
  currency: text("currency").notNull().default("VND"),
  supportPhone: text("support_phone"),
  supportZalo: text("support_zalo"),
  supportEmail: text("support_email"),
  companyName: text("company_name"),
  companyAddress: text("company_address"),
  companyTaxId: text("company_tax_id"),
  companyWebsite: text("company_website"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Media library
// ---------------------------------------------------------------------------

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storageKey: text("storage_key").notNull().unique(),
    bucket: text("bucket").notNull().default("media"),
    mimeType: text("mime_type"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    alt: text("alt"),
    caption: text("caption"),
    uploadedBy: uuid("uploaded_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_created_at_idx").on(t.createdAt)]
);

// ---------------------------------------------------------------------------
// Shared JSONB shapes (kept in sync with src/types/domain.ts)
// ---------------------------------------------------------------------------

export interface ItineraryStop {
  id: string;
  title: string;
  time?: string;
  distanceKm?: number;
  description: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  summary: string;
  stops: ItineraryStop[];
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface BookingCustomer {
  fullName: string;
  phone: string;
  email?: string;
  zaloPhone?: string;
  nationality?: string;
  note?: string;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

export interface TiptapDoc {
  type: "doc";
  content: TiptapNode[];
}
