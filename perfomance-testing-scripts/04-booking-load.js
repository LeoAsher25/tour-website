import http from "k6/http";
import { sleep } from "k6";
import { Rate, Counter } from "k6/metrics";
import {
  baseUrl,
  buildBookingPayload,
  businessRejectRate,
  endpointDuration,
  randomThinkTime,
  unexpectedErrorRate,
} from "./lib/common.js";

const bookingCreated = new Counter("booking_created");
const bookingSoldOut = new Counter("booking_sold_out");
const bookingUnexpected = new Rate("booking_unexpected_rate");

const LOW_VUS = Number(__ENV.LOW_VUS || 5);
const MID_VUS = Number(__ENV.MID_VUS || 20);
const HIGH_VUS = Number(__ENV.HIGH_VUS || 50);

export const options = {
  scenarios: {
    booking_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: LOW_VUS },
        { duration: "1m", target: LOW_VUS },
        { duration: "20s", target: MID_VUS },
        { duration: "1m", target: MID_VUS },
        { duration: "20s", target: HIGH_VUS },
        { duration: "2m", target: HIGH_VUS },
        { duration: "20s", target: 0 },
      ],
      gracefulRampDown: "15s",
    },
  },
  thresholds: {
    booking_unexpected_rate: ["rate<0.01"],
    "endpoint_duration{endpoint:booking_create}": ["p(95)<1500", "p(99)<3000"],
  },
};

export default function () {
  const base = baseUrl();
  const suffix = `${__VU}-${__ITER}-${Date.now()}`;
  const payload = buildBookingPayload({ uniqueSuffix: suffix });

  const res = http.post(`${base}/api/bookings`, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { endpoint: "booking_create" },
  });

  endpointDuration.add(res.timings.duration, { endpoint: "booking_create" });

  if (res.status === 201) {
    bookingCreated.add(1);
    bookingUnexpected.add(false);
    unexpectedErrorRate.add(false, { endpoint: "booking_create" });
  } else if (res.status === 409) {
    // SOLD_OUT / UNAVAILABLE are business outcomes, not server failures.
    bookingSoldOut.add(1);
    businessRejectRate.add(true, { endpoint: "booking_create" });
    bookingUnexpected.add(false);
    unexpectedErrorRate.add(false, { endpoint: "booking_create" });
  } else {
    bookingUnexpected.add(true);
    unexpectedErrorRate.add(true, { endpoint: "booking_create" });
    console.error(
      `Unexpected booking response: status=${res.status} body=${res.body}`,
    );
  }

  sleep(randomThinkTime(1, 3));
}
