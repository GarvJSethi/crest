import {
  ShirtIcon,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: LucideIcon;
  subcategories?: Omit<Category, "subcategories" | "icon">[];
}

/** Product categories for the Crest men's fashion store */
export const categories: Category[] = [
  {
    name: "Shirts",
    slug: "shirts",
    description: "Tailored shirts for every occasion — casual, formal, and everything in between.",
    subcategories: [
      { name: "Casual Shirts", slug: "casual-shirts", description: "Relaxed fits for everyday style" },
      { name: "Formal Shirts", slug: "formal-shirts", description: "Crisp, professional shirts for the office" },
      { name: "Linen Shirts", slug: "linen-shirts", description: "Breathable linen for warm days" },
    ],
  },
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Premium tees crafted from the softest fabrics.",
    subcategories: [
      { name: "Round Neck", slug: "round-neck", description: "Classic round neck tees" },
      { name: "V-Neck", slug: "v-neck", description: "Sleek V-neck silhouettes" },
      { name: "Polo", slug: "polo", description: "Smart casual polo shirts" },
      { name: "Oversized", slug: "oversized", description: "Trendy oversized fits" },
    ],
  },
  {
    name: "Jeans",
    slug: "jeans",
    description: "Premium denim engineered for comfort and style.",
    subcategories: [
      { name: "Slim Fit", slug: "slim-fit", description: "Modern slim fit jeans" },
      { name: "Straight Fit", slug: "straight-fit", description: "Classic straight cut" },
      { name: "Skinny", slug: "skinny", description: "Body-hugging skinny jeans" },
      { name: "Relaxed Fit", slug: "relaxed-fit", description: "Comfortable relaxed jeans" },
    ],
  },
  {
    name: "Cargo Pants",
    slug: "cargo-pants",
    description: "Utility-driven cargo pants with a modern edge.",
    subcategories: [
      { name: "Regular Cargo", slug: "regular-cargo", description: "Classic cargo silhouettes" },
      { name: "Jogger Cargo", slug: "jogger-cargo", description: "Tapered jogger-style cargo" },
    ],
  },
  {
    name: "Jackets",
    slug: "jackets",
    description: "Statement outerwear to complete your look.",
    subcategories: [
      { name: "Bomber Jackets", slug: "bomber-jackets", description: "Iconic bomber styles" },
      { name: "Denim Jackets", slug: "denim-jackets", description: "Timeless denim outerwear" },
      { name: "Leather Jackets", slug: "leather-jackets", description: "Premium leather pieces" },
      { name: "Windbreakers", slug: "windbreakers", description: "Lightweight weather protection" },
    ],
  },
  {
    name: "Belts",
    slug: "belts",
    description: "Handcrafted belts in premium leather.",
    subcategories: [
      { name: "Leather Belts", slug: "leather-belts", description: "Classic leather belts" },
      { name: "Canvas Belts", slug: "canvas-belts", description: "Casual canvas styles" },
    ],
  },
  {
    name: "Wallets",
    slug: "wallets",
    description: "Slim, functional wallets crafted from fine materials.",
    subcategories: [
      { name: "Bi-Fold", slug: "bi-fold", description: "Classic bi-fold wallets" },
      { name: "Card Holders", slug: "card-holders", description: "Minimalist card holders" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "The finishing touches that define your style.",
    subcategories: [
      { name: "Watches", slug: "watches", description: "Timepieces for the modern man" },
      { name: "Sunglasses", slug: "sunglasses", description: "Premium eyewear" },
      { name: "Caps & Hats", slug: "caps-hats", description: "Headwear for every season" },
      { name: "Bags", slug: "bags", description: "Backpacks, duffels, and more" },
    ],
  },
];

/** Flat list of all category slugs (including subcategories) */
export const allCategorySlugs = categories.flatMap((cat) => [
  cat.slug,
  ...(cat.subcategories?.map((sub) => sub.slug) ?? []),
]);

/** Find a category by slug */
export function getCategoryBySlug(slug: string): Category | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    const sub = cat.subcategories?.find((s) => s.slug === slug);
    if (sub) return sub;
  }
  return undefined;
}

/** Get parent category of a subcategory */
export function getParentCategory(subSlug: string): Category | undefined {
  return categories.find((cat) =>
    cat.subcategories?.some((sub) => sub.slug === subSlug)
  );
}
