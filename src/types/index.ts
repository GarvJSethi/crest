export type {
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  DiscountType,
  AddressType,
  Profile,
  Address,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Inventory,
  Order,
  OrderItem,
  Payment,
  CartItem,
  WishlistItem,
  Review,
  Coupon,
  ProductWithDetails,
  CartItemWithProduct,
  OrderWithItems,
  DashboardStats,
} from "./database.types";

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Server Action result */
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
