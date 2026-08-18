// Core domain types. Money is always BIGINT VND — represented here as `number`
// but always integer VND (never floats, never cents).

export type Money = number; // integer VND

export type Difficulty = "easy" | "moderate" | "challenging" | "expert";

export type PriceType = "per_person" | "per_group";

export type PaymentPlan = "deposit" | "full";

export type BookingStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export interface TourImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

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

export interface TourVariant {
  id: string;
  name: string; // "Self Riding", "Easy Rider", "Private Tour", "SUV / Jeep"
  description: string;
  priceType: PriceType;
  basePrice: Money; // per person OR per group depending on priceType
  // Flexible attributes to cover rider type / PAX / duration / hotel-class combos
  attrs?: Record<string, string>;
  maxGroupSize?: number;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: Money;
  perPerson: boolean; // true = price × guests, false = flat
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  trip: string;
  quote: string;
  date: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Departure {
  id: string;
  date: string; // ISO date
  capacity: number;
  booked: number;
}

export interface Tour {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  destination: string;
  destinationSlug: string;
  startLocation: string;
  endLocation: string;
  durationDays: number;
  durationNights: number;
  difficulty: Difficulty;
  groupSize?: string;
  vehicle?: string;
  suitableFor: string;
  warnings?: string[];
  rating: number;
  reviewCount: number;
  fromPrice: Money;
  heroImage: string;
  images: TourImage[];
  highlights: string[];
  included: string[];
  excluded: string[];
  accommodation: string;
  transportation: string;
  meals: string;
  itinerary: ItineraryDay[];
  variants: TourVariant[];
  addOns: AddOn[];
  faqs: Faq[];
  departures: Departure[];
  bookingMode?: "scheduled" | "flexible";
  featured: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PromoCode {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number; // percent (0-100) or fixed VND
  minSubtotal?: Money;
  maxRedemptions?: number;
  redemptions: number;
  expiresAt?: string;
  active: boolean;
}

export interface Destination {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
}

export type BlogStatus = "draft" | "published" | "archived";

/** Tiptap JSON document — the canonical blog content format. */
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

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string; // public URL (derived from storage key at render time)
  coverImageKey?: string;
  contentJson: TiptapDoc;
  contentText?: string;
  content: string; // legacy plain-text/markdown-ish fallback (derived from contentText)
  author: string;
  authorId?: string;
  tags: string[];
  featured: boolean;
  status: BlogStatus;
  publishedAt: string; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  readingMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SiteSettings {
  depositPercent: number; // e.g. 30
  vatPercent: number; // e.g. 8
  cardFeePercent: number; // e.g. 4
  currency: "VND";
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
}

// ---- Booking request/response (server-side pricing contract) ----

export interface BookingSelectionInput {
  tourId: string;
  variantId: string;
  departureId?: string;
  startDate: string;
  guestCount: number;
  addOnIds: string[];
  promoCode?: string;
  paymentPlan: PaymentPlan;
  payByCard?: boolean;
}

export interface PriceLineItem {
  label: string;
  amount: Money;
  meta?: string;
}

export interface PriceBreakdown {
  lineItems: PriceLineItem[];
  subtotal: Money;
  discount: Money;
  vat: Money;
  cardFee: Money;
  total: Money;
  depositDue: Money;
  remaining: Money;
  amountToPayNow: Money;
  currency: "VND";
}

// ---- Booking / Payment (Firestore) ----

export type PaymentMethod = "vnpay" | "zalo/manual";

export interface BookingCustomer {
  fullName: string;
  phone: string;
  email?: string;
  zaloPhone?: string;
  nationality?: string;
  note?: string;
}

export interface BookingPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  // VNPay-only fields, populated after payment attempts
  vnpayTxnRef?: string;
  vnpayTransactionNo?: string;
  vnpayResponseCode?: string;
  vnpayTransactionStatus?: string;
  paidAt?: string; // ISO
}

export interface Booking {
  bookingCode: string;
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  variant: string; // variant name (snapshot)
  variantId: string;
  departureDate: string; // YYYY-MM-DD
  guestCount: number;
  addOns: { id: string; name: string; price: Money; perPerson: boolean }[];
  customer: BookingCustomer;
  unitPrice: Money; // variant base price per person (or per group)
  subtotal: Money;
  discount: Money;
  vat: Money;
  cardFee: Money;
  totalAmount: Money;
  amountToPayNow: Money;
  currency: "VND";
  paymentPlan: PaymentPlan;
  bookingStatus: BookingStatus;
  payment: BookingPayment;
  internalNotes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** A VNPay payment attempt / transaction record (audit log). */
export interface PaymentTransaction {
  id?: string;
  bookingCode: string;
  txnRef: string; // vnp_TxnRef (unique per attempt)
  amount: Money;
  method: "vnpay";
  status: PaymentStatus;
  vnpayResponseCode?: string;
  vnpayTransactionStatus?: string;
  vnpayTransactionNo?: string;
  raw?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---- Admin / media ----

export type AdminRole = "super_admin" | "admin" | "editor";

export interface AdminUser {
  id: string;
  authUserId: string;
  email: string;
  name?: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  storageKey: string;
  bucket: string;
  mimeType?: string;
  sizeBytes?: number;
  alt?: string;
  caption?: string;
  createdAt: string;
}
