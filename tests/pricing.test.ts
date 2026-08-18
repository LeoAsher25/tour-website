import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculatePrice, formatVnd, isPromoApplicable } from "@/lib/pricing";
import { siteSettings } from "@/lib/data/settings";
import { tours } from "@/lib/data/tours";
import type { BookingSelectionInput, PromoCode } from "@/types/domain";

const tour = tours[0]; // ha-giang-loop-3d2n
const variant = tour.variants[0]; // v1-self, per_person, 3_408_000

function input(overrides: Partial<BookingSelectionInput> = {}): BookingSelectionInput {
  return {
    tourId: tour.id,
    variantId: variant.id,
    startDate: "2026-09-12",
    guestCount: 1,
    addOnIds: [],
    paymentPlan: "full",
    payByCard: false,
    ...overrides,
  };
}

describe("pricing engine (server-side authoritative pricing)", () => {
  it("computes per-person price × guests", () => {
    const price = calculatePrice(
      input({ guestCount: 2 }),
      { tour, variant, addOns: [], promo: null, settings: siteSettings }
    );
    assert.equal(price.subtotal, 3_408_000 * 2);
    assert.equal(price.total, price.subtotal + price.vat);
    assert.equal(price.amountToPayNow, price.total); // full payment plan
  });

  it("never trusts a client-supplied amount — only guest count & variant", () => {
    // The engine signature has NO amount input at all — pricing is derived
    // purely from the variant's basePrice (authoritative DB data).
    const price = calculatePrice(
      input({ guestCount: 3 }),
      { tour, variant, addOns: [], promo: null, settings: siteSettings }
    );
    assert.equal(price.subtotal, 3_408_000 * 3);
    // If a client claimed a different total, it cannot influence the result.
    assert.notEqual(price.total, 1);
  });

  it("applies card fee only when payByCard", () => {
    const card = calculatePrice(
      input({ guestCount: 1, payByCard: true }),
      { tour, variant, addOns: [], promo: null, settings: siteSettings }
    );
    const cash = calculatePrice(
      input({ guestCount: 1, payByCard: false }),
      { tour, variant, addOns: [], promo: null, settings: siteSettings }
    );
    assert.ok(card.cardFee > 0);
    assert.equal(cash.cardFee, 0);
    assert.ok(card.total > cash.total);
  });

  it("deposit plan charges 30% now, rest later", () => {
    const deposit = calculatePrice(
      input({ guestCount: 1, paymentPlan: "deposit" }),
      { tour, variant, addOns: [], promo: null, settings: siteSettings }
    );
    const full = calculatePrice(
      input({ guestCount: 1, paymentPlan: "full" }),
      { tour, variant, addOns: [], promo: null, settings: siteSettings }
    );
    assert.ok(deposit.amountToPayNow < full.amountToPayNow);
    assert.ok(deposit.remaining > 0);
  });

  it("applies a valid promo code", () => {
    const promo: PromoCode = {
      code: "NORTH10",
      discountType: "percent",
      discountValue: 10,
      minSubtotal: 3_000_000,
      redemptions: 0,
      active: true,
    };
    const price = calculatePrice(
      input({ guestCount: 2, promoCode: "NORTH10" }),
      { tour, variant, addOns: [], promo, settings: siteSettings }
    );
    assert.ok(price.discount > 0);
    assert.equal(price.subtotal - price.discount + price.vat + price.cardFee, price.total);
  });

  it("ignores an expired/inactive promo", () => {
    const promo: PromoCode = {
      code: "OLD",
      discountType: "percent",
      discountValue: 10,
      redemptions: 0,
      active: false,
    };
    assert.equal(isPromoApplicable(promo, 5_000_000), false);
    const price = calculatePrice(
      input({ promoCode: "OLD" }),
      { tour, variant, addOns: [], promo, settings: siteSettings }
    );
    assert.equal(price.discount, 0);
  });

  it("formats VND nicely", () => {
    assert.equal(formatVnd(3_408_000), "3.408.000\u00a0₫");
  });
});
