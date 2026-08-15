Bạn là **Senior Full-stack Developer + Product Designer**. Hãy xây dựng một website bán tour lấy cảm hứng về **nghiệp vụ và booking flow** từ `https://jasminehagiang.com/`, nhưng **không clone visual, nội dung, hình ảnh hoặc thương hiệu**.

## Stack

```text
Next.js App Router + TypeScript
Tailwind CSS
shadcn/ui
Motion
Magic UI
UI UX Pro Max
Supabase (Postgres + Auth + Storage + RLS)
VNPay Sandbox
Vercel
```

Không cần NestJS/backend riêng. Dùng Next.js Route Handlers / Server Actions cho backend logic.

---

## Design direction

Phong cách:

> **Premium Adventure Travel × Editorial × Vietnamese Local Culture**

Nguyên tắc:

- Photography-first.
- Typography và layout quan trọng hơn effects.
- Không làm kiểu SaaS.
- Tránh gradient, glow, glassmorphism và card-grid lạm dụng.
- shadcn/ui dùng cho UI chức năng.
- Motion dùng cho animation subtle.
- Magic UI chỉ khoảng 5–10%, dùng như “gia vị”.
- Mobile-first.
- Ưu tiên Core Web Vitals và accessibility.

Tỷ lệ tham khảo:

```text
75% Tailwind + shadcn + custom components
20% Motion
5% Magic UI
```

---

## Workflow bắt buộc

### Phase 1 — Research

Phân tích:

- Jasmine Ha Giang
- Airbnb Experiences
- premium/boutique adventure travel websites

Tập trung vào:

- information architecture
- booking UX
- tour detail structure
- storytelling
- conversion patterns

Không clone visual.

Tạo:

```text
docs/RESEARCH.md
```

---

### Phase 2 — Design System

**Chưa code feature.**

Tạo:

```text
DESIGN_SYSTEM.md
```

Bao gồm:

- brand personality
- color palette
- typography
- spacing
- radius
- shadows
- buttons
- forms
- tour cards
- booking cards
- image treatment
- hover states
- animation rules
- responsive rules
- accessibility

Design direction:

```text
warm ivory background
forest green primary
burnt orange / terracotta accent
near-black text

editorial serif heading
modern sans-serif body
```

Tạo thêm `AGENTS.md` với các rule:

```text
- Follow DESIGN_SYSTEM.md strictly.
- Avoid generic SaaS design.
- Photography is a first-class design element.
- Prefer shadcn/ui for functional UI.
- Use Motion subtly.
- Use Magic UI sparingly.
- Avoid unnecessary gradient/glow/glassmorphism.
- Prioritize whitespace and typography.
- Mobile-first.
- Respect prefers-reduced-motion.
```

---

### Phase 3 — Foundation

Xây trước:

```text
Navbar
Container
Section
SectionHeader
Button
TourCard
ImageCard
BookingCard
Badge
Footer
```

Reuse component, không tạo mỗi page một style.

---

### Phase 4 — Homepage

Homepage phải storytelling, không phải SaaS layout.

Structure gợi ý:

```text
Cinematic Hero
↓
Popular Experiences
↓
Why Ha Giang?
↓
Visual Storytelling
↓
Featured Tours
↓
The Journey
↓
Local Culture
↓
Why Travel With Us?
↓
Reviews
↓
Travel Stories
↓
Final CTA
```

Sau khi implement:

```text
Run
→ Screenshot desktop + mobile
→ Critique UI
→ Refine
→ Screenshot lại
```

Không chuyển page khác cho tới khi homepage đủ polished.

---

### Phase 5 — Tour Detail

Đây là **sales page quan trọng nhất**.

Structure:

```text
Hero / Gallery

Tour title
Rating
Duration
Location
Price

Overview
Highlights

Itinerary timeline

What's included
What's excluded

Gallery

Accommodation
Transportation
Meals

Reviews

FAQ

Related tours
```

Desktop:

```text
Content                    Sticky Booking Card
                           From 3,490,000₫
                           Date
                           Guests
                           Package
                           Book Now
```

Mobile:

```text
sticky bottom bar

From 3,490,000₫     Book now
```

Sau khi làm xong phải screenshot → critique → refine.

---

## Booking Flow

Cho phép **guest checkout**.

Flow:

```text
Tour
↓
Choose date
↓
Guests
↓
Package / Extras
↓
Customer information
↓
Payment
↓
Confirmation
```

Không bắt user signup trước.

Booking UI desktop:

```text
Form             Sticky Summary
```

Mobile:

```text
Single column
+
sticky Continue / Pay button
```

---

## Tour data

Một tour cần hỗ trợ:

- title
- description
- gallery
- duration
- difficulty
- destination
- start/end location
- itinerary theo ngày
- highlights
- included/excluded
- accommodation
- transportation
- meals
- FAQ
- SEO

