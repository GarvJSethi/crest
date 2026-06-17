"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

export function ProductForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const basePrice = parseInt(formData.get("basePrice") as string, 10) * 100; // Convert to paise
    const description = formData.get("description") as string;

    try {
      let imageUrl = null;

      // 1. Upload Image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${slug}/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);

        if (uploadError) throw new Error("Failed to upload image. Does the bucket exist?");

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Create Product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          slug,
          description,
          base_price: basePrice,
          currency: "INR",
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // 3. Create Product Image Entry
      if (imageUrl && product) {
        const { error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            url: imageUrl,
            is_primary: true,
            display_order: 1,
          });

        if (imageError) throw imageError;
      }

      toast.success("Product created successfully!");
      router.push("/admin/products");
      router.refresh();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-card p-6 rounded-xl border">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" placeholder="e.g. Premium Oxford Shirt" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="basePrice">Price (INR)</Label>
          <Input id="basePrice" name="basePrice" type="number" min="0" placeholder="e.g. 1999" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Product details..." rows={4} />
        </div>

        <div className="grid gap-2">
          <Label>Product Image</Label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative h-32 w-32 border rounded-md overflow-hidden bg-muted">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
            <div className="text-sm text-muted-foreground">
              We recommend 4:5 aspect ratio images.<br/>
              Requires "product-images" bucket in Supabase.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Product
        </Button>
      </div>
    </form>
  );
}
