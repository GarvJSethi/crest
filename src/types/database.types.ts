/**
 * Crest — Database TypeScript types
 * These types mirror the Supabase PostgreSQL schema.
 * In production, generate these with: npx supabase gen types typescript
 */

export type UserRole = "customer" | "admin" | "super_admin";
export type OrderStatus =
  | "pending" | "confirmed" | "processing" | "shipped"
  | "out_for_delivery" | "delivered" | "cancelled" | "returned"
  | "refund_initiated" | "refunded";
export type PaymentStatus =
  | "created" | "authorized" | "captured" | "failed"
  | "refunded" | "partially_refunded";
export type PaymentMethod =
  | "card" | "upi" | "netbanking" | "wallet" | "emi" | "cod";
export type DiscountType = "percentage" | "fixed_amount";
export type AddressType = "shipping" | "billing";

// ── Core Tables ──

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  date_of_birth: string | null;
  gender: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  address_type: AddressType;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  brand: string | null;
  material: string | null;
  care_instructions: string | null;
  /** Price in paise */
  base_price: number;
  /** Compare-at price in paise */
  compare_at_price: number | null;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  weight_grams: number | null;
  hsn_code: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  color_hex: string | null;
  attributes: Record<string, unknown>;
  /** Price override in paise (null = use base_price) */
  price_override: number | null;
  weight_grams: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  color_variant: string | null;
  created_at: string;
}

export interface Inventory {
  id: string;
  variant_id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string | null;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown> | null;
  /** All amounts in paise */
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  coupon_id: string | null;
  coupon_code: string | null;
  razorpay_order_id: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  estimated_delivery: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  placed_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_name: string;
  variant_sku: string;
  variant_size: string;
  variant_color: string;
  product_image_url: string | null;
  /** All amounts in paise */
  unit_price: number;
  quantity: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod | null;
  error_code: string | null;
  error_description: string | null;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  added_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_item_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  admin_reply: string | null;
  admin_replied_at: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_per_user: number;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Joined/Extended Types (for frontend use) ──

export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: (ProductVariant & { inventory: Inventory | null })[];
  tags: { id: string; name: string; slug: string }[];
  rating_summary?: {
    total_reviews: number;
    average_rating: number;
  };
}

export interface CartItemWithProduct extends CartItem {
  variant: ProductVariant & {
    product: Product & {
      images: ProductImage[];
    };
    inventory: Inventory | null;
  };
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  payment: Payment | null;
}

/** Admin dashboard stats */
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: OrderWithItems[];
  lowStockAlerts: {
    variant_id: string;
    product_name: string;
    sku: string;
    size: string;
    color: string;
    quantity: number;
    low_stock_threshold: number;
  }[];
}
