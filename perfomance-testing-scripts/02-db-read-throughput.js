import http from "k6/http";
import { baseUrl, recordResponse, requireEnv } from "./lib/common.js";

const RPS = Number(__ENV.RPS || 5);
const DURATION = __ENV.DURATION || "3m";

const PREALLOCATED_VUS = Number(__ENV.PREALLOCATED_VUS || 50);
const MAX_VUS = Number(__ENV.MAX_VUS || 300);

export const options = {
  scenarios: {
    db_read_throughput: {
      executor: "constant-arrival-rate",

      // Number of iterations k6 tries to start every second.
      rate: RPS,
      timeUnit: "1s",

      duration: DURATION,

      // k6 needs enough VUs available to keep the requested RPS when
      // response times increase.
      preAllocatedVUs: PREALLOCATED_VUS,
      maxVUs: MAX_VUS,

      gracefulStop: "30s",
    },
  },

  thresholds: {
    // Unexpected HTTP/business failures should stay below 1%.
    unexpected_error_rate: ["rate<0.01"],

    // This endpoint is intentionally DB-backed and bypasses browser/cache behavior.
    "endpoint_duration{endpoint:booking_read}": ["p(95)<1000", "p(99)<2000"],

    // In an arrival-rate test, dropped iterations mean k6 could not maintain
    // the requested RPS because every available VU was busy.
    dropped_iterations: ["count<1"],
  },
};

export default function () {
  const base = baseUrl();
  const bookingCode = requireEnv("BOOKING_CODE");

  const res = http.get(`${base}/api/bookings/${bookingCode}`, {
    tags: {
      endpoint: "booking_read",
    },

    // Make the intent explicit: this test should exercise the live server/DB path.
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  recordResponse(res, [200], "booking_read");
}
