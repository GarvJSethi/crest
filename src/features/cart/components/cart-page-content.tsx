"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function CartPageContent() {
  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Trash2 className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Looks like you haven't added anything to your cart yet. Let's find some great additions for your wardrobe.
        </p>
        <Link href="/products" className="inline-flex items-center justify-center font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-none">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-end border-b pb-4 mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Shopping Cart</h2>
          <span className="text-muted-foreground font-medium">{totalItems} Items</span>
        </div>

        <div className="flex flex-col gap-8">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-6 group">
              {/* Image */}
              <Link href={`/products/${item.slug || "item"}`} className="relative h-32 w-24 md:h-40 md:w-32 bg-muted shrink-0 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted" />
                )}
              </Link>

              {/* Details */}
              <div className="flex flex-col flex-grow justify-between py-1">
                <div className="flex justify-between gap-4 items-start">
                  <div>
                    <Link href={`/products/${item.slug || "item"}`} className="hover:underline font-medium text-lg line-clamp-2">
                      {item.name}
                    </Link>
                    <div className="flex flex-wrap text-sm text-muted-foreground mt-1 gap-x-4 gap-y-1">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                  </div>
                  <div className="text-right font-semibold text-lg shrink-0">
                    {formatCurrency(item.price)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity controls */}
                  <div className="flex items-center border">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-sm text-muted-foreground hover:text-destructive underline underline-offset-4 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-muted p-8 sticky top-24">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          
          <div className="space-y-4 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-t border-border pt-4 mt-4">
              <span className="font-semibold text-base">Total</span>
              <span className="font-semibold text-base">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <Link 
            href="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "w-full h-14 text-base rounded-none mb-4 group")}
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="text-xs text-center text-muted-foreground">
            Taxes and shipping calculated at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
