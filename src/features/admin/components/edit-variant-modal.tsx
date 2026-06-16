"use client";

import { useState, useTransition } from "react";
import { editVariantAction, deleteVariantAction } from "@/features/admin/actions/edit-variant";
import { Edit2, Trash2, X } from "lucide-react";

interface EditVariantModalProps {
  productId: string;
  variant: any;
  stock: number;
}

export function EditVariantModal({ productId, variant, stock }: EditVariantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("productId", productId);
    formData.append("variantId", variant.id);

    startTransition(async () => {
      const result = await editVariantAction(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setIsOpen(false);
      }
    });
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
              <div className="space-y-1">
                <label className="text-xs font-medium">Size</label>
                <input name="size" defaultValue={variant.size || ""} type="text" className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Color</label>
                <input name="color" defaultValue={variant.color || ""} type="text" className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Stock *</label>
                <input required name="stock" defaultValue={stock} type="number" min="0" className="w-full p-2 border rounded-md text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
                  Cancel
                </button>
                <button disabled={isPending} type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50">
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
