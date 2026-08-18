CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'editor');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."booking_mode" AS ENUM('scheduled', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'awaiting_payment', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."departure_status" AS ENUM('open', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'moderate', 'challenging', 'expert');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('vnpay', 'zalo_manual');--> statement-breakpoint
CREATE TYPE "public"."payment_plan" AS ENUM('deposit', 'full');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'paid', 'failed', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('per_person', 'per_group');--> statement-breakpoint
CREATE TYPE "public"."tour_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "admin_role" DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"cover_image_key" text,
	"content_json" jsonb NOT NULL,
	"content_text" text,
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author_id" uuid,
	"author_name" text,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "booking_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"addon_id" text,
	"name" text NOT NULL,
	"price" bigint NOT NULL,
	"per_person" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_code" text NOT NULL,
	"tour_id" text NOT NULL,
	"tour_slug" text NOT NULL,
	"tour_title" text NOT NULL,
	"variant_id" text,
	"variant_name" text NOT NULL,
	"departure_date" date NOT NULL,
	"guest_count" integer NOT NULL,
	"customer" jsonb NOT NULL,
	"unit_price" bigint DEFAULT 0 NOT NULL,
	"subtotal" bigint DEFAULT 0 NOT NULL,
	"discount" bigint DEFAULT 0 NOT NULL,
	"vat" bigint DEFAULT 0 NOT NULL,
	"card_fee" bigint DEFAULT 0 NOT NULL,
	"total_amount" bigint NOT NULL,
	"amount_to_pay_now" bigint NOT NULL,
	"currency" text DEFAULT 'VND' NOT NULL,
	"payment_plan" "payment_plan" DEFAULT 'full' NOT NULL,
	"booking_status" "booking_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"vnpay_txn_ref" text,
	"vnpay_transaction_no" text,
	"vnpay_response_code" text,
	"vnpay_transaction_status" text,
	"paid_at" timestamp with time zone,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_code_unique" UNIQUE("booking_code")
);
--> statement-breakpoint
CREATE TABLE "departures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" text NOT NULL,
	"date" date NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"booked" integer DEFAULT 0 NOT NULL,
	"status" "departure_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"description" text,
	"hero_image_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"bucket" text DEFAULT 'media' NOT NULL,
	"mime_type" text,
	"size_bytes" bigint,
	"alt" text,
	"caption" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"booking_code" text NOT NULL,
	"txn_ref" text NOT NULL,
	"amount" bigint NOT NULL,
	"method" text DEFAULT 'vnpay' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"vnpay_response_code" text,
	"vnpay_transaction_status" text,
	"vnpay_transaction_no" text,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_txn_ref_unique" UNIQUE("txn_ref")
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" "discount_type" DEFAULT 'percent' NOT NULL,
	"discount_value" bigint NOT NULL,
	"min_subtotal" bigint,
	"max_redemptions" integer,
	"redemptions" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"trip" text,
	"quote" text NOT NULL,
	"date" date,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"deposit_percent" integer DEFAULT 30 NOT NULL,
	"vat_percent" integer DEFAULT 8 NOT NULL,
	"card_fee_percent" integer DEFAULT 4 NOT NULL,
	"currency" text DEFAULT 'VND' NOT NULL,
	"support_phone" text,
	"support_zalo" text,
	"support_email" text,
	"company_name" text,
	"company_address" text,
	"company_tax_id" text,
	"company_website" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_addons" (
	"id" text PRIMARY KEY NOT NULL,
	"tour_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" bigint NOT NULL,
	"per_person" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_images" (
	"id" text PRIMARY KEY NOT NULL,
	"tour_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"alt" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"tour_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_type" "price_type" DEFAULT 'per_person' NOT NULL,
	"base_price" bigint NOT NULL,
	"attrs" jsonb,
	"max_group_size" integer,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"overview" text,
	"destination_id" uuid NOT NULL,
	"start_location" text,
	"end_location" text,
	"duration_days" integer DEFAULT 0 NOT NULL,
	"duration_nights" integer DEFAULT 0 NOT NULL,
	"difficulty" "difficulty" DEFAULT 'easy' NOT NULL,
	"group_size" text,
	"vehicle" text,
	"suitable_for" text,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"from_price" bigint DEFAULT 0 NOT NULL,
	"hero_image_key" text,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"included" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"excluded" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"accommodation" text,
	"transportation" text,
	"meals" text,
	"itinerary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"booking_mode" "booking_mode" DEFAULT 'flexible' NOT NULL,
	"status" "tour_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tours_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_admin_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_admin_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_addons" ADD CONSTRAINT "tour_addons_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_images" ADD CONSTRAINT "tour_images_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_variants" ADD CONSTRAINT "tour_variants_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_users_role_idx" ON "admin_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "blogs_status_idx" ON "blogs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blogs_featured_idx" ON "blogs" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "blogs_published_at_idx" ON "blogs" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "booking_addons_booking_id_idx" ON "booking_addons" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookings_tour_id_idx" ON "bookings" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "bookings_departure_date_idx" ON "bookings" USING btree ("departure_date");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("booking_status");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "departures_tour_date_uq" ON "departures" USING btree ("tour_id","date");--> statement-breakpoint
CREATE INDEX "departures_date_idx" ON "departures" USING btree ("date");--> statement-breakpoint
CREATE INDEX "departures_tour_id_idx" ON "departures" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "destinations_slug_idx" ON "destinations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_booking_id_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_booking_code_idx" ON "payments" USING btree ("booking_code");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "promo_codes_active_idx" ON "promo_codes" USING btree ("active");--> statement-breakpoint
CREATE INDEX "reviews_published_idx" ON "reviews" USING btree ("published");--> statement-breakpoint
CREATE INDEX "tour_addons_tour_id_idx" ON "tour_addons" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_images_tour_id_idx" ON "tour_images" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_images_position_idx" ON "tour_images" USING btree ("tour_id","position");--> statement-breakpoint
CREATE INDEX "tour_variants_tour_id_idx" ON "tour_variants" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tours_destination_id_idx" ON "tours" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "tours_featured_idx" ON "tours" USING btree ("featured");