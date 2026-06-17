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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [
        ...prev,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
      let uploadedUrls: string[] = [];

      // 1. Upload Images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${slug}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file);

          if (uploadError) throw new Error("Failed to upload image. Does the bucket exist?");

          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrlData.publicUrl);
        }
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

      // 3. Create Product Image Entries
      if (uploadedUrls.length > 0 && product) {
        const imageEntries = uploadedUrls.map((url, index) => ({
          product_id: product.id,
          url: url,
          is_primary: index === 0,
          display_order: index + 1,
        }));
        
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageEntries);

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
          <Label>Product Images</Label>
          <div className="flex flex-wrap items-center gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative h-32 w-32 border rounded-md overflow-hidden bg-muted shrink-0">
                <Image src={preview} alt={`Preview ${index}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors shrink-0">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </div>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
            </label>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            You can select multiple images. We recommend 4:5 aspect ratio images.<br/>
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
