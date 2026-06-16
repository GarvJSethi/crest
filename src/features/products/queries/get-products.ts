import { createClient } from "@/lib/supabase/server";

export type ProductWithIncludes = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_new_arrival: boolean;
  category: { name: string; slug: string } | null;
  primary_image: { url: string; alt_text: string | null } | null;
};

export async function getProducts({
  categorySlug,
  searchQuery,
  limit = 20,
}: {
  categorySlug?: string;
  searchQuery?: string;
  limit?: number;
} = {}): Promise<ProductWithIncludes[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      brand,
      base_price,
      compare_at_price,
      is_new_arrival,
      category:categories(name, slug),
      images:product_images(url, alt_text)
    `)
    .eq("is_active", true)
    .eq("images.is_primary", true)
    .limit(limit);

  if (categorySlug) {
    // We would normally join on category.slug here, but PostgREST syntax for nested filtering is a bit complex
    // For simplicity, we assume we first fetch the category ID if categorySlug is provided.
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
      
    if (catData) {
      query = query.eq("category_id", catData.id);
    }
  }

  if (searchQuery) {
    const formattedQuery = searchQuery
      .trim()
      .split(/\s+/)
      .map((word) => `${word}:*`)
      .join(" & ");
    // Using PostgreSQL full text search via Supabase
    query = query.textSearch("search_vector", formattedQuery);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Format the response to extract the primary image from the array
  return (data as any[]).map((product) => ({
    ...product,
    category: Array.isArray(product.category) ? product.category[0] : product.category,
    primary_image: product.images && product.images.length > 0 ? product.images[0] : null,
  }));
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(*),
      variants:product_variants(
        *,
        inventory(quantity)
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  return data;
}
