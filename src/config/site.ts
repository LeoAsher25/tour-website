/**
 * Centralized site configuration
 * Brand names, contact info, social media, and metadata.
 *
 * User-facing copy (navigation labels, taglines, SEO text, marketing
 * content) lives in the i18n message dictionaries (messages/{locale}.json)
 * and is read through `useTranslations`/`getTranslations`. Only
 * language-neutral brand & contact data stays here.
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
