"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/features/admin/actions/create-product";

export function ProductForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createProductAction(formData);
      if (result.error) {
        alert(result.error);
      } else {
        alert("Product created successfully!");
        router.push("/admin/products");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-serif font-semibold">Basic Details</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name *</label>
            <input required name="name" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. Oxford Shirt" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug *</label>
            <input required name="slug" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. oxford-shirt" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Price (in paise) *</label>
            <input required name="basePrice" type="number" min="0" className="w-full p-2 border rounded-md" placeholder="e.g. 299900" />
            <p className="text-xs text-muted-foreground">₹2,999.00 = 299900 paise</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <input name="brand" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. Crest Originals" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select name="categoryId" className="w-full p-2 border rounded-md">
            <option value="">Select a Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Short Description</label>
          <input required name="shortDescription" type="text" className="w-full p-2 border rounded-md" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Full Description</label>
          <textarea required name="description" rows={4} className="w-full p-2 border rounded-md" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-serif font-semibold">Variant & Inventory</h2>
        <p className="text-sm text-muted-foreground">We are creating one default variant to start. You can add more later.</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU *</label>
            <input required name="sku" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. OXF-WHT-M" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stock Quantity *</label>
            <input required name="stock" type="number" min="0" defaultValue="50" className="w-full p-2 border rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Size</label>
            <input name="size" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. M, L, XL" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <input name="color" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. White" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-serif font-semibold">Product Image</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Image *</label>
          <input required name="image" type="file" accept="image/*" className="w-full p-2 border rounded-md" />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
          Cancel
        </button>
        <button disabled={isPending} type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
          {isPending ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
