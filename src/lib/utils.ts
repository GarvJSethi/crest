import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format paise amount to INR display string.
 * @param paise - Amount in paise (₹599 = 59900)
 * @param showSymbol - Whether to prepend ₹ symbol (default: true)
 * @example formatCurrency(59900) → "₹599.00"
 * @example formatCurrency(59900, false) → "599.00"
 * @example formatCurrency(150050) → "₹1,500.50"
 */
export function formatCurrency(paise: number, showSymbol = true): string {
  const amount = paise / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return formatted;
}

/**
 * Format paise to compact display (e.g., ₹1.5K, ₹2.3L)
 */
export function formatCurrencyCompact(paise: number): string {
  const amount = paise / 100;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(paise);
}

/**
 * Calculate discount percentage between two prices
 * @param originalPaise - Original price in paise
 * @param salePaise - Sale price in paise
 */
export function getDiscountPercentage(
  originalPaise: number,
  salePaise: number
): number {
  if (originalPaise <= 0) return 0;
  return Math.round(((originalPaise - salePaise) / originalPaise) * 100);
}

/**
 * Generate a URL-safe slug from a string
 * @example slugify("Men's Slim Fit Jeans") → "mens-slim-fit-jeans"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text with ellipsis
 * @example truncate("Long product description...", 50)
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/**
 * Format a date for display
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Delay execution (for loading states, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random order number (client-side preview only)
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

/**
 * Get initials from a name (for avatars)
 * @example getInitials("Garv Jain") → "GJ"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Type-safe Object.keys
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Check if a value is not null or undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
