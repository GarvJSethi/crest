import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  user: {
    full_name: string | null;
  } | null;
};

export type RatingSummary = {
  average_rating: number;
  review_count: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
};

export async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      title,
      body,
      created_at,
      profiles!reviews_user_id_fkey(full_name)
    `)
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return (data as any[]).map((row) => ({
    ...row,
    user: row.profiles ? (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) : null,
  }));
}

export async function getProductRatingSummary(productId: string): Promise<RatingSummary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_rating_summary")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error fetching product rating summary:", error);
    }
    return null;
  }

  return data as RatingSummary;
}
