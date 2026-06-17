"use client";

import { useState, useTransition } from "react";
import { editVariantAction, deleteVariantAction } from "@/features/admin/actions/edit-variant";
import { Edit2, Trash2, X, Upload, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";

interface EditVariantModalProps {
  productId: string;
  variant: any;
  stock: number;
  existingImage?: string;
}

export function EditVariantModal({ productId, variant, stock, existingImage }: EditVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(existingImage || null);
  const [removedImage, setRemovedImage] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemovedImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemovedImage(true);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("productId", productId);
    formData.append("variantId", variant.id);

    setIsUploading(true);

    try {
      let finalImageUrl = "";

      // Handle Image Upload if there's a new file
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${productId}/${fileName}`; // Group by product ID

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);

        if (uploadError) throw new Error("Failed to upload image.");

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      if (finalImageUrl) formData.append("imageUrl", finalImageUrl);
      if (removedImage && !finalImageUrl) formData.append("removeImage", "true");

      startTransition(async () => {
        const result = await editVariantAction(formData);
        if (result.error) {
          alert(result.error);
        } else {
          setIsOpen(false);
        }
      });
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this variant?")) {
      startTransition(async () => {
        const result = await deleteVariantAction(variant.id, productId);
        if (result.error) alert(result.error);
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-serif font-semibold text-lg">Edit Variant</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">SKU *</label>
                <input required name="sku" defaultValue={variant.sku} type="text" className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Size</label>
                  <input name="size" defaultValue={variant.size || ""} type="text" className="w-full p-2 border rounded-md text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Color</label>
                  <input name="color" defaultValue={variant.color || ""} type="text" className="w-full p-2 border rounded-md text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Stock *</label>
                <input required name="stock" defaultValue={stock} type="number" min="0" className="w-full p-2 border rounded-md text-sm" />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium">Variant Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative h-20 w-20 border rounded-md overflow-hidden bg-muted shrink-0">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors shrink-0">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">Upload</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Link an image to this variant's color. Make sure the 'Color' field above is filled out so the image associates correctly.
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
                  Cancel
                </button>
                <button disabled={isPending || isUploading} type="submit" className="bg-primary flex items-center text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50">
                  {(isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {(isPending || isUploading) ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
