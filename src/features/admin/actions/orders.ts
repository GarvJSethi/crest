"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  // 2. Update status
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    throw new Error("Failed to update order status");
  }

  // 3. Optional: Insert into order_status_history
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    notes: `Status updated to ${newStatus} by admin.`,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/dashboard/orders");
  
  return { success: true };
}
