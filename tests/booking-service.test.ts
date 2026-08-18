import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  canReserve,
  isValidDepartureDate,
  isValidGuestCount,
} from "@/lib/bookings";
import { generateBookingCode } from "@/lib/bookings/booking-code";
import { tours } from "@/lib/data/tours";
import { resolvePricingEntities } from "@/lib/repository";

describe("booking validation", () => {
  it("rejects past / malformed departure dates", () => {
    assert.equal(isValidDepartureDate("2020-01-01"), false); // past
    assert.equal(isValidDepartureDate("not-a-date"), false);
    assert.equal(isValidDepartureDate("2026-13-40"), false); // invalid month
    assert.equal(isValidDepartureDate("2026-09-12"), true);
  });

  it("validates guest count bounds", () => {
    assert.equal(isValidGuestCount(0), false);
    assert.equal(isValidGuestCount(-1), false);
    assert.equal(isValidGuestCount(31), false);
    assert.equal(isValidGuestCount(NaN), false);
    assert.equal(isValidGuestCount(1), true);
    assert.equal(isValidGuestCount(12), true);
  });

  it("sold-out detection: capacity respected exactly", () => {
    const dep = { capacity: 12, booked: 12 };
    assert.equal(canReserve(dep, 1), false); // full
    assert.equal(canReserve({ capacity: 12, booked: 11 }, 1), true);
    assert.equal(canReserve({ capacity: 12, booked: 11 }, 2), false);
    // No departure record → unlimited.
    assert.equal(canReserve(null, 5), true);
    // capacity 0 → no cap.
    assert.equal(canReserve({ capacity: 0, booked: 99 }, 5), true);
  });
});

describe("booking code generator", () => {
  it("produces unique, human-readable codes", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const code = generateBookingCode();
      assert.match(code, /^JAS-[A-Z2-9]{6}$/);
      assert.equal(seen.has(code), false);
      seen.add(code);
    }
  });
});

describe("repository pricing entity resolution (invalid tour/variant)", () => {
  it("rejects unknown tour", async () => {
    const result = await resolvePricingEntities("nope", "v1-self", []);
    assert.equal(result, null);
  });

  it("rejects unknown variant on a real tour", async () => {
    const tour = tours[0];
    const result = await resolvePricingEntities(tour.id, "v-unknown", []);
    assert.equal(result, null);
  });

  it("resolves a real tour + variant + add-ons", async () => {
    const tour = tours[0];
    const result = await resolvePricingEntities(tour.id, tour.variants[0].id, [
      tour.addOns[0].id,
    ]);
    assert.ok(result);
    assert.equal(result.variant.id, tour.variants[0].id);
    assert.equal(result.addOns.length, 1);
  });
});
