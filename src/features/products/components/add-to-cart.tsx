"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { ShoppingBag, Heart } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";

interface AddToCartButtonProps {
  product: any;
  variants: any[];
}

export function AddToCart({ product, variants }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);
  
  // Basic variant selection logic
  const colors = [...new Set(variants.map(v => v.color))].filter(Boolean);
  const sizes = [...new Set(variants.map(v => v.size))].filter(Boolean);
  
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);

  const getStock = (variant: any) => {
    if (!variant || !variant.inventory) return 0;
    return Array.isArray(variant.inventory) ? variant.inventory[0]?.quantity || 0 : variant.inventory.quantity || 0;
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const sizeExists = variants.some(v => v.color === color && v.size === selectedSize && getStock(v) > 0);
    if (!sizeExists) {
      const firstAvailableSize = variants.find(v => v.color === color && getStock(v) > 0)?.size;
      setSelectedSize(firstAvailableSize || null);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const colorExists = variants.some(v => v.size === size && v.color === selectedColor && getStock(v) > 0);
    if (!colorExists) {
      const firstAvailableColor = variants.find(v => v.size === size && getStock(v) > 0)?.color;
      setSelectedColor(firstAvailableColor || null);
    }
  };

  // Find the selected variant
  const selectedVariant = variants.find(
    v => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize)
  ) || variants[0];

  const price = selectedVariant?.price_override || product.base_price;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select all options");
      return;
    }

    addItem({
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: price,
      image: product.images?.[0]?.url || "",
      size: selectedVariant.size || "",
      color: selectedVariant.color || "",
      colorHex: selectedVariant.color_hex || "",
      sku: selectedVariant.sku || "",
      maxStock: getStock(selectedVariant) || 10,
    });
    
    toast.success("Added to cart");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-2xl font-semibold">
        {formatCurrency(price)}
      </div>

      {colors.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Color: {selectedColor}</span>
          <div className="flex gap-2">
            {colors.map((color) => {
              const variant = variants.find(v => v.color === color);
              const isAvailable = sizes.length === 0 || variants.some(v => v.color === color && v.size === selectedSize && getStock(v) > 0);
              return (
                <button
                  key={color as string}
                  onClick={() => handleColorSelect(color as string)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? "border-primary" : "border-transparent ring-1 ring-border opacity-70"
                  }`}
                  style={{ backgroundColor: variant?.color_hex || "#000" }}
                  aria-label={`Select ${color}`}
                />
              )
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Size: {selectedSize}</span>
            <button className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isAvailable = colors.length === 0 || variants.some(v => v.color === selectedColor && v.size === size && getStock(v) > 0);
              return (
              <button
                key={size as string}
                onClick={() => handleSizeSelect(size as string)}
                disabled={!isAvailable}
                className={`min-w-12 h-10 px-4 flex items-center justify-center border text-sm font-medium rounded-md transition-all ${
                  selectedSize === size 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : !isAvailable
                      ? "border-muted text-muted-foreground opacity-40 cursor-not-allowed bg-muted/50"
                      : "border-input hover:border-primary/50 hover:bg-accent"
                }`}
              >
                {size as string}
              </button>
            )})}
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t">
        <Button onClick={handleAddToCart} size="lg" className="flex-1 h-14 text-base rounded-none">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn("h-14 w-14 rounded-none transition-colors", isWishlisted && "text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive")}
          onClick={() => toggleItem({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.base_price,
            image: product.images?.[0]?.url || "",
            brand: product.brand,
          })}
        >
          <Heart className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
        </Button>
      </div>
    </div>
  );
}
