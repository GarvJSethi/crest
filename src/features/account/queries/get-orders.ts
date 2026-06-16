import { createClient } from "@/lib/supabase/server";

export async function getUserOrders() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_amount,
      placed_at,
      order_items (
        id,
        product_name,
        variant_size,
        variant_color,
        product_image_url,
        quantity,
        unit_price
      )
    `)
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }

  return data || [];
}
