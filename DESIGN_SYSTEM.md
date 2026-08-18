# Design System — Premium Adventure Travel

**Brand Personality**: Premium Adventure Travel × Editorial × Vietnamese Local Culture

Not SaaS. Not startup landing page. Photography-first editorial storytelling.

---

## Color Palette

### Base

```css
--bg-ivory: #F7F4EF;        /* warm cream background */
--surface: #FBF9F5;         /* slightly lighter cards/surfaces */
--surface-white: #FFFFFF;   /* pure white where needed */
--border: #E7E1D7;          /* warm hairline borders */
```

### Text

```css
--text-primary: #1F2421;    /* near-black ink */
--text-muted: #5C635D;      /* muted secondary text */
```

### Brand

```css
--primary: #2D5842;         /* forest green */
--primary-hover: #234432;   /* darker forest green */
--accent: #C4612F;          /* terracotta / burnt orange */
--accent-hover: #A94E22;    /* darker terracotta */
--accent-tint: #F2E3D6;     /* soft tint for pills/chips */
```

### Semantic

```css
--success: #2D5842;         /* reuse primary */
--warning: #C4612F;         /* reuse accent */
--error: #B33A3A;           /* warm red */
--info: #5C635D;            /* reuse muted */
```

### Dark Sections

```css
--bg-dark: #1F2421;         /* warm charcoal, NOT pure black */
--text-dark-primary: #F7F4EF;
--text-dark-muted: #B8B3A8;
```

**Rule**: Avoid cold blues, indigo, purple, flat pure-black. Keep warmth throughout.

---

## Typography

### Font Stack

**Headings**: Editorial serif  
→ `Fraunces`, `DM Serif Display`, or `Playfair Display`  
Weight: 400–500 (regular, NOT bold)  
Tracking: tight (-0.02em to -0.01em)

**Body & UI**: Modern sans  
→ `Inter`  
Weight: 300 (light body), 400 (regular), 500 (medium for buttons/labels)

### Scale (fluid, mobile-first)

```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);     /* 12–14px */
--text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);      /* 14–16px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);     /* 16–18px */
--text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);   /* 18–20px */
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);       /* 20–24px */
--text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);        /* 24–32px */
--text-3xl: clamp(2rem, 1.75rem + 1.25vw, 3rem);          /* 32–48px */
--text-4xl: clamp(2.5rem, 2rem + 2.5vw, 4rem);            /* 40–64px */
```

### Heading Treatment

- Use serif for all major headings (H1, H2, H3).
- **Italicize exactly one key word** in each major headline, color it `--accent`.
- Example: "Discover the *Soul* of Ha Giang" (with "Soul" italic + terracotta).

### Body

- Inter 300 for long-form body text.
- Inter 400 for short descriptions.
- Inter 500 for buttons, labels, navigation.

---

## Spacing

8pt base grid.

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

**Rule**: Generous whitespace. Don't cram content. Editorial spacing > efficiency.

---

## Radius

```css
--radius-sm: 4px;      /* small elements */
--radius-md: 8px;      /* cards, images */
--radius-lg: 12px;     /* sections */
--radius-full: 9999px; /* pills, buttons */
```

**Buttons**: fully rounded (`999px`) pill shape.  
**Cards**: `8–12px`.  
**Images**: `8px` or `12px`, never sharp corners.

---

## Shadows

Subtle, warm-toned shadows. Never harsh black.

```css
--shadow-sm: 0 1px 2px 0 rgba(31, 36, 33, 0.05);
--shadow-md: 0 4px 6px -1px rgba(31, 36, 33, 0.08),
             0 2px 4px -1px rgba(31, 36, 33, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(31, 36, 33, 0.08),
             0 4px 6px -2px rgba(31, 36, 33, 0.04);
--shadow-xl: 0 20px 25px -5px rgba(31, 36, 33, 0.08),
             0 10px 10px -5px rgba(31, 36, 33, 0.04);
```

Use sparingly. Photography + whitespace > drop shadows.

---

## Buttons

### Primary

```css
background: var(--accent);      /* terracotta */
color: white;
border-radius: 9999px;
padding: 0.75rem 2rem;          /* 12px 32px */
font: Inter 500;
transition: all 200ms ease;

hover:
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
```

### Secondary

```css
background: transparent;
color: var(--text-primary);
border: 1px solid var(--border);
border-radius: 9999px;
padding: 0.75rem 2rem;
font: Inter 500;

hover:
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
```

### Ghost

```css
background: transparent;
color: var(--text-primary);
padding: 0.75rem 1.5rem;
font: Inter 500;

hover:
  color: var(--accent);
```

**Rule**: One primary CTA per screen. Don't crowd with multiple primary buttons.

---

## Forms

### Input

```css
background: white;
border: 1px solid var(--border);
border-radius: 8px;
padding: 0.75rem 1rem;
font: Inter 400;
color: var(--text-primary);

focus:
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(45, 88, 66, 0.1);
```

### Label

```css
font: Inter 500;
font-size: var(--text-sm);
color: var(--text-primary);
margin-bottom: 0.5rem;
```

### Error

```css
color: var(--error);
font: Inter 400;
font-size: var(--text-sm);
margin-top: 0.25rem;
```

---

## Tour Card

```css
background: white;
border-radius: 12px;
overflow: hidden;
box-shadow: var(--shadow-sm);
transition: all 300ms ease;

hover:
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);

structure:
  image (aspect-ratio: 4/3)
  content padding: 1.5rem
    eyebrow badge (if featured)
    title (serif, --text-xl)
    metadata row (duration, difficulty)
    price (--text-lg, terracotta)
    CTA button
```