Có nhiều package:

```text
Self Riding
Easy Rider
Private Tour
SUV / Jeep
```

Có add-ons:

```text
Private room
Bike upgrade
Bus
Airport transfer
Additional night
```

---

## Pricing

Pricing logic phải nằm server-side.

Frontend chỉ gửi:

```text
tourId
variantId
guestCount
addOns
promoCode
paymentPlan
```

Server tự lấy giá từ database và tính lại.

Không bao giờ tin `total` hoặc `price` từ client.

Money lưu bằng `BIGINT VND`.

Tạo pricing engine riêng, ví dụ:

```text
src/lib/pricing/
```

Hỗ trợ:

- price per person
- price per group
- add-ons
- promo code
- deposit
- full payment

Booking phải lưu **price snapshot** để admin thay giá sau này không làm thay đổi booking cũ.

---

## Payment

Hỗ trợ:

```text
Pay deposit
Pay full amount
```

Deposit % cấu hình từ admin/settings.

Tích hợp **VNPay Sandbox thật**, không mock.

Flow:

```text
Create booking
↓
Create payment
↓
Generate VNPay URL
↓
Redirect VNPay
↓
VNPay Return URL
+
VNPay IPN
↓
Verify signature + amount
↓
Update payment
↓
Result page
```

Quan trọng:

- Return URL chủ yếu phục vụ UX.
- IPN dùng để xác nhận payment server-side.
- Verify signature.
- Verify amount.
- IPN phải idempotent.
- Không để duplicate payment.
- Không thu card number/CVV/OTP trực tiếp.

Tách module:

```text
src/lib/vnpay/
```

---

## Database

Dùng Supabase.

Ít nhất có:

```text
profiles
tours
tour_variants
tour_images
itinerary_days
itinerary_stops
add_ons
tour_add_ons
tour_departures
bookings
booking_items
payments
promo_codes
reviews
blog_posts
faqs
site_settings
```

Có RLS.

Public chỉ được đọc published content.

Booking/payment/customer data phải được bảo vệ.

---

## Admin

Dùng Supabase Auth.

Không có public admin registration.

Admin cần:

```text
Dashboard
Tours CRUD
Itinerary
Packages
Extras
Departures
Bookings
Payments
Promo Codes
Blog
Media
Settings
```

Admin UI ưu tiên functional, dùng shadcn/ui.

---

## Public pages

Ít nhất:

```text
/
 /tours
 /tours/[slug]
 /destinations/[slug]
 /booking/[tourSlug]
 /booking/result
 /booking/lookup
 /blog
 /blog/[slug]
 /about
 /contact
 /faq
 /terms
 /privacy
 /cancellation-policy
```

---

## SEO + Performance

Implement:

- Next.js Metadata
- sitemap
- robots.txt
- canonical
- OpenGraph
- structured data phù hợp
- `next/image`
- responsive images
- minimal client JS
- Server Components
- lazy loading
- font optimization

Ưu tiên:

```text
LCP
CLS
INP
```

---

## Visual QA rule

Sau mỗi page quan trọng:

```text
Implement
↓
Screenshot 1440px
↓
Screenshot ~390px
↓
Critique
↓
Refine
```

Khi critique, tự hỏi:

- Có giống SaaS không?
- Có quá nhiều cards không?
- Photography đã đủ mạnh chưa?
- Typography có editorial không?
- Whitespace đủ chưa?
- CTA có rõ không?
- Mobile có dễ thao tác không?
- Có effect nào nên bỏ không?

Không chấp nhận đánh giá kiểu “looks good”.

---

## Thứ tự implementation

```text
1. Research
2. DESIGN_SYSTEM.md + AGENTS.md
3. Foundation
4. Homepage
5. Screenshot + refine
6. Tour Detail
7. Screenshot + refine
8. Booking UX
9. Database + pricing
10. VNPay Sandbox
11. Admin
12. Remaining pages
13. Motion pass
14. Magic UI pass
15. SEO + Performance
16. Final QA
```

Không build 15 page cùng lúc.

Không thêm Motion/Magic UI trước khi layout đã đẹp.

---

## Definition of Done

Chỉ coi project hoàn thành khi:

- UI premium và responsive
- Homepage polished
- Tour Detail polished
- Booking guest checkout hoạt động
- pricing server-side
- promo/deposit hoạt động
- Supabase/RLS hoạt động
- booking lưu DB
- VNPay Sandbox hoạt động
- Return + IPN hoạt động
- payment idempotent
- Admin CRUD tour/booking hoạt động
- blog hoạt động
- SEO cơ bản hoàn chỉnh
- build/test pass
- deploy được Vercel

**Tạo file chứa check list các tasks cần làm và Hãy trực tiếp implement project theo từng item trong check list và tự review UI sau mỗi page quan trọng, xong mỗi item trong checklist thì cập nhật trạng thái.**
