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

// Helper function to get WhatsApp link (legacy — kept for reference only)
export const getWhatsAppLink = (message?: string) => {
  const baseUrl = `https://wa.me/${siteConfig.contact.whatsappPhone}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
};

// Helper function to get phone link
export const getPhoneLink = () => {
  return `tel:+${siteConfig.contact.whatsappPhone}`;
};
