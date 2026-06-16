import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { StatusSelect } from "./status-select";

export const metadata = {
  title: "Manage Orders | Admin",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total_amount,
      status,
      user_id,
      profiles:user_id(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error loading orders.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders and update their shipping status.</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      {order.profiles ? (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.profiles.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">{order.profiles.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Guest</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelect orderId={order.id} currentStatus={order.status} />
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
