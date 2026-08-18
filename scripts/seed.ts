/**
 * Idempotent Postgres seed — migrates the current static/Firebase seed data
 * into Supabase (Postgres + Storage + Auth).
 *
 * Usage:
 *   npm run db:seed
 *
 * Safe to run multiple times: child rows are replaced per parent, departures
 * are upserted on (tour_id, date), the admin user is created only if missing.
 *
 * Requires (from .env):
 *   DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY,
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
import "dotenv/config";

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { getAdminClient } from "@/lib/supabase/admin";
import { uploadMedia, ensureMediaBucket } from "@/lib/storage/media";
import { tours as seedToursData } from "@/lib/data/tours";
import { mockBlogPosts } from "@/lib/blogs/mock-blog-posts";
import {
  destinations as seedDestinations,
  promoCodes as seedPromoCodes,
  reviews as seedReviews,
  siteSettings as seedSettingsData,
} from "@/lib/data/settings";
import { markdownToTiptap } from "@/lib/blogs/tiptap";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function publicPathToKey(publicPath: string): string {
  // "/images/tours/layer-5301_1680436329.png.webp" → "tours/<slug>/layer-...webp"
  const parts = publicPath.replace(/^\/images\//, "").split("/");
  const filename = parts[parts.length - 1];
  const folder = parts[0] ?? "media"; // tours | intro | hero | gallery | ...
  return `${folder}/${filename}`;
}

async function uploadIfExists(
  publicPath: string,
  scope: string
): Promise<string | null> {
  if (!publicPath.startsWith("/images/")) return null;
  const abs = path.join(process.cwd(), "public", publicPath);
  if (!existsSync(abs)) return null;

  const baseKey = publicPathToKey(publicPath);
  const key = `${scope}/${baseKey}`;
  try {
    const buf = readFileSync(abs);
    const mime = buf[0] === 0xff && buf[1] === 0xd8
      ? "image/jpeg"
      : buf.toString("utf8", 0, 16).includes("PNG")
        ? "image/png"
        : "image/webp";
    await uploadMedia({
      key,
      buffer: buf,
      mimeType: mime,
      sizeBytes: buf.length,
      upsert: true,
    });
    return key;
  } catch (err) {
    console.warn(`  [skip] upload failed for ${publicPath}:`, (err as Error).message);
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

async function upsertDestination(d: (typeof seedDestinations)[number]) {
  const heroKey = await uploadIfExists(d.heroImage, "destinations");
  const [row] = await sql`
    insert into destinations (slug, name, tagline, description, hero_image_key, created_at, updated_at)
    values (${d.slug}, ${d.name}, ${d.tagline ?? null}, ${d.description ?? null}, ${heroKey ?? null}, ${nowIso()}, ${nowIso()})
    on conflict (slug) do update set
      name = excluded.name,
      tagline = excluded.tagline,
      description = excluded.description,
      hero_image_key = coalesce(excluded.hero_image_key, destinations.hero_image_key),
      updated_at = now()
    returning id
  `;
  return row.id as string;
}

// ---------------------------------------------------------------------------
// Seed tours (+ variants / add-ons / images / departures)
// ---------------------------------------------------------------------------

async function seedTours() {
  console.log("Seeding tours…");
  const destMap = new Map<string, string>();
  for (const d of seedDestinations) {
    const id = await upsertDestination(d);
    destMap.set(d.slug, id);
  }

  for (const tour of seedToursData) {
    const destinationId = destMap.get(tour.destinationSlug);
    if (!destinationId) {
      console.warn(`  [skip] ${tour.slug}: unknown destination ${tour.destinationSlug}`);
      continue;
    }

    const heroKey = await uploadIfExists(tour.heroImage, `tours/${tour.slug}`);

    await sql`
      insert into tours (
        id, slug, title, subtitle, description, overview, destination_id,
        start_location, end_location, duration_days, duration_nights, difficulty,
        group_size, vehicle, suitable_for, warnings, rating, review_count,
        from_price, hero_image_key, highlights, included, excluded,
        accommodation, transportation, meals, itinerary, faqs, booking_mode,
        status, featured, seo_title, seo_description, created_at, updated_at
      ) values (
        ${tour.id}, ${tour.slug}, ${tour.title}, ${tour.subtitle ?? null},
        ${tour.description ?? null}, ${tour.overview ?? null}, ${destinationId},
        ${tour.startLocation ?? null}, ${tour.endLocation ?? null},
        ${tour.durationDays}, ${tour.durationNights}, ${tour.difficulty},
        ${tour.groupSize ?? null}, ${tour.vehicle ?? null}, ${tour.suitableFor ?? null},
        ${JSON.stringify(tour.warnings ?? [])}, ${tour.rating}, ${tour.reviewCount},
        ${tour.fromPrice}, ${heroKey ?? null}, ${JSON.stringify(tour.highlights ?? [])},
        ${JSON.stringify(tour.included ?? [])}, ${JSON.stringify(tour.excluded ?? [])},
        ${tour.accommodation ?? null}, ${tour.transportation ?? null},
        ${tour.meals ?? null}, ${JSON.stringify(tour.itinerary ?? [])},
        ${JSON.stringify(tour.faqs ?? [])}, 'flexible',
        ${tour.published ? "published" : "draft"}, ${tour.featured},
        ${tour.seoTitle ?? null}, ${tour.seoDescription ?? null}, ${nowIso()}, ${nowIso()}
      )
      on conflict (id) do update set
        slug = excluded.slug, title = excluded.title, subtitle = excluded.subtitle,
        description = excluded.description, overview = excluded.overview,
        destination_id = excluded.destination_id, duration_days = excluded.duration_days,
        duration_nights = excluded.duration_nights, difficulty = excluded.difficulty,
        from_price = excluded.from_price,
        hero_image_key = coalesce(excluded.hero_image_key, tours.hero_image_key),
        highlights = excluded.highlights, included = excluded.included,
        excluded = excluded.excluded, itinerary = excluded.itinerary,
        faqs = excluded.faqs, status = excluded.status, featured = excluded.featured,
        updated_at = now()
    `;

    // Replace children (variants, add-ons, images).
    await sql`delete from tour_variants where tour_id = ${tour.id}`;
    for (const [i, v] of tour.variants.entries()) {
      await sql`
        insert into tour_variants (id, tour_id, name, description, price_type, base_price, attrs, max_group_size, position)
        values (
          ${v.id}, ${tour.id}, ${v.name}, ${v.description ?? null}, ${v.priceType},
          ${v.basePrice}, ${v.attrs ? JSON.stringify(v.attrs) : null},
          ${v.maxGroupSize ?? null}, ${i}
        )
      `;
    }

    await sql`delete from tour_addons where tour_id = ${tour.id}`;
    for (const [i, a] of tour.addOns.entries()) {
      await sql`
        insert into tour_addons (id, tour_id, name, description, price, per_person, position)
        values (${a.id}, ${tour.id}, ${a.name}, ${a.description ?? null}, ${a.price}, ${a.perPerson}, ${i})
      `;
    }

    await sql`delete from tour_images where tour_id = ${tour.id}`;
    for (const img of tour.images) {
      const key = await uploadIfExists(img.url, `tours/${tour.slug}`);
      if (!key) continue;
      await sql`
        insert into tour_images (id, tour_id, storage_key, alt, position)
        values (${img.id}, ${tour.id}, ${key}, ${img.alt ?? tour.title}, ${img.position})
        on conflict (id) do update set storage_key = excluded.storage_key, alt = excluded.alt, position = excluded.position
      `;
    }

    // Departures upsert on (tour_id, date).
    for (const dep of tour.departures) {
      await sql`
        insert into departures (tour_id, date, capacity, booked, status, created_at, updated_at)
        values (${tour.id}, ${dep.date}, ${dep.capacity}, ${dep.booked}, 'open', ${nowIso()}, ${nowIso()})
        on conflict (tour_id, date) do update set
          capacity = excluded.capacity, booked = excluded.booked, updated_at = now()
      `;
    }

    console.log(`  ✓ ${tour.slug} (${tour.variants.length} variants, ${tour.addOns.length} add-ons, ${tour.images.length} images, ${tour.departures.length} departures)`);
  }
}

// ---------------------------------------------------------------------------
// Seed blogs (markdown → Tiptap JSON)
// ---------------------------------------------------------------------------

async function seedBlogs() {
  console.log("Seeding blogs…");
  const admin = await getAdminUser();
  for (const post of mockBlogPosts) {
    const coverKey = await uploadIfExists(post.coverImage, `blogs/${post.slug}`);
    const contentJson = post.contentJson ?? markdownToTiptap(post.content);
    const contentText = post.contentText ?? post.content;

    await sql`
      insert into blogs (
        slug, title, excerpt, cover_image_key, content_json, content_text,
        status, featured, tags, author_id, author_name, seo_title, seo_description,
        published_at, created_at, updated_at
      ) values (
        ${post.slug}, ${post.title}, ${post.excerpt ?? null}, ${coverKey ?? null},
        ${JSON.stringify(contentJson)}, ${contentText ?? null},
        ${post.status}, ${post.featured}, ${JSON.stringify(post.tags ?? [])},
        ${admin?.id ?? null}, ${post.author ?? null},
        ${post.seoTitle ?? null}, ${post.seoDescription ?? null},
        ${post.publishedAt ? new Date(post.publishedAt).toISOString() : null},
        ${post.createdAt ? new Date(post.createdAt).toISOString() : null},
        ${post.updatedAt ? new Date(post.updatedAt).toISOString() : null}
      )
      on conflict (slug) do update set
        title = excluded.title, excerpt = excluded.excerpt,
        cover_image_key = coalesce(excluded.cover_image_key, blogs.cover_image_key),
        content_json = excluded.content_json, content_text = excluded.content_text,
        status = excluded.status, featured = excluded.featured, tags = excluded.tags,
        author_id = excluded.author_id, author_name = excluded.author_name,
        seo_title = excluded.seo_title, seo_description = excluded.seo_description,
        published_at = excluded.published_at, updated_at = now()
    `;
    console.log(`  ✓ ${post.slug}`);
  }
}

// ---------------------------------------------------------------------------
// Seed settings / promos / reviews
// ---------------------------------------------------------------------------

async function seedSettings() {
  console.log("Seeding settings, promos, reviews…");
  await sql`
    insert into site_settings (
      id, deposit_percent, vat_percent, card_fee_percent, currency,
      support_phone, support_zalo, support_email, updated_at
    ) values (
      1, ${seedSettingsData.depositPercent}, ${seedSettingsData.vatPercent},
      ${seedSettingsData.cardFeePercent}, ${seedSettingsData.currency},
      ${seedSettingsData.supportPhone ?? null}, ${seedSettingsData.supportWhatsapp ?? null},
      ${seedSettingsData.supportEmail ?? null}, ${nowIso()}
    )
    on conflict (id) do update set
      deposit_percent = excluded.deposit_percent,
      vat_percent = excluded.vat_percent,
      card_fee_percent = excluded.card_fee_percent,
      support_phone = coalesce(excluded.support_phone, site_settings.support_phone),
      support_zalo = coalesce(excluded.support_zalo, site_settings.support_zalo),
      support_email = coalesce(excluded.support_email, site_settings.support_email),
      updated_at = now()
  `;

  for (const promo of seedPromoCodes) {
    await sql`
      insert into promo_codes (
        code, discount_type, discount_value, min_subtotal, max_redemptions,
        redemptions, expires_at, active, created_at, updated_at
      ) values (
        ${promo.code}, ${promo.discountType}, ${promo.discountValue},
        ${promo.minSubtotal ?? null}, ${promo.maxRedemptions ?? null},
        ${promo.redemptions ?? 0}, ${promo.expiresAt ? new Date(promo.expiresAt).toISOString() : null},
        ${promo.active}, ${nowIso()}, ${nowIso()}
      )
      on conflict (code) do update set
        discount_type = excluded.discount_type,
        discount_value = excluded.discount_value,
        min_subtotal = excluded.min_subtotal,
        max_redemptions = excluded.max_redemptions,
        redemptions = excluded.redemptions,
        expires_at = excluded.expires_at,
        active = excluded.active,
        updated_at = now()
    `;
  }

  for (const review of seedReviews) {
    await sql`
      insert into reviews (id, name, rating, trip, quote, date, published, created_at, updated_at)
      values (
        ${review.id}, ${review.name}, ${review.rating}, ${review.trip ?? null},
        ${review.quote}, ${review.date ? new Date(review.date).toISOString() : null},
        true, ${nowIso()}, ${nowIso()}
      )
      on conflict (id) do update set
        name = excluded.name, rating = excluded.rating, trip = excluded.trip,
        quote = excluded.quote, date = excluded.date, updated_at = now()
    `;
  }
}

// ---------------------------------------------------------------------------
// Bootstrap admin (Supabase Auth + admin_users row)
// ---------------------------------------------------------------------------

async function getAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  if (!email) return null;
  const rows = await sql`select id from admin_users where email = ${email} limit 1`;
  return rows[0] ?? null;
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("  [skip] SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set");
    return;
  }

  console.log("Seeding admin user…");

  // Create Supabase Auth user if missing.
  const sb = getAdminClient();
  let authUserId: string;
  const { data: existing } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing?.users.find((u) => u.email === email);

  if (found) {
    authUserId = found.id;
    console.log(`  ✓ auth user exists (${found.id})`);
  } else {
    const { data: created, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      throw new Error(`Failed to create admin auth user: ${error.message}`);
    }
    authUserId = created.user.id;
    console.log(`  ✓ auth user created (${authUserId})`);
  }

  // Upsert admin_users row with super_admin role.
  await sql`
    insert into admin_users (auth_user_id, email, name, role, is_active, created_at, updated_at)
    values (${authUserId}, ${email}, ${"Super Admin"}, 'super_admin', true, ${nowIso()}, ${nowIso()})
    on conflict (auth_user_id) do update set
      email = excluded.email, role = 'super_admin', is_active = true, updated_at = now()
  `;
  console.log(`  ✓ admin_users row (super_admin) for ${email}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("== Jasmine Tours — Supabase seed ==");
  await ensureMediaBucket();
  await seedTours();
  await seedBlogs();
  await seedSettings();
  await seedAdmin();

  const counts = await sql`
    select
      (select count(*) from tours) as tours,
      (select count(*) from blogs) as blogs,
      (select count(*) from destinations) as destinations,
      (select count(*) from promo_codes) as promos,
      (select count(*) from reviews) as reviews,
      (select count(*) from departures) as departures,
      (select count(*) from admin_users) as admins
  `;
  console.log("\n== Seed summary ==");
  for (const [k, v] of Object.entries(counts[0])) console.log(`  ${k}: ${v}`);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end().catch(() => {});
  });
