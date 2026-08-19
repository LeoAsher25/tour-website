/**
 * Centralized site configuration
 * Brand names, contact info, social media, and metadata
 * Update this file to change branding across the entire site
 */

export const siteConfig = {
  // Brand Identity
  brand: {
    shortName: "Jasmine",
    businessName: "Jasmine Tours",
    location: "Ha Giang",
    fullName: "Jasmine Tours Ha Giang",
  },

  // Contact Information
  contact: {
    phone: "+84 375 299 476",
    whatsappPhone: "84375299476", // legacy — kept for reference only
    zaloPhone: "84375299476", // Zalo contact (no +), same number as hotline
    zaloUrl: "https://zalo.me/84375299476",
    email: "support@jasminehagiang.com",
    hours: "8am – 10pm (GMT+7)",
  },

  // Social Media
  social: {
    instagram: "https://www.instagram.com/jasminehagiang/",
  },

  // Website
  domain: "jasminehagiang.com",

  // Images & Assets
  assets: {
    logo: "/images/logo.png",
  },

  // Navigation Items
  navigation: [
    { label: "Home", href: "/" },
    { label: "Tours", href: "/#tours" },
    { label: "Itinerary", href: "/#itinerary" },
    { label: "Services", href: "/#services" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Blog", href: "/blogs" },
  ],

  // SEO & Metadata
  seo: {
    title: "Jasmine Tours Ha Giang | Ha Giang Loop Motorbike Tours",
    description:
      "Ride the legendary Ha Giang Loop with Jasmine Tours. Small-group motorbike tours, easy rider options, private tours and jeep adventures through Vietnam's wild northern frontier.",
  },

  // Taglines & Copy
  taglines: {
    heroSubtitle: "The Ha Giang Loop, ridden with you.",
    description:
      "Small-group motorbike tours, easy rider options and private jeep adventures through Vietnam's wild northern frontier. Homestays, local guides, and the most spectacular roads in the country.",
  },
} as const;

// Helper function to get Zalo link (deep link with optional prefilled message)
export const getZaloLink = (message?: string) => {
  const baseUrl = siteConfig.contact.zaloUrl;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
};


// Helper function to get phone link
export const getPhoneLink = () => {
  return `tel:+${siteConfig.contact.whatsappPhone}`;
};

// ---------------------------------------------------------------------------
// Marketing content (static — not admin-managed)
// ---------------------------------------------------------------------------

/** Homepage experience stats. */
export const strengths = [
  {
    title: "Years of Experience",
    value: "12+",
    text: "Guiding riders through the Ha Giang Loop since 2012.",
  },
  {
    title: "Tours in Ha Giang",
    value: "4,000+",
    text: "Trips completed across the loop, every season.",
  },
  {
    title: "Trusted Customers",
    value: "12,000+",
    text: "Happy travellers from over 60 countries.",
  },
];

/** Fleet & services shown on the homepage. */
export const services = [
  {
    title: "Semi-automatic Honda 110cc",
    image: "/images/services/2023/03/16/large/honda-wave-110cc-new_1678933906.png.webp",
    text: "The classic loop bike. New generation, easy to learn.",
  },
  {
    title: "Suzuki HJ125cc",
    image: "/images/services/2023/03/16/large/suzuki-hj125-2019_1678934001.jpg.webp",
    text: "Manual gearbox for confident riders.",
  },
  {
    title: "Honda XR150cc",
    image: "/images/services/2024/10/22/large/xr150_1729593790.png.webp",
    text: "The upgrade choice for longer days in the saddle.",
  },
  {
    title: "Jeep Wrangler Sahara",
    image: "/images/services/2025/11/23/large/unnamed_1763884958.jpg.webp",
    text: "Ride pillion with a driver-guide in an open-top Jeep.",
  },
];
