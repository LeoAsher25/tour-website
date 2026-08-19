import http from "k6/http";
import { Counter, Rate } from "k6/metrics";
import {
  baseUrl,
  buildBookingPayload,
  endpointDuration,
  unexpectedErrorRate,
} from "./lib/common.js";

const created = new Counter("race_booking_created");
const rejected = new Counter("race_booking_rejected");
const unexpected = new Rate("race_unexpected_rate");

const RACE_VUS = Number(__ENV.RACE_VUS || 100);

export const options = {
  scenarios: {
    booking_race: {
      executor: "per-vu-iterations",
      vus: RACE_VUS,
      iterations: 1,
      maxDuration: "45s",
    },
  },
  thresholds: {
    race_unexpected_rate: ["rate<0.01"],
    "endpoint_duration{endpoint:booking_race}": ["p(95)<3000"],
  },
};

export default function () {
  const base = baseUrl();
  const suffix = `race-${__VU}-${Date.now()}`;
  const payload = buildBookingPayload({ uniqueSuffix: suffix });

  const res = http.post(`${base}/api/bookings`, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { endpoint: "booking_race" },
  });

  endpointDuration.add(res.timings.duration, { endpoint: "booking_race" });

  if (res.status === 201) {
    created.add(1);
    unexpected.add(false);
    unexpectedErrorRate.add(false, { endpoint: "booking_race" });
  } else if (res.status === 409) {
    rejected.add(1);
    unexpected.add(false);
    unexpectedErrorRate.add(false, { endpoint: "booking_race" });
  } else {
    unexpected.add(true);
    unexpectedErrorRate.add(true, { endpoint: "booking_race" });
    console.error(
      `Unexpected race response: status=${res.status} body=${res.body}`,
    );
  }
}
