import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "./product-form";

export const metadata = {
  title: "Add Product | Admin",
};

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground mt-2">Create a new product, variant, and upload an image in one go.</p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  );
}
