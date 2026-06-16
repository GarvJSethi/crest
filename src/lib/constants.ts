/** Crest — Application-wide constants */

/** Available product sizes */
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

/** Waist sizes for jeans/pants */
export const WAIST_SIZES = ["28", "30", "32", "34", "36", "38", "40", "42"] as const;
export type WaistSize = (typeof WAIST_SIZES)[number];

/** Available product colors with hex values */
export const COLORS = [
  { name: "Black", hex: "#0A0A0A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy Blue", hex: "#1B1B3A" },
  { name: "Charcoal Grey", hex: "#36454F" },
  { name: "Olive Green", hex: "#556B2F" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Light Blue", hex: "#ADD8E6" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Indigo", hex: "#3F0FB7" },
  { name: "Khaki", hex: "#C3B091" },
  { name: "Stone", hex: "#928E85" },
  { name: "Washed Blue", hex: "#6B8CAE" },
] as const;

/** Order status labels and colors */
export const ORDER_STATUSES = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "info" },
  processing: { label: "Processing", color: "info" },
  shipped: { label: "Shipped", color: "info" },
  out_for_delivery: { label: "Out for Delivery", color: "info" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "destructive" },
  returned: { label: "Returned", color: "destructive" },
  refund_initiated: { label: "Refund Initiated", color: "warning" },
  refunded: { label: "Refunded", color: "muted" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

/** Payment statuses */
export const PAYMENT_STATUSES = {
  created: { label: "Created", color: "muted" },
  authorized: { label: "Authorized", color: "warning" },
  captured: { label: "Captured", color: "success" },
  failed: { label: "Failed", color: "destructive" },
  refunded: { label: "Refunded", color: "info" },
  partially_refunded: { label: "Partially Refunded", color: "warning" },
} as const;

/** User roles */
export const USER_ROLES = {
  customer: "Customer",
  admin: "Admin",
  super_admin: "Super Admin",
} as const;

export type UserRole = keyof typeof USER_ROLES;

/** Pagination defaults */
export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 24,
  pageSizeOptions: [12, 24, 48, 96],
  maxPageSize: 100,
} as const;

/** Image dimensions for product images */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 200 },
  card: { width: 400, height: 533 },
  gallery: { width: 800, height: 1067 },
  full: { width: 1200, height: 1600 },
} as const;

/** Max file sizes for uploads */
export const UPLOAD_LIMITS = {
  productImage: 5 * 1024 * 1024, // 5MB
  avatar: 2 * 1024 * 1024, // 2MB
  maxImagesPerProduct: 8,
} as const;
