"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartOff, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WishlistPageContent() {
  const { items, removeItem } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <HeartOff className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-serif mb-4">Your wishlist is empty</h2>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Save your favorite items here while you decide. Let's find some great pieces for your collection.
        </p>
        <Link href="/products" className="inline-flex items-center justify-center font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-none">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end border-b pb-4">
        <h1 className="text-3xl font-serif tracking-tight">Your Wishlist</h1>
        <span className="text-muted-foreground font-medium">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((item) => (
          <div key={item.productId} className="group flex flex-col gap-3">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-xl">
              <Link href={`/products/${item.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">View {item.name}</span>
              </Link>
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted" />
              )}

              {/* Remove Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(item.productId);
                }}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all shadow-sm hover:scale-110 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2">
              <div>
                {item.brand && (
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    {item.brand}
                  </p>
                )}
                <Link href={`/products/${item.slug}`} className="hover:underline">
                  <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                </Link>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="font-semibold text-foreground">
                  {formatCurrency(item.price)}
                </span>
                <Link href={`/products/${item.slug}`} className="inline-flex items-center justify-center font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 text-xs rounded-md">
                  <ShoppingBag className="w-3 h-3 mr-2" />
                  Select Size
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
