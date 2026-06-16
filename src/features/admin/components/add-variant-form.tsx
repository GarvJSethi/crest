"use client";

import { useTransition, useRef } from "react";
import { addVariantAction } from "@/features/admin/actions/add-variant";

export function AddVariantForm({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("productId", productId);

    startTransition(async () => {
      const result = await addVariantAction(formData);
      if (result.error) {
        alert(result.error);
      } else {
        alert("Variant added successfully!");
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <h3 className="font-serif font-semibold text-lg">Add New Variant</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium">SKU *</label>
          <input required name="sku" type="text" className="w-full p-2 border rounded-md text-sm" placeholder="e.g. TEE-WHT-L" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Size</label>
          <input name="size" type="text" className="w-full p-2 border rounded-md text-sm" placeholder="e.g. L" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Color</label>
          <input name="color" type="text" className="w-full p-2 border rounded-md text-sm" placeholder="e.g. White" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Stock *</label>
          <input required name="stock" type="number" min="0" defaultValue="10" className="w-full p-2 border rounded-md text-sm" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button disabled={isPending} type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50">
          {isPending ? "Adding..." : "+ Add Variant"}
        </button>
      </div>
    </form>
  );
}
