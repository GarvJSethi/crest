import Link from "next/link";
import { getUserOrders } from "@/features/account/queries/get-orders";
import { formatCurrency } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const orders = await getUserOrders();
  const recentOrders = orders.slice(0, 2); // Show top 2

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif tracking-tight mb-2">Account Overview</h1>
        <p className="text-muted-foreground">Welcome to your dashboard. Manage your orders, addresses, and profile details here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="border rounded-xl p-6 bg-muted/30">
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/account/orders" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
                View all orders
              </Link>
            </li>
            <li>
              <Link href="/account/addresses" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
                Manage saved addresses
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="text-muted-foreground hover:text-foreground underline underline-offset-4">
                View your wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Profile Stats */}
        <div className="border rounded-xl p-6 bg-muted/30">
          <h3 className="font-semibold text-lg mb-4">Your Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-serif">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div>
              <p className="text-3xl font-serif">
                {orders.length > 0 ? "Yes" : "No"}
              </p>
              <p className="text-sm text-muted-foreground">Active Customer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Widget */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif">Recent Orders</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
              View All
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="border rounded-xl p-8 text-center bg-muted/20">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link href="/products" className="inline-flex items-center justify-center font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Order {order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.placed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                    <p className="text-sm capitalize px-2 py-0.5 rounded-full bg-muted inline-block mt-1">
                      {order.status.replace("_", " ")}
                    </p>
                  </div>
                  <Link href={`/account/orders/${order.id}`} className="text-sm font-medium hover:underline underline-offset-4">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
