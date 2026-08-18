# Jasmine Ha Giang — Rebuild Checklist

Rebuilding the Jasmine Ha Giang website as a premium Next.js + Tailwind + Motion experience.
Reference: `jasminehagiang.com/` (visual/content reference only).

- [x] Inspect reference and assets
- [x] Define visual direction
- [x] Navbar + Hero
- [x] Main landing sections
- [x] Tours + pricing + booking UI
- [x] Gallery + FAQ + footer
- [x] Blog listing
- [x] Blog detail
- [x] Mock blog repository
- [x] Firebase repository
- [x] Homepage blog preview
- [x] Responsive QA
- [x] Animation polish
- [x] Visual polish
- [x] Lint/typecheck/build

---

## Detailed Tasks

### Foundation
- [x] Inspect reference site structure, content, and assets
- [x] Copy reference images into `public/` (hero, tours, intro, gallery, services, videos)
- [x] Define design tokens in `app/globals.css` (Tailwind v4 `@theme`) per `DESIGN_SYSTEM.md`
- [x] Wire Fraunces + Inter via `next/font` in `app/layout.tsx`
- [x] Update `next.config.ts` for local images

### Data Layer
- [x] Extend `BlogPost` type (firebase fields: featured, status, createdAt, updatedAt)
- [x] `BlogRepository` interface + `MockBlogRepository` with realistic posts
- [x] `FirebaseBlogRepository` using `@firebase/firestore` + env vars
- [x] `getBlogRepository()` factory (mock fallback when no credentials)
- [x] Repository functions: list published, featured/latest, by slug, sorted `publishedAt DESC`

### Shared UI
- [x] `Container`, `Section`, `SectionHeader` (server components)
- [x] `Button`, `Badge` (shadcn-style primitives, pill radius)
- [x] Motion helpers: `Reveal`, `Stagger`, `useReducedMotion` guard
- [x] `SiteHeader` — sticky blur nav + mobile sheet
- [x] `SiteFooter`

### Landing Page
- [x] Cinematic hero — Ken Burns crossfade slideshow, text stagger, scroll indicator
- [x] Intro / "Welcome to Ha Giang Loop" section
- [x] Experience / strengths section
- [x] Tour packages (3D2N motorbike, 4D3N, Cao Bang, Jeep, SUV) with real VND pricing
- [x] Itinerary section (day-by-day from reference)
- [x] Services / transportation section
- [x] Video section
- [x] Gallery section
- [x] FAQ accordion
- [x] Blog preview (from repository)
- [x] Final CTA + footer

### Blog Pages
- [x] `/blogs` listing — hero, featured article, responsive cards
- [x] `/blogs/[slug]` — SEO metadata, editorial typography, related, CTA
- [x] `generateStaticParams` for blog slugs
- [x] `generateMetadata` for detail pages

### QA
- [x] Responsive QA at 375 / 768 / 1280 / 1440
- [x] prefers-reduced-motion support
- [x] Lint + typecheck + production build pass

---

## Tour Detail Page (`/tours/[slug]`)

- [x] Inspect existing tour UI/data/assets
- [x] Define Tour detail data model
- [x] Build Tour Hero
- [x] Build Overview + Highlights
- [x] Build Itinerary
- [x] Build Pricing + Inclusions
- [x] Build Services / Transport
- [x] Build Gallery
- [x] Build Booking CTA
- [x] Build Related Tours
- [x] Responsive QA
- [x] Animation + visual polish
- [x] Lint/typecheck/build

---

## Visual Polish + Animation Pass (UI improvement)

- [x] Audit whitespace and section density
- [x] Improve typography scale and hierarchy
- [x] Improve section transitions
- [x] Improve tour/card presentation
- [x] Upgrade animation choreography
- [x] Add subtle parallax / image reveals where appropriate
- [x] Polish hover and CTA micro-interactions
- [x] Mobile visual QA
- [x] Final desktop visual QA
- [x] Lint/typecheck/build

---

## Fix Homepage Animation + Header (fix-animation.md)

- [x] Audit homepage motion/reveal system
- [x] Fix reveal trigger timing
- [x] Remove nested/redundant animations
- [x] Fix hero transition/parallax
- [x] Replace header with transparent → floating glass behavior
- [x] Test desktop/mobile scroll behavior
- [x] Lint/typecheck/build

---

## Real Data + Full Booking Flow (integrate-api-and-booking.md)

- [x] Configure Firebase client/server
- [x] Connect blog pages to real Firestore data
- [x] Create Firestore booking/tour data model
- [x] Implement booking creation
- [x] Replace WhatsApp with Zalo
- [x] Integrate VNPay Sandbox
- [x] Implement payment return + IPN/webhook handling
- [x] Implement booking success/failure pages
- [x] Prevent price/status manipulation
- [x] Test full booking flow
- [x] Lint/typecheck/build
