import type {
  Destination,
  PromoCode,
  Review,
  SiteSettings,
} from "@/types/domain";
import { siteConfig } from "@/src/config/site";

export const siteSettings: SiteSettings = {
  depositPercent: 30,
  vatPercent: 8,
  cardFeePercent: 4,
  currency: "VND",
  supportPhone: siteConfig.contact.phone,
  supportWhatsapp: siteConfig.contact.phone,
  supportEmail: siteConfig.contact.email,
};

export const promoCodes: PromoCode[] = [
  {
    code: "NORTH10",
    discountType: "percent",
    discountValue: 10,
    minSubtotal: 3_000_000,
    maxRedemptions: 500,
    redemptions: 12,
    active: true,
  },
  {
    code: "EARLYBIRD",
    discountType: "fixed",
    discountValue: 500_000,
    minSubtotal: 4_000_000,
    redemptions: 3,
    active: true,
  },
];

export const destinations: Destination[] = [
  {
    slug: "ha-giang",
    name: "Ha Giang",
    tagline: "Vietnam's wild northern frontier",
    description:
      "Limestone karsts, cloud-draped passes, and terraced valleys carved by generations of highland communities. Ha Giang is Vietnam at its most cinematic and least hurried.",
    heroImage: "/images/tours/layer-5301_1680436329.png.webp",
  },
  {
    slug: "cao-bang",
    name: "Cao Bang",
    tagline: "Waterfalls, caves and quiet border roads",
    description:
      "Home to Ban Gioc waterfall and a slower, greener loop. Cao Bang rewards travelers who want scenery without the crowds.",
    heroImage:
      "/images/tours/271604766_323761536313102_3033792690503952637_n-20220113124825_1680436050.jpg.webp",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Hannah & Dan",
    rating: 5,
    trip: "3 Days 2 Nights Motorbike",
    quote:
      "The trip felt cinematic without being hectic. Ma Pi Leng stopped us cold — we just stood there for twenty minutes.",
    date: "2026-05-12",
  },
  {
    id: "r2",
    name: "Minh T.",
    rating: 5,
    trip: "4 Days 3 Nights Motorbike",
    quote:
      "The easy rider option meant my partner and I both enjoyed the loop — one rode, one watched, both fell in love with Ha Giang.",
    date: "2026-04-28",
  },
  {
    id: "r3",
    name: "Sofia R.",
    rating: 5,
    trip: "Jeep Wrangler Tour",
    quote:
      "No licence, no fear — just an open-top Jeep and the most spectacular roads in Vietnam. The guides were exceptional.",
    date: "2026-06-02",
  },
];
