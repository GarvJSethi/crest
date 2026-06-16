"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchSuggestion = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  primary_image: { url: string; alt_text: string | null } | null;
};

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length === 0) return [];

  const supabase = await createClient();

  const formattedQuery = query
    .trim()
    .split(/\s+/)
    .map((word) => `${word}:*`)
    .join(" & ");

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      base_price,
      images:product_images(url, alt_text)
    `)
    .eq("is_active", true)
    .eq("images.is_primary", true)
    .textSearch("search_vector", formattedQuery)
    .limit(5);

  if (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }

  return (data as any[]).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    base_price: product.base_price,
    primary_image: product.images && product.images.length > 0 ? product.images[0] : null,
  }));
}
