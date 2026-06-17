"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProductImageAction(imageId: string, productId: string) {
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

  // 2. Delete Record
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("Failed to delete image:", error);
    return { error: "Failed to delete image." };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  
  return { success: true };
}

export async function addProductImageAction(productId: string, imageUrl: string) {
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

  // 2. Insert Record
  const { error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: imageUrl,
      is_primary: false,
      display_order: 99,
    });

  if (error) {
    console.error("Failed to add image:", error);
    return { error: "Failed to add image." };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  
  return { success: true };
}
