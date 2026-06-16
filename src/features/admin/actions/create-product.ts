"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
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
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const categoryId = formData.get("categoryId") as string;
  const brand = formData.get("brand") as string;
  const basePrice = parseInt(formData.get("basePrice") as string, 10);
  
  const sku = formData.get("sku") as string;
  const size = formData.get("size") as string;
  const color = formData.get("color") as string;
  const stock = parseInt(formData.get("stock") as string, 10);
  
  const file = formData.get("image") as File;

  if (!name || !slug || !basePrice || !file || file.size === 0) {
    return { error: "Missing required fields or image." };
  }

  // 3. Upload Image to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${slug}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: "Failed to upload image." };
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  // 4. Database Inserts
  // Insert Product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description,
      short_description: shortDescription,
      category_id: categoryId || null,
      brand,
      base_price: basePrice,
      is_active: true
    })
    .select("id")
    .single();

  if (productError || !product) {
    console.error("Product insert error:", productError);
    return { error: "Failed to create product." };
  }

  // Insert Image
  await supabase
    .from("product_images")
    .insert({
      product_id: product.id,
      url: publicUrl,
      alt_text: name,
      display_order: 1,
      is_primary: true
    });

  // Insert Variant
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: product.id,
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
  await supabase
    .from("inventory")
    .insert({
      variant_id: variant.id,
      quantity: stock
    });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  
  return { success: true };
}
