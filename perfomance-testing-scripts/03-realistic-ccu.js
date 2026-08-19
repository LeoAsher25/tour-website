import http from "k6/http";
import { sleep } from "k6";

import {
  baseUrl,
  envOrDefault,
  recordResponse,
  randomThinkTime,
} from "./lib/common.js";

const CCU = Number(__ENV.CCU || 300);
const DURATION = __ENV.DURATION || "3m";

export const options = {
  scenarios: {
    realistic_users: {
      executor: "constant-vus",

      // Here VUs are intentionally used as an approximation of active users.
      vus: CCU,

      duration: DURATION,

      // Allow a currently running browsing flow to finish when the test ends.
      gracefulStop: "45s",
    },
  },

  thresholds: {
    unexpected_error_rate: ["rate<0.01"],

    // Keep endpoint thresholds separate so a slow DB route does not hide
    // behind fast cached/static pages.
    "http_req_duration{endpoint:homepage}": ["p(95)<1000", "p(99)<2000"],

    "http_req_duration{endpoint:tour_page}": ["p(95)<1000", "p(99)<2000"],

    "http_req_duration{endpoint:checkout}": ["p(95)<1500", "p(99)<3000"],

    "http_req_duration{endpoint:booking_read}": ["p(95)<1500", "p(99)<3000"],
  },
};

export default function () {
  const base = baseUrl();

  const slug = envOrDefault("TOUR_SLUG");
  const bookingCode = envOrDefault("BOOKING_CODE");

  // ------------------------------------------------------------
  // 1. Homepage
  // ------------------------------------------------------------
  let res = http.get(`${base}/`, {
    tags: {
      endpoint: "homepage",
    },
  });

  recordResponse(res, [200], "homepage");

  // User spends some time looking at the homepage.
  sleep(randomThinkTime(2, 5));

  // ------------------------------------------------------------
  // 2. Tour detail
  // ------------------------------------------------------------
  if (slug) {
    res = http.get(`${base}/tours/${slug}`, {
      tags: {
        endpoint: "tour_page",
      },
    });

    recordResponse(res, [200], "tour_page");

    // User reads tour details.
    sleep(randomThinkTime(4, 8));

    // ----------------------------------------------------------
    // 3. Checkout
    //
    // Roughly 35% of browsing sessions continue to checkout.
    // ----------------------------------------------------------
    if (Math.random() < 0.35) {
      res = http.get(`${base}/checkout/${slug}`, {
        tags: {
          endpoint: "checkout",
        },
      });

      recordResponse(res, [200], "checkout");

      // User reviews the selected tour / pricing / form.
      sleep(randomThinkTime(3, 7));
    }
  }

  // ------------------------------------------------------------
  // 4. Booking lookup
  //
  // Roughly 10% of sessions hit a live DB-backed route.
  //
  // This gives realistic browsing traffic some Supabase workload,
  // while avoiding an unrealistic situation where every visitor
  // queries the DB continuously.
  // ------------------------------------------------------------
  if (bookingCode && Math.random() < 0.1) {
    res = http.get(`${base}/api/bookings/${bookingCode}`, {
      tags: {
        endpoint: "booking_read",
      },

      headers: {
        "Cache-Control": "no-cache",
      },
    });

    recordResponse(res, [200], "booking_read");
  }

  // User remains on the site / reads content before the next loop.
  sleep(randomThinkTime(2, 5));
}
