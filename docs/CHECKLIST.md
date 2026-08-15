# Project Implementation Checklist

## Phase 1 — Research

- [ ] Analyze Jasmine Ha Giang website structure
- [ ] Research Airbnb Experiences patterns
- [ ] Study premium adventure travel sites
- [ ] Document information architecture
- [ ] Document booking UX patterns
- [ ] Document tour detail structure
- [ ] Document storytelling patterns
- [ ] Create `docs/RESEARCH.md`

## Phase 2 — Design System

- [ ] Create `DESIGN_SYSTEM.md` with:
  - [ ] Brand personality
  - [ ] Color palette (warm ivory, forest green, terracotta)
  - [ ] Typography (editorial serif + modern sans)
  - [ ] Spacing scale
  - [ ] Border radius
  - [ ] Shadows
  - [ ] Button styles
  - [ ] Form styles
  - [ ] Tour card design
  - [ ] Booking card design
  - [ ] Image treatment
  - [ ] Hover states
  - [ ] Animation rules
  - [ ] Responsive rules
  - [ ] Accessibility guidelines
- [ ] Create `AGENTS.md` with design rules

## Phase 3 — Foundation & Setup

- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Install Motion (Framer Motion)
- [ ] Install Magic UI
- [ ] Configure Supabase client
- [ ] Set up project structure
- [ ] Create base components:
  - [ ] Navbar
  - [ ] Container
  - [ ] Section
  - [ ] SectionHeader
  - [ ] Button
  - [ ] TourCard
  - [ ] ImageCard
  - [ ] BookingCard
  - [ ] Badge
  - [ ] Footer

## Phase 4 — Homepage

- [ ] Implement Cinematic Hero section
- [ ] Implement Popular Experiences section
- [ ] Implement Why Ha Giang? section
- [ ] Implement Visual Storytelling section
- [ ] Implement Featured Tours section
- [ ] Implement The Journey section
- [ ] Implement Local Culture section
- [ ] Implement Why Travel With Us? section
- [ ] Implement Reviews section
- [ ] Implement Travel Stories section
- [ ] Implement Final CTA section
- [ ] Screenshot desktop (1440px)
- [ ] Screenshot mobile (~390px)
- [ ] Self-critique UI
- [ ] Refine based on critique
- [ ] Final screenshots

## Phase 5 — Tour Detail Page

- [ ] Implement Hero/Gallery
- [ ] Implement Tour header (title, rating, duration, location, price)
- [ ] Implement Overview section
- [ ] Implement Highlights section
- [ ] Implement Itinerary timeline
- [ ] Implement What's included/excluded
- [ ] Implement Gallery section
- [ ] Implement Accommodation section
- [ ] Implement Transportation section
- [ ] Implement Meals section
- [ ] Implement Reviews section
- [ ] Implement FAQ section
- [ ] Implement Related tours section
- [ ] Implement Sticky Booking Card (desktop)
- [ ] Implement Sticky bottom bar (mobile)
- [ ] Screenshot desktop + mobile
- [ ] Critique and refine

## Phase 6 — Booking Flow

- [ ] Create booking flow pages
- [ ] Implement guest checkout (no signup required)
- [ ] Implement date selection
- [ ] Implement guest count selection
- [ ] Implement package selection
- [ ] Implement extras/add-ons selection
- [ ] Implement customer information form
- [ ] Implement booking summary (sticky on desktop)
- [ ] Implement sticky button (mobile)
- [ ] Test full booking flow

## Phase 7 — Database Schema

- [ ] Create Supabase project
- [ ] Create `profiles` table
- [ ] Create `tours` table
- [ ] Create `tour_variants` table
- [ ] Create `tour_images` table
- [ ] Create `itinerary_days` table
- [ ] Create `itinerary_stops` table
- [ ] Create `add_ons` table
- [ ] Create `tour_add_ons` table
- [ ] Create `tour_departures` table
- [ ] Create `bookings` table
- [ ] Create `booking_items` table
- [ ] Create `payments` table
- [ ] Create `promo_codes` table
- [ ] Create `reviews` table
- [ ] Create `blog_posts` table
- [ ] Create `faqs` table
- [ ] Create `site_settings` table
- [ ] Configure RLS policies
- [ ] Test RLS policies

