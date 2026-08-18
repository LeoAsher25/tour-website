# Research — Premium Adventure Travel Booking

Reference inspiration (business logic & booking flow only, no visual/content clone):
Ha Giang loop tour operators, Airbnb Experiences, boutique adventure travel sites.

---

## 1. Information Architecture

Typical premium adventure travel IA:

```
Home
├── Tours (listing, filter by duration/difficulty/style)
│   └── Tour Detail (the sales page)
├── Destinations (region storytelling → tours in that region)
├── Blog / Travel Stories (SEO + trust)
├── About (team, story, why us)
├── Contact
└── Utility: FAQ, Terms, Privacy, Cancellation Policy
```

Key insight: **destination-led discovery**. Users arrive curious about a place
(Ha Giang), not a product. Home must sell the *experience* and place first,
then funnel to specific tours. Tours are the conversion unit; destinations and
blog are the discovery/SEO layer.

Navigation kept minimal (5–6 top items). Booking is a persistent CTA, not a nav item.

---

## 2. Booking UX

Best-in-class adventure booking is **linear, low-friction, guest-first**:

```
Tour detail → pick date → pick package/variant → guests → add-ons
→ customer info → payment (deposit or full) → confirmation
```

Principles observed:
- **Guest checkout** is default. Forcing signup kills conversion for one-off trips.
- **Sticky booking card** on desktop tour detail — always-visible price + CTA.
- **Sticky bottom bar** on mobile — "From X₫ / Book now".
- Price updates live as options change, but **server is source of truth**.
- Deposit option lowers the commitment barrier ("Reserve for 30%").
- Progress is visible; each step is cheap to change.
- Trust signals near the CTA: free cancellation window, secure payment, rating.

## 3. Tour Detail Structure (the sales page)

Ordering that converts (top = hook, middle = detail, bottom = reassurance):

```
Hero / Gallery (cinematic, sells the dream)
Title · rating · duration · location · from-price
Overview (short narrative)
Highlights (scannable)
Itinerary (day-by-day timeline — the core of a multi-day tour)
Included / Excluded (sets expectations, reduces refund disputes)
Gallery (proof)
Accommodation · Transportation · Meals (logistics reassurance)
Reviews (social proof)
FAQ (removes last objections)
Related tours (cross-sell)
```

Sticky booking card runs alongside content on desktop.

## 4. Storytelling

- **Photography-first**: full-bleed imagery carries emotion; text is sparse and editorial.
- Place narrative before product pitch — "why this journey matters".
- Local culture / people angle differentiates premium from commodity tours.
- Editorial serif headings + calm sans body reads as a magazine, not a SaaS dashboard.

## 5. Conversion Patterns

- Persistent price + CTA (sticky card / bottom bar).
- "From X₫" anchors low, variants explain the range.
- Deposit to reduce friction; free-cancellation window as risk reversal.
- Reviews with names/photos; specific over generic.
- Scarcity done tastefully (departure dates with limited spots), never spammy.
- FAQ pre-empts objections right before final CTA.
- Clear single primary action per screen.

## 6. Data Model Implications

- Tours have multiple **variants/packages** (Self Riding, Easy Rider, Private, SUV/Jeep)
  with different price bases (per-person vs per-group).
- **Add-ons** are orthogonal (private room, bike upgrade, transfer, extra night).
- **Departures** = scheduled dates with capacity.
- **Price snapshot** stored on booking so later admin price edits don't mutate history.
- Money as `BIGINT` VND (no floats).

## 7. Concrete Feature Findings (from reference audit — see docs/report.md)

Business logic worth adopting (not visual clone):

- **Multi-axis package configurator**: price varies by
  `tour + rider type (self/easy rider) + bus (yes/no) + departure + destination + vehicle`.
  SUV/Jeep tours vary by **PAX** (1/2/3) and **duration** (2D1N/3D2N/4D3N).
  High-class variant adds **hotel class** (4★/5★). → our `tour_variants` must be flexible.
- **Add-ons** orthogonal to package: private room, bike upgrade, bus ticket,
  airport/pickup transfer, extra night, damage insurance. → `add_ons` + `tour_add_ons`.
- **Fitness/suitability metadata**: fitness level (1–5★), suitable-for, warnings
  (e.g. not for fear of heights). → tour fields `difficulty`, `suitable_for`, `warnings`.
- **Self-riding rules**: license requirements (IDP 1968 + A/A1), support contact. → FAQ/content.
- **Booking form fields**: full name, WhatsApp, passport, email, start date, pickup point,
  transport option, add-ons, promo code, special request, group-matching (friend name + booking ID).
- **Order calculation**: subtotal → VAT (8%) → card fee (4% if card) → total →
  payment amount (deposit or full) → remaining (cash on arrival). → pricing engine outputs.
- **Deposit vs full payment**: partial now (non-refundable) + remaining cash on arrival, OR 100% now.
- **Payment**: reference uses OnePay (Visa/Master + domestic ATM); **we use VNPay Sandbox**.
- **Terms acceptance** checkbox required before pay.
- **Confirmation**: booking created + confirmation email with bus timing / start date / pickup.
- **Legal system**: Privacy, Terms, Service, Refund, Cancellation, Payment policies.
- **Content**: image gallery carousel, video gallery, FAQ accordion, blog.
- **Booking lookup**: booking ID + status + payment status for guest lookup.

## 8. Applied Decisions

- Home = storytelling funnel, not card grid.
- Tour detail = long-form sales page with sticky booking.
- Booking = single linear guest flow, server-side pricing, VNPay deposit/full.
- Variants modeled generically (name + price_type + price + attrs JSON) to cover
  rider/PAX/duration/hotel-class combinations without a rigid schema.
- Pricing engine outputs subtotal, discount, VAT, deposit, total, remaining — all server-side.
- Admin = functional shadcn CRUD, no public registration.
- WhatsApp/hotline as contact channels; guest checkout (no signup).
