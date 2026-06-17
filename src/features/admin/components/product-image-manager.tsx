"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { addProductImageAction, deleteProductImageAction } from "@/features/admin/actions/product-images";

interface ProductImageManagerProps {
  productId: string;
  images: any[];
}

export function ProductImageManager({ productId, images }: ProductImageManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDelete = (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      startTransition(async () => {
        const result = await deleteProductImageAction(imageId, productId);
        if (result.error) alert(result.error);
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsUploading(true);
      
      try {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${productId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, file);

          if (uploadError) throw new Error("Failed to upload image.");

          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

          const result = await addProductImageAction(productId, publicUrlData.publicUrl);
          if (result.error) throw new Error(result.error);
        }
      } catch (err: any) {
        alert(err.message || "An error occurred during upload.");
      } finally {
        setIsUploading(false);
        // Reset input so the same file can be selected again if needed
        e.target.value = '';
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-serif font-semibold text-lg">Product Images</h3>
        {(isPending || isUploading) && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {images?.map((img) => (
          <div key={img.id} className="relative aspect-[4/5] bg-muted rounded-md overflow-hidden group border">
            <Image src={img.url} alt="Product Image" fill className="object-cover" />
            <button
              onClick={() => handleDelete(img.id)}
              disabled={isPending || isUploading}
              className="absolute top-1 right-1 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 disabled:opacity-50"
              title="Delete Image"
            >
              <X className="w-4 h-4" />
            </button>
            {img.color_variant && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                {img.color_variant}
              </div>
            )}
          </div>
        ))}
        
        <label className="flex flex-col items-center justify-center aspect-[4/5] border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center px-2">Upload Photos</span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleImageChange}
            disabled={isPending || isUploading}
          />
        </label>
      </div>
    </div>
  );
}
