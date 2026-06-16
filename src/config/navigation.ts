import {
  Home,
  ShoppingBag,
  Search,
  Heart,
  User,
  Package,
  Settings,
  BarChart3,
  Tag,
  Users,
  Boxes,
  Ticket,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
  badge?: string;
}

/** Main storefront navigation */
export const mainNav: NavItem[] = [
  { label: "New Arrivals", href: "/products?filter=new-arrivals" },
  { label: "Shirts", href: "/categories/shirts" },
  { label: "T-Shirts", href: "/categories/t-shirts" },
  { label: "Jeans", href: "/categories/jeans" },
  { label: "Jackets", href: "/categories/jackets" },
  { label: "Accessories", href: "/categories/accessories" },
];

/** User account navigation */
export const accountNav: NavItem[] = [
  { label: "Profile", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: Home },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
];

/** Admin dashboard sidebar navigation */
export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/** Footer navigation sections */
export const footerNav = {
  shop: [
    { label: "New Arrivals", href: "/products?filter=new-arrivals" },
    { label: "Bestsellers", href: "/products?sort=popularity" },
    { label: "Shirts", href: "/categories/shirts" },
    { label: "T-Shirts", href: "/categories/t-shirts" },
    { label: "Jeans", href: "/categories/jeans" },
    { label: "Jackets", href: "/categories/jackets" },
    { label: "Accessories", href: "/categories/accessories" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "FAQs", href: "/faq" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Track Order", href: "/account/orders" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
};
