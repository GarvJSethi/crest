import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PackageOpen, Search, Heart, ShoppingCart, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Empty state component for when no content is available.
 * Used for empty cart, no search results, empty wishlist, etc.
 */
export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center btn-gold rounded-full px-8 h-10 text-sm font-medium"
            >
              {actionLabel}
            </Link>
          ) : (
            <Button onClick={onAction} className="btn-gold rounded-full px-8">
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

/** Pre-configured empty states for common use cases */
export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet. Start exploring our collection."
      actionLabel="Start Shopping"
      actionHref="/products"
    />
  );
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon={Heart}
      title="Your wishlist is empty"
      description="Save items you love to your wishlist. They'll be waiting for you here."
      actionLabel="Explore Products"
      actionHref="/products"
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      actionLabel="Browse All Products"
      actionHref="/products"
    />
  );
}