## Phase 8 — Pricing Engine

- [ ] Create `src/lib/pricing/` module
- [ ] Implement base price calculation
- [ ] Implement per-person pricing
- [ ] Implement per-group pricing
- [ ] Implement add-ons calculation
- [ ] Implement promo code validation
- [ ] Implement deposit calculation
- [ ] Implement price snapshot storage
- [ ] Create server-side pricing API
- [ ] Test pricing calculations

## Phase 9 — VNPay Integration

- [ ] Create `src/lib/vnpay/` module
- [ ] Implement VNPay URL generation
- [ ] Implement signature generation
- [ ] Implement signature verification
- [ ] Create payment creation endpoint
- [ ] Create VNPay return URL handler
- [ ] Create VNPay IPN handler
- [ ] Implement idempotent payment updates
- [ ] Test VNPay sandbox flow
- [ ] Test deposit payment
- [ ] Test full payment

## Phase 10 — Admin Panel

- [ ] Set up Supabase Auth
- [ ] Create admin layout
- [ ] Create Dashboard page
- [ ] Create Tours CRUD
- [ ] Create Itinerary management
- [ ] Create Packages management
- [ ] Create Extras management
- [ ] Create Departures management
- [ ] Create Bookings management
- [ ] Create Payments view
- [ ] Create Promo Codes management
- [ ] Create Blog management
- [ ] Create Media library
- [ ] Create Settings page

## Phase 11 — Remaining Public Pages

- [ ] Create `/tours` listing page
- [ ] Create `/destinations/[slug]` page
- [ ] Create `/booking/result` page
- [ ] Create `/booking/lookup` page
- [ ] Create `/blog` listing page
- [ ] Create `/blog/[slug]` page
- [ ] Create `/about` page
- [ ] Create `/contact` page
- [ ] Create `/faq` page
- [ ] Create `/terms` page
- [ ] Create `/privacy` page
- [ ] Create `/cancellation-policy` page

## Phase 12 — Motion & Magic UI Pass

- [ ] Add Motion animations to homepage
- [ ] Add Motion animations to tour detail
- [ ] Add Motion animations to booking flow
- [ ] Add Magic UI components (sparingly, ~5%)
- [ ] Test animations on mobile
- [ ] Respect `prefers-reduced-motion`

## Phase 13 — SEO & Performance

- [ ] Configure Next.js Metadata API
- [ ] Generate sitemap.xml
- [ ] Create robots.txt
- [ ] Add canonical URLs
- [ ] Add OpenGraph tags
- [ ] Add structured data (JSON-LD)
- [ ] Optimize images with next/image
- [ ] Implement lazy loading
- [ ] Optimize fonts
- [ ] Test LCP scores
- [ ] Test CLS scores
- [ ] Test INP scores
- [ ] Run Lighthouse audit

## Phase 14 — Final QA

- [ ] Test all booking flows
- [ ] Test payment flows (deposit + full)
- [ ] Test promo codes
- [ ] Test RLS policies
- [ ] Test admin CRUD operations
- [ ] Test responsive design (all breakpoints)
- [ ] Test accessibility (keyboard navigation)
- [ ] Test accessibility (screen readers)
- [ ] Build production bundle
- [ ] Test production build locally
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Verify all environment variables
- [ ] Final visual QA

## Definition of Done

- [ ] UI premium và responsive
- [ ] Homepage polished
- [ ] Tour Detail polished
- [ ] Booking guest checkout hoạt động
- [ ] Pricing server-side
- [ ] Promo/deposit hoạt động
- [ ] Supabase/RLS hoạt động
- [ ] Booking lưu DB
- [ ] VNPay Sandbox hoạt động
- [ ] Return + IPN hoạt động
- [ ] Payment idempotent
- [ ] Admin CRUD tour/booking hoạt động
- [ ] Blog hoạt động
- [ ] SEO cơ bản hoàn chỉnh
- [ ] Build/test pass
- [ ] Deploy được Vercel
