-- Supabase RLS policies (defense-in-depth).
-- The app reads/writes via the service role (bypasses RLS) for admin ops, and
-- uses the publishable key + RLS for public reads where applicable.
-- Public policy: published content only. Admin: role-based via admin_users.
--
-- This file is idempotent: safe to re-run. It is applied via `npm run db:rls`
-- (scripts/apply-rls.ts), which executes it as a single SQL script.

-- ---------------------------------------------------------------------------
-- Helper: current admin role for the requesting Supabase Auth user
-- ---------------------------------------------------------------------------

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text
  from public.admin_users
  where auth_user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------

alter table public.destinations enable row level security;

drop policy if exists "destinations_public_read" on public.destinations;
create policy "destinations_public_read"
  on public.destinations for select
  using (true);

drop policy if exists "destinations_admin_write" on public.destinations;
create policy "destinations_admin_write"
  on public.destinations for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));

-- ---------------------------------------------------------------------------
-- tours
-- ---------------------------------------------------------------------------

alter table public.tours enable row level security;

drop policy if exists "tours_public_read_published" on public.tours;
create policy "tours_public_read_published"
  on public.tours for select
  using (status = 'published');

drop policy if exists "tours_admin_read_all" on public.tours;
create policy "tours_admin_read_all"
  on public.tours for select
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "tours_admin_write" on public.tours;
create policy "tours_admin_write"
  on public.tours for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- tour_variants / tour_addons / tour_images (inherit via tour status)
-- ---------------------------------------------------------------------------

alter table public.tour_variants enable row level security;
alter table public.tour_addons enable row level security;
alter table public.tour_images enable row level security;

drop policy if exists "tour_children_public_read" on public.tour_variants;
create policy "tour_children_public_read"
  on public.tour_variants for select
  using (exists (
    select 1 from public.tours t where t.id = tour_id and t.status = 'published'
  ));

drop policy if exists "tour_children_admin_read" on public.tour_variants;
create policy "tour_children_admin_read"
  on public.tour_variants for select
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "tour_children_admin_write" on public.tour_variants;
create policy "tour_children_admin_write"
  on public.tour_variants for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "tour_addons_public_read" on public.tour_addons;
create policy "tour_addons_public_read"
  on public.tour_addons for select
  using (exists (
    select 1 from public.tours t where t.id = tour_id and t.status = 'published'
  ));

drop policy if exists "tour_addons_admin_read" on public.tour_addons;
create policy "tour_addons_admin_read"
  on public.tour_addons for select
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "tour_addons_admin_write" on public.tour_addons;
create policy "tour_addons_admin_write"
  on public.tour_addons for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "tour_images_public_read" on public.tour_images;
create policy "tour_images_public_read"
  on public.tour_images for select
  using (exists (
    select 1 from public.tours t where t.id = tour_id and t.status = 'published'
  ));

drop policy if exists "tour_images_admin_read" on public.tour_images;
create policy "tour_images_admin_read"
  on public.tour_images for select
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "tour_images_admin_write" on public.tour_images;
create policy "tour_images_admin_write"
  on public.tour_images for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- departures
-- ---------------------------------------------------------------------------

alter table public.departures enable row level security;

drop policy if exists "departures_public_read" on public.departures;
create policy "departures_public_read"
  on public.departures for select
  using (status = 'open' and exists (
    select 1 from public.tours t where t.id = tour_id and t.status = 'published'
  ));

drop policy if exists "departures_admin_read" on public.departures;
create policy "departures_admin_read"
  on public.departures for select
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "departures_admin_write" on public.departures;
create policy "departures_admin_write"
  on public.departures for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- bookings / booking_addons / payments (never public; admin only)
-- ---------------------------------------------------------------------------

alter table public.bookings enable row level security;
alter table public.booking_addons enable row level security;
alter table public.payments enable row level security;

drop policy if exists "bookings_admin_access" on public.bookings;
create policy "bookings_admin_access"
  on public.bookings for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "booking_addons_admin_access" on public.booking_addons;
create policy "booking_addons_admin_access"
  on public.booking_addons for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "payments_admin_access" on public.payments;
create policy "payments_admin_access"
  on public.payments for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- blogs
-- ---------------------------------------------------------------------------

alter table public.blogs enable row level security;

drop policy if exists "blogs_public_read_published" on public.blogs;
create policy "blogs_public_read_published"
  on public.blogs for select
  using (status = 'published');

drop policy if exists "blogs_admin_read_all" on public.blogs;
create policy "blogs_admin_read_all"
  on public.blogs for select
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

drop policy if exists "blogs_admin_write" on public.blogs;
create policy "blogs_admin_write"
  on public.blogs for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

-- ---------------------------------------------------------------------------
-- promo_codes / reviews / site_settings / media / admin_users
-- ---------------------------------------------------------------------------

alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_public_read_active" on public.promo_codes;
create policy "promo_codes_public_read_active"
  on public.promo_codes for select
  using (active = true);

drop policy if exists "promo_codes_admin_access" on public.promo_codes;
create policy "promo_codes_admin_access"
  on public.promo_codes for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));

alter table public.reviews enable row level security;

drop policy if exists "reviews_public_read_published" on public.reviews;
create policy "reviews_public_read_published"
  on public.reviews for select
  using (published = true);

drop policy if exists "reviews_admin_access" on public.reviews;
create policy "reviews_admin_access"
  on public.reviews for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));

alter table public.media enable row level security;

drop policy if exists "media_public_read" on public.media;
create policy "media_public_read"
  on public.media for select
  using (true);

drop policy if exists "media_admin_write" on public.media;
create policy "media_admin_write"
  on public.media for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));

alter table public.admin_users enable row level security;

-- Admin users may only read their own row via the public key; management of
-- admin_users happens via the service role (server-side) only.
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
  on public.admin_users for select
  using (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: media bucket policies
-- ---------------------------------------------------------------------------

-- Public bucket: anyone can read objects; only admins can upload/delete.
drop policy if exists "media_storage_public_read" on storage.objects;
create policy "media_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media_storage_admin_insert" on storage.objects;
create policy "media_storage_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  );

drop policy if exists "media_storage_admin_update" on storage.objects;
create policy "media_storage_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  )
  with check (
    bucket_id = 'media'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  );

drop policy if exists "media_storage_admin_delete" on storage.objects;
create policy "media_storage_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  );
