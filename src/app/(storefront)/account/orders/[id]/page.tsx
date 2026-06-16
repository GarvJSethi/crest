import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Package, Truck, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Order Details | Crest",
};

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch order with its items
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-indigo-100 text-indigo-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const shipping = order.shipping_address as any;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/account" className="p-2 border rounded-md hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{order.order_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Items */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
              <h2 className="font-serif font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                Items Ordered
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize tracking-wide ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="divide-y">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="w-20 h-24 bg-muted rounded-md overflow-hidden relative shrink-0">
                    {item.product_image_url ? (
                      <Image 
                        src={item.product_image_url} 
                        alt={item.product_name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-6 h-6 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{item.product_name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 space-x-2">
                        {item.variant_color && <span>Color: {item.variant_color}</span>}
                        {item.variant_color && item.variant_size && <span>|</span>}
                        {item.variant_size && <span>Size: {item.variant_size}</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-sm font-medium text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.unit_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Info Timeline */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif font-semibold text-lg mb-6 border-b pb-2">Order Timeline</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.placed_at).toLocaleString()}</p>
                </div>
              </div>
              {order.confirmed_at && (
                <div className="flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="font-medium">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.confirmed_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {order.shipped_at && (
                <div className="flex gap-4">
                  <div className="mt-1"><Truck className="w-5 h-5 text-indigo-600" /></div>
                  <div>
                    <p className="font-medium">Order Shipped</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.shipped_at).toLocaleString()}</p>
                    {order.tracking_number && (
                      <p className="text-sm font-mono mt-1 bg-muted p-1 rounded inline-block">Tracking: {order.tracking_number}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif font-semibold text-lg mb-4 border-b pb-2">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shipping_amount === 0 ? "Free" : formatCurrency(order.shipping_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-3 border-t mt-3">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif font-semibold text-lg mb-4 border-b pb-2">Shipping Address</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{shipping?.full_name}</p>
              <p>{shipping?.address_line_1}</p>
              {shipping?.address_line_2 && <p>{shipping.address_line_2}</p>}
              <p>{shipping?.city}, {shipping?.state} {shipping?.postal_code}</p>
              <p className="pt-2">Phone: {shipping?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
