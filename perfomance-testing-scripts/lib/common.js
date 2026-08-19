import { check } from "k6";
import { Rate, Trend } from "k6/metrics";

export const unexpectedErrorRate = new Rate("unexpected_error_rate");
export const businessRejectRate = new Rate("business_reject_rate");
export const endpointDuration = new Trend("endpoint_duration", true);

const DEFAULTS = {
  BASE_URL: "https://tour-website-kohl.vercel.app",
  TOUR_ID: "tour-1",
  TOUR_SLUG: "ha-giang-loop-3d2n",
  VARIANT_ID: "v1-self",
  START_DATE: "2099-12-31",
  BOOKING_CODE: "JAS-E3KN6C",
};

export function baseUrl() {
  return (__ENV.BASE_URL || DEFAULTS.BASE_URL).replace(/\/$/, "");
}

export function randomThinkTime(minSeconds = 1, maxSeconds = 4) {
  return minSeconds + Math.random() * (maxSeconds - minSeconds);
}

export function recordResponse(res, expectedStatuses, label) {
  const ok = expectedStatuses.includes(res.status);
  unexpectedErrorRate.add(!ok, { endpoint: label });
  endpointDuration.add(res.timings.duration, { endpoint: label });

  check(res, {
    [`${label}: expected status`]: () => ok,
  });

  return ok;
}

export function requireEnv(name) {
  const value = __ENV[name] || DEFAULTS[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function envOrDefault(name) {
  return __ENV[name] || DEFAULTS[name] || "";
}

export function buildBookingPayload({
  uniqueSuffix,
  paymentMethod = "zalo/manual",
}) {
  const tourId = requireEnv("TOUR_ID");
  const variantId = requireEnv("VARIANT_ID");
  const startDate = requireEnv("START_DATE");

  return JSON.stringify({
    tourId,
    variantId,
    startDate,
    guestCount: Number(__ENV.GUEST_COUNT || 1),
    addOnIds: [],
    paymentPlan: "full",
    payByCard: false,
    customer: {
      fullName: `k6 Performance Test ${uniqueSuffix}`,
      phone: `090${String(uniqueSuffix).replace(/\D/g, "").slice(-7).padStart(7, "0")}`,
      email: `k6-${uniqueSuffix}@example.com`,
      note: "AUTOMATED_K6_PERFORMANCE_TEST",
    },
    paymentMethod,
  });
}
