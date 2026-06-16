"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { formatCurrency, getDiscountPercentage, cn } from "@/lib/utils";
import type { ProductWithIncludes } from "../queries/get-products";
import { useWishlistStore } from "@/stores/wishlist-store";

export function ProductCard({ product }: { product: ProductWithIncludes }) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const imageUrl = product.primary_image?.url || "https://images.unsplash.com/photo-1515347619253-12224e0388cd?q=80&w=800&auto=format&fit=crop";
  const discount = product.compare_at_price 
    ? getDiscountPercentage(product.compare_at_price, product.base_price)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.base_price,
      image: imageUrl,
      brand: product.brand,
    });
  };

  return (
    <div className="group flex flex-col gap-3">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-xl">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10">
          <span className="sr-only">View {product.name}</span>
        </Link>
        <Image
          src={imageUrl}
          alt={product.primary_image?.alt_text || product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {product.is_new_arrival && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-sm uppercase tracking-wider">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-sm uppercase tracking-wider">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all shadow-sm hover:scale-110",
            isWishlisted ? "opacity-100 text-destructive hover:bg-background" : "opacity-0 group-hover:opacity-100 hover:bg-background hover:text-destructive"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <div>
            {product.brand && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                {product.brand}
              </p>
            )}
            <Link href={`/products/${product.slug}`} className="hover:underline">
              <h3 className="font-medium text-foreground line-clamp-1">{product.name}</h3>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-foreground">
            {formatCurrency(product.base_price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
