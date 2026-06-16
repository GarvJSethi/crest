"use client";

import { cn, formatCurrency, getDiscountPercentage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PriceDisplayProps {
  /** Price in paise */
  price: number;
  /** Compare-at/MRP price in paise (shows strikethrough + discount %) */
  compareAtPrice?: number | null;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays a price in INR with optional compare-at price and discount badge.
 * All prices are in paise internally, formatted to ₹ for display.
 */
export function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discount = hasDiscount
    ? getDiscountPercentage(compareAtPrice, price)
    : 0;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-semibold",
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Current price */}
      <span
        className={cn(
          "font-semibold text-foreground",
          sizeClasses[size]
        )}
      >
        {formatCurrency(price)}
      </span>

      {/* Compare-at price (strikethrough) */}
      {hasDiscount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {formatCurrency(compareAtPrice)}
        </span>
      )}

      {/* Discount badge */}
      {hasDiscount && discount > 0 && (
        <Badge
          variant="secondary"
          className="bg-success/10 text-success border-success/20 text-xs font-medium"
        >
          {discount}% off
        </Badge>
      )}
    </div>
  );
}
