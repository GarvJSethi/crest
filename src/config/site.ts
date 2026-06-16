/** Crest — Site configuration and brand metadata */
export const siteConfig = {
  name: "Crest",
  tagline: "Premium Men's Fashion",
  description:
    "Discover curated premium men's fashion at Crest. From tailored essentials to contemporary streetwear — elevate your wardrobe with pieces designed for the modern man.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/images/og-image.jpg",
  currency: "INR" as const,
  currencySymbol: "₹",
  locale: "en-IN",
  country: "IN",

  /** Contact & social */
  contact: {
    email: "hello@crest.in",
    phone: "+91 98765 43210",
    address: "Mumbai, Maharashtra, India",
  },

  social: {
    instagram: "https://instagram.com/crest",
    twitter: "https://twitter.com/crest",
    facebook: "https://facebook.com/crest",
  },

  /** SEO defaults */
  seo: {
    titleTemplate: "%s | Crest",
    defaultTitle: "Crest | Premium Men's Fashion",
    defaultDescription:
      "Discover curated premium men's fashion at Crest. Elevate your wardrobe with pieces designed for the modern man.",
    keywords: [
      "men's fashion",
      "premium clothing",
      "men's shirts",
      "men's jeans",
      "men's accessories",
      "online shopping India",
      "designer menswear",
      "Crest fashion",
    ],
  },

  /** Business rules */
  rules: {
    freeShippingThreshold: 99900, // ₹999 in paise
    minOrderValue: 49900, // ₹499 in paise
    maxCartQuantity: 10,
    productsPerPage: 24,
    reviewsPerPage: 10,
    lowStockThreshold: 5,
  },
} as const;

export type SiteConfig = typeof siteConfig;
