import { getAdminStats } from "@/features/admin/queries/get-admin-stats";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowRight, DollarSign, Package, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | Crest",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to the Crest Admin Control Panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Metric Cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            Total Revenue
          </div>
          <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShoppingBag className="w-4 h-4" />
            Total Orders
          </div>
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Package className="w-4 h-4" />
            Active Products
          </div>
          <div className="text-3xl font-bold">{stats.activeProducts}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b">
          <div>
            <h3 className="font-semibold text-lg">Recent Orders</h3>
            <p className="text-sm text-muted-foreground">The latest 5 orders placed on the store.</p>
          </div>
          <Link href="/admin/orders" className="text-sm text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{order.id.split("-")[0]}</td>
                    <td className="px-6 py-4">
                      {order.profiles ? (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.profiles.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">{order.profiles.email}</span>
                        </div>
                      ) : (
                        "Guest"
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-800" : ""}
                        ${order.status === "pending" || order.status === "processing" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${order.status === "shipped" ? "bg-blue-100 text-blue-800" : ""}
                        ${order.status === "cancelled" || order.status === "refunded" ? "bg-red-100 text-red-800" : ""}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