**Image treatment**: Never stretch. Always `object-fit: cover`. Use real photography.

---

## Booking Card (sticky)

```css
background: white;
border: 1px solid var(--border);
border-radius: 12px;
padding: 1.5rem;
box-shadow: var(--shadow-md);
position: sticky;
top: 2rem;

structure:
  price (large, --text-3xl, serif)
  "per person" (muted, small)
  date picker
  guest count
  package selector
  add-ons checkboxes
  subtotal
  primary CTA button (full-width pill)
```

Mobile: transforms into sticky bottom bar.

---

## Badge / Pill

```css
background: var(--accent-tint);  /* soft terracotta tint */
color: var(--accent);
border-radius: 9999px;
padding: 0.25rem 0.75rem;
font: Inter 500;
font-size: var(--text-xs);
text-transform: uppercase;
letter-spacing: 0.05em;
```

Use for: eyebrow labels ("Featured", "Most loved"), difficulty tags, category chips.

---

## Image Treatment

- **Aspect ratios**: 4:3 (tour cards), 16:9 (hero), 1:1 (gallery thumbnails).
- **Border radius**: 8–12px, never sharp.
- **Overlay for text**: dark gradient `linear-gradient(180deg, transparent 0%, rgba(31,36,33,0.7) 100%)`.
- **Lazy load**: always.
- **Alt text**: always descriptive.
- Real photography only. No illustrations, no flat gradients as placeholders.

---

## Hover States

- **Lift**: `translateY(-1px)` to `translateY(-3px)`.
- **Shadow**: increase one level (sm → md, md → lg).
- **Color shift**: darken primary/accent on hover.
- **Duration**: 200–300ms.
- **Easing**: `ease` or `cubic-bezier(0.4, 0, 0.2, 1)`.

**Rule**: Subtle. Not bouncy. Not oversold.

---

## Animation Rules

### Motion (Framer Motion)

Use for:
- Page transitions (fade + slide).
- Scroll-triggered reveals (fade-in-up).
- Hover micro-interactions (scale, lift).
- Modal/drawer enter/exit.

**Timing**: 300–500ms.  
**Easing**: `ease-out` for enter, `ease-in` for exit.  
**Stagger**: 50–100ms for list items.

### Magic UI

Use sparingly (~5% of UI), for:
- Hero section accent (e.g. animated border, shimmer).
- Featured tour card accent.
- Loading states (skeleton, spinner).

**Rule**: Never let Magic UI dominate. It's seasoning, not the meal.

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Always respect this. Accessibility > flair.

---

## Responsive Rules

### Breakpoints

```css
--sm: 640px;
--md: 768px;
--lg: 1024px;
--xl: 1280px;
--2xl: 1536px;
```

### Mobile-first

- Design for 375px first.
- Scale up, never down.
- Touch targets minimum 44×44px.
- Sticky nav collapses to hamburger < 768px.
- Sticky booking card → sticky bottom bar < 768px.
- Two-column → single-column < 1024px.

### Container

```css
max-width: 1280px;
margin: 0 auto;
padding: 0 1.5rem;  /* 24px */

@media (min-width: 768px) {
  padding: 0 2rem;  /* 32px */
}

@media (min-width: 1024px) {
  padding: 0 3rem;  /* 48px */
}
```

---

## Accessibility

- **Color contrast**: WCAG AA minimum (4.5:1 for text, 3:1 for UI).
- **Focus visible**: always show focus ring, never `outline: none` without replacement.
- **Keyboard navigation**: all interactive elements tabbable.
- **Alt text**: all images.
- **Semantic HTML**: use `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`.
- **ARIA**: only when semantic HTML insufficient.
- **Form labels**: always associated with inputs.
- **Error messages**: announced to screen readers.

---

## Grid System

Use CSS Grid + Flexbox, not a framework grid.

### Tour Grid (listing page)

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 2rem;
```

### Content + Sidebar (tour detail, desktop)

```css
display: grid;
grid-template-columns: 1fr 400px;
gap: 3rem;

@media (max-width: 1024px) {
  grid-template-columns: 1fr;
}
```

---

## Do NOT

- ❌ Cold blue/indigo (#4F46E5, #3B82F6).
- ❌ Flat pure white + pure black.
- ❌ Three identical icon cards in a row.
- ❌ Gradient backgrounds everywhere.
- ❌ Glow effects, glassmorphism overlays.
- ❌ Inter 400 for everything with no hierarchy.
- ❌ Tight spacing, cramped cards.
- ❌ Generic stock photos (office, shaking hands).
- ❌ SaaS dashboard layout for marketing pages.
- ❌ Excessive animations (parallax on everything, constant motion).

---

## DO

- ✅ Warm earthy palette (ivory, forest green, terracotta).
- ✅ Editorial serif headings with one italic accent word.
- ✅ Generous whitespace.
- ✅ Real photography, full-bleed where appropriate.
- ✅ Single-column editorial hero.
- ✅ Sticky backdrop-blur nav.
- ✅ Fully rounded pill buttons.
- ✅ Soft hover lift (1–3px).
- ✅ Warm hairline borders.
- ✅ Subtle animations (respect reduced motion).
- ✅ Mobile-first, touch-friendly.
- ✅ Semantic HTML, accessible.
