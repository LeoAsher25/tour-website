import "server-only";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  destinations,
  media,
  promoCodes,
  reviews,
  siteSettings,
} from "@/lib/db/schema";
import { deleteMedia, uploadMedia } from "@/lib/storage/media";

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export const promoInputSchema = z.object({
  code: z.string().min(1, "Code is required").transform((v) => v.trim().toUpperCase()),
  discountType: z.enum(["percent", "fixed"]).default("percent"),
  discountValue: z.coerce.number().int().min(0),
  minSubtotal: z.coerce.number().int().min(0).optional().nullable(),
  maxRedemptions: z.coerce.number().int().min(0).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type PromoInput = z.infer<typeof promoInputSchema>;

export class PromoAdminRepository {
  async list() {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.updatedAt));
  }

  async create(input: PromoInput) {
    await db.insert(promoCodes).values({
      code: input.code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minSubtotal: input.minSubtotal ?? null,
      maxRedemptions: input.maxRedemptions ?? null,
      redemptions: 0,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      active: input.active,
    });
    revalidatePath("/admin/promotions");
  }

  async update(id: string, input: PromoInput) {
    await db
      .update(promoCodes)
      .set({
        code: input.code,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minSubtotal: input.minSubtotal ?? null,
        maxRedemptions: input.maxRedemptions ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        active: input.active,
        updatedAt: new Date(),
      })
      .where(eq(promoCodes.id, id));
    revalidatePath("/admin/promotions");
  }

  async delete(id: string) {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
    revalidatePath("/admin/promotions");
  }
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

export const destinationInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  name: z.string().min(1, "Name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  heroImageKey: z.string().optional().nullable(),
});

export type DestinationInput = z.infer<typeof destinationInputSchema>;

export class DestinationAdminRepository {
  async list() {
    return db.select().from(destinations).orderBy(desc(destinations.name));
  }

  async create(input: DestinationInput) {
    await db.insert(destinations).values({
      slug: input.slug,
      name: input.name,
      tagline: input.tagline ?? null,
      description: input.description ?? null,
      heroImageKey: input.heroImageKey ?? null,
    });
    revalidatePath("/admin/destinations");
    revalidatePath("/", "page");
  }

  async update(id: string, input: DestinationInput) {
    await db
      .update(destinations)
      .set({
        slug: input.slug,
        name: input.name,
        tagline: input.tagline ?? null,
        description: input.description ?? null,
        heroImageKey: input.heroImageKey ?? null,
        updatedAt: new Date(),
      })
      .where(eq(destinations.id, id));
    revalidatePath("/admin/destinations");
    revalidatePath("/", "page");
  }

  async delete(id: string) {
    await db.delete(destinations).where(eq(destinations.id, id));
    revalidatePath("/admin/destinations");
    revalidatePath("/", "page");
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const reviewInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rating: z.coerce.number().int().min(1).max(5),
  trip: z.string().optional(),
  quote: z.string().min(1, "Quote is required"),
  date: z.string().optional(),
  published: z.boolean().default(true),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

export class ReviewAdminRepository {
  async list() {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async create(input: ReviewInput) {
    await db.insert(reviews).values({
      id: `r-${crypto.randomUUID().slice(0, 8)}`,
      name: input.name,
      rating: input.rating,
      trip: input.trip ?? null,
      quote: input.quote,
      date: input.date || null,
      published: input.published,
    });
    revalidatePath("/admin/reviews");
    revalidatePath("/", "page");
  }

  async update(id: string, input: ReviewInput) {
    await db
      .update(reviews)
      .set({
        name: input.name,
        rating: input.rating,
        trip: input.trip ?? null,
        quote: input.quote,
        date: input.date || null,
        published: input.published,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id));
    revalidatePath("/admin/reviews");
    revalidatePath("/", "page");
  }

  async setPublished(id: string, published: boolean) {
    await db
      .update(reviews)
      .set({ published, updatedAt: new Date() })
      .where(eq(reviews.id, id));
    revalidatePath("/admin/reviews");
    revalidatePath("/", "page");
  }

  async delete(id: string) {
    await db.delete(reviews).where(eq(reviews.id, id));
    revalidatePath("/admin/reviews");
    revalidatePath("/", "page");
  }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const settingsInputSchema = z.object({
  depositPercent: z.coerce.number().int().min(0).max(100),
  vatPercent: z.coerce.number().int().min(0).max(100),
  cardFeePercent: z.coerce.number().int().min(0).max(100),
  supportPhone: z.string().optional(),
  supportZalo: z.string().optional(),
  supportEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyTaxId: z.string().optional(),
  companyWebsite: z.string().optional(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export class SettingsAdminRepository {
  async get() {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? null;
  }

  async update(input: SettingsInput) {
    await db
      .insert(siteSettings)
      .values({
        id: 1,
        depositPercent: input.depositPercent,
        vatPercent: input.vatPercent,
        cardFeePercent: input.cardFeePercent,
        supportPhone: input.supportPhone ?? null,
        supportZalo: input.supportZalo ?? null,
        supportEmail: input.supportEmail || null,
        companyName: input.companyName ?? null,
        companyAddress: input.companyAddress ?? null,
        companyTaxId: input.companyTaxId ?? null,
        companyWebsite: input.companyWebsite ?? null,
      })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          depositPercent: input.depositPercent,
          vatPercent: input.vatPercent,
          cardFeePercent: input.cardFeePercent,
          supportPhone: input.supportPhone ?? null,
          supportZalo: input.supportZalo ?? null,
          supportEmail: input.supportEmail || null,
          companyName: input.companyName ?? null,
          companyAddress: input.companyAddress ?? null,
          companyTaxId: input.companyTaxId ?? null,
          companyWebsite: input.companyWebsite ?? null,
          updatedAt: new Date(),
        },
      });
    revalidatePath("/admin/settings");
    revalidatePath("/", "page");
    revalidatePath("/checkout/[slug]", "page");
    revalidatePath("/booking/[bookingCode]", "page");
  }
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export class MediaAdminRepository {
  async list() {
    return db.select().from(media).orderBy(desc(media.createdAt));
  }

  async delete(id: string) {
    const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (rows.length === 0) return;
    await deleteMedia(rows[0].storageKey).catch(() => {
      // Storage delete failure shouldn't block DB cleanup.
    });
    await db.delete(media).where(eq(media.id, id));
    revalidatePath("/admin/media");
  }
}

export { uploadMedia };
