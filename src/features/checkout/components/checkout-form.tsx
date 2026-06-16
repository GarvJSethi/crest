"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { createOrderAction } from "../actions/create-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingAmount = subtotal > 200000 ? 0 : 10000;
  const taxAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + shippingAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createOrderAction(items, formData);
      
      if (result.success && result.orderId) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/checkout/success?order=${result.orderNumber}`);
      } else {
        toast.error(result.error || "Failed to place order.");
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Checkout Form */}
      <div className="lg:col-span-7 xl:col-span-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-2xl font-serif mb-6">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input required id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input required id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input required id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input required id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input required id="state" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">PIN Code</Label>
                <Input required id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h2 className="text-2xl font-serif mb-6">Payment</h2>
            <div className="bg-muted p-4 rounded-md border border-border text-sm text-muted-foreground mb-6">
              This is a secure mock checkout for development. Clicking 'Pay Now' will immediately process the order without requiring actual payment details.
            </div>
            
            <Button type="submit" size="lg" className="w-full h-14 text-base" disabled={isLoading}>
              {isLoading ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
            </Button>
          </div>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-5 xl:col-span-4 sticky top-24 bg-muted/50 p-6 md:p-8 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
        
        <div className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
          {items.map(item => (
            <div key={item.variantId} className="flex gap-4">
              <div className="relative h-20 w-16 bg-muted shrink-0 rounded overflow-hidden">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center z-10 border-2 border-background">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-col justify-center flex-grow">
                <span className="font-medium text-sm line-clamp-1">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.size} / {item.color}</span>
              </div>
              <div className="font-medium text-sm flex items-center">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 text-sm pt-6 border-t border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingAmount === 0 ? "Free" : formatCurrency(shippingAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Tax (18%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between pt-4 mt-4 border-t border-border text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
