"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(
  productId: string,
  rating: number,
  title: string | null,
  body: string | null
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { success: false, error: "You must be logged in to leave a review." };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: userData.user.id,
    rating,
    title,
    body,
    is_approved: true, // Auto-approving for demo purposes
  });

  if (error) {
    if (error.code === "23505") { // Unique violation
      return { success: false, error: "You have already reviewed this product." };
    }
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review. Please try again." };
  }

  // We should ideally refresh the materialized view here using an RPC call.
  // For now, we attempt an RPC if it exists:
  try {
    await supabase.rpc("refresh_product_rating_summary");
  } catch (e) {
    // ignore
  }

  revalidatePath(`/products`);
  return { success: true };
}
