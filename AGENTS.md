<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design & Engineering Rules

Follow these strictly on every change.

## Design
- Follow `DESIGN_SYSTEM.md` strictly.
- Avoid generic SaaS design.
- Photography is a first-class design element.
- Prefer shadcn/ui for functional UI.
- Use Motion subtly.
- Use Magic UI sparingly (~5%).
- Avoid unnecessary gradient/glow/glassmorphism.
- Prioritize whitespace and typography.
- Mobile-first.
- Respect `prefers-reduced-motion`.

## Engineering
- Server-side pricing only. Never trust `total`/`price` from client.
- Money stored as `BIGINT` VND (integers, no floats).
- Booking stores a price snapshot — later admin price edits must not mutate past bookings.
- VNPay: verify signature + amount; IPN must be idempotent; no duplicate payments.
- Guest checkout allowed; never force signup.
- Supabase RLS on all tables; public reads published content only.
- No public admin registration.
- Pricing engine in `src/lib/pricing/`, VNPay in `src/lib/vnpay/`.
- SEO: Metadata API, sitemap, robots, canonical, OpenGraph, JSON-LD, next/image.
