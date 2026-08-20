"use server";

import {
  DestinationAdminRepository,
  PromoAdminRepository,
  ReviewAdminRepository,
  SettingsAdminRepository,
  destinationInputSchema,
  promoInputSchema,
  reviewInputSchema,
  settingsInputSchema,
} from "./content";

/**
 * Server actions for admin content forms (promos, destinations, reviews,
 * settings). Defined at module level so they can be referenced from
 * `<form action={...}>` without capturing class instances or Zod schemas in a
 * closure — React must serialize server actions for progressive enhancement,
 * and instances/schemas are not serializable.
 */

export async function savePromo(formData: FormData) {
  const parsed = promoInputSchema.safeParse({
    code: formData.get("code"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minSubtotal: formData.get("minSubtotal") || null,
    maxRedemptions: formData.get("maxRedemptions") || null,
    expiresAt: formData.get("expiresAt") || null,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return;
  const repo = new PromoAdminRepository();
  const editId = formData.get("id");
  if (editId && String(editId)) {
    await repo.update(String(editId), parsed.data);
  } else {
    await repo.create(parsed.data);
  }
}

export async function deletePromo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await new PromoAdminRepository().delete(id);
}

export async function saveDestination(formData: FormData) {
  const parsed = destinationInputSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    tagline: formData.get("tagline") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return;
  const repo = new DestinationAdminRepository();
  const id = formData.get("id");
  if (id && String(id)) {
    await repo.update(String(id), parsed.data);
  } else {
    await repo.create(parsed.data);
  }
}

export async function deleteDestination(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await new DestinationAdminRepository().delete(id);
}

export async function saveReview(formData: FormData) {
  const parsed = reviewInputSchema.safeParse({
    name: formData.get("name"),
    rating: formData.get("rating"),
    trip: formData.get("trip") || undefined,
    quote: formData.get("quote"),
    date: formData.get("date") || undefined,
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return;
  const repo = new ReviewAdminRepository();
  const id = formData.get("id");
  if (id && String(id)) {
    await repo.update(String(id), parsed.data);
  } else {
    await repo.create(parsed.data);
  }
}

export async function deleteReview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await new ReviewAdminRepository().delete(id);
}

export async function saveSettings(formData: FormData) {
  const parsed = settingsInputSchema.safeParse({
    depositPercent: formData.get("depositPercent"),
    vatPercent: formData.get("vatPercent"),
    cardFeePercent: formData.get("cardFeePercent"),
    supportPhone: formData.get("supportPhone") || undefined,
    supportZalo: formData.get("supportZalo") || undefined,
    supportEmail: formData.get("supportEmail") || undefined,
    companyName: formData.get("companyName") || undefined,
    companyAddress: formData.get("companyAddress") || undefined,
    companyTaxId: formData.get("companyTaxId") || undefined,
    companyWebsite: formData.get("companyWebsite") || undefined,
  });
  if (!parsed.success) return;
  await new SettingsAdminRepository().update(parsed.data);
}
