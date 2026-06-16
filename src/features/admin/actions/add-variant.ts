"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addVariantAction(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden" };

  // 2. Parse Form Data
  const productId = formData.get("productId") as string;
  const sku = formData.get("sku") as string;
  const size = formData.get("size") as string;
  const color = formData.get("color") as string;
  const stock = parseInt(formData.get("stock") as string, 10);

  if (!productId || !sku || isNaN(stock)) {
    return { error: "Missing required fields." };
  }

  // 3. Database Inserts
  // Insert Variant
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      sku,
      size,
      color,
    })
    .select("id")
    .single();

  if (variantError || !variant) {
    console.error("Variant insert error:", variantError);
    return { error: "Failed to create variant." };
  }

  // Insert Inventory
  const { error: inventoryError } = await supabase
    .from("inventory")
    .insert({
      variant_id: variant.id,
      quantity: stock
    });

  if (inventoryError) {
    console.error("Inventory insert error:", inventoryError);
    return { error: "Failed to set inventory." };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  
  return { success: true };
}
