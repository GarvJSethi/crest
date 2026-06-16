import { createClient } from "@/lib/supabase/server";

export async function getAdminStats() {
  const supabase = await createClient();

  // 1. Get total orders and calculate revenue
  // We only count 'completed', 'shipped', 'processing', 'delivered' as revenue, 
  // but for a simple overview we can just sum totals of non-cancelled orders.
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total_amount, status");

  if (ordersError) {
    console.error("Error fetching admin stats (orders):", ordersError);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      recentOrders: [],
      activeProducts: 0,
    };
  }

  const validOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
  const totalRevenue = validOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalOrders = orders.length;

  // 2. Get active products count
  const { count: activeProducts, error: productsError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (productsError) {
    console.error("Error fetching admin stats (products):", productsError);
  }

  // 3. Get recent 5 orders for the dashboard
  const { data: rawRecentOrders } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total_amount,
      status,
      user_id,
      profiles!orders_user_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentOrders = rawRecentOrders as any[];

  return {
    totalRevenue,
    totalOrders,
    activeProducts: activeProducts || 0,
    recentOrders: recentOrders || [],
  };
}
