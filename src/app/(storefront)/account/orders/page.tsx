import Link from "next/link";
import Image from "next/image";
import { getUserOrders } from "@/features/account/queries/get-orders";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Order History | Crest",
};

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif tracking-tight mb-2">Order History</h1>
        <p className="text-muted-foreground">View and track all your previous orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="border rounded-xl p-12 text-center bg-muted/20">
          <p className="text-muted-foreground mb-6 text-lg">You haven't placed any orders yet.</p>
          <Link href="/products" className="inline-flex items-center justify-center font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-md">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => (
            <div key={order.id} className="border rounded-xl overflow-hidden">
              {/* Order Header */}
              <div className="bg-muted/50 p-4 md:px-6 md:py-4 flex flex-col sm:flex-row justify-between gap-4 border-b">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Order Placed</p>
                    <p className="font-medium">{new Date(order.placed_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Total</p>
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-muted-foreground mb-1">Order Number</p>
                    <p className="font-medium font-mono">{order.order_number}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end justify-center">
                  <span className="capitalize px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 md:p-6 divide-y">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 md:gap-6">
                    <div className="relative h-24 w-20 md:h-32 md:w-24 bg-muted rounded shrink-0 overflow-hidden">
                      {item.product_image_url ? (
                        <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" />
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between gap-4 items-start mb-2">
                        <h4 className="font-medium line-clamp-2">{item.product_name}</h4>
                        <span className="font-medium whitespace-nowrap">{formatCurrency(item.unit_price)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-4">
                        {item.variant_color && <span>Color: {item.variant_color}</span>}
                        {item.variant_size && <span>Size: {item.variant_size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
