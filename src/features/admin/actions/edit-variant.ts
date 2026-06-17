"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function editVariantAction(formData: FormData) {
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
  const variantId = formData.get("variantId") as string;
  const productId = formData.get("productId") as string;
  const sku = formData.get("sku") as string;
  const size = formData.get("size") as string;
  const color = formData.get("color") as string;
  const stock = parseInt(formData.get("stock") as string, 10);
  const imageUrl = formData.get("imageUrl") as string;
  const removeImage = formData.get("removeImage") === "true";

  if (!variantId || !productId || !sku || isNaN(stock)) {
    return { error: "Missing required fields." };
  }

  // 3. Database Updates
  const { error: variantError } = await supabase
    .from("product_variants")
    .update({
      sku,
      size,
      color,
    })
    .eq("id", variantId);

  if (variantError) {
    console.error("Variant update error:", variantError);
    return { error: "Failed to update variant." };
  }

  // Update Inventory
  const { error: inventoryError } = await supabase
    .from("inventory")
    .update({
      quantity: stock
    })
    .eq("variant_id", variantId);

  if (inventoryError) {
    console.error("Inventory update error:", inventoryError);
    return { error: "Failed to update inventory." };
  }

  // 4. Handle Image
  if (color) {
    if (removeImage) {
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId)
        .eq("color_variant", color);
    } else if (imageUrl) {
      // Remove existing for this color first to avoid duplicates
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId)
        .eq("color_variant", color);

      // Insert new
      await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          color_variant: color,
          url: imageUrl,
          is_primary: false,
          display_order: 99,
        });
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  
  return { success: true };
}

export async function deleteVariantAction(variantId: string, productId: string) {
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

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) {
    return { error: "Failed to delete variant." };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  
  return { success: true };
}
