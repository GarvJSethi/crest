import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddVariantForm } from "@/features/admin/components/add-variant-form";
import { EditVariantModal } from "@/features/admin/components/edit-variant-modal";

export const metadata = {
  title: "Product Details | Admin",
};

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      base_price,
      is_active,
      product_variants (
        id,
        sku,
        size,
        color,
        inventory (
          quantity
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return <div>Product not found or error loading.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 border rounded-md hover:bg-muted text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">{product.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-semibold text-lg border-b pb-2">Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatCurrency(product.base_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-medium">{product.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex px-2 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                  {product.is_active ? "Active" : "Draft"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-serif font-semibold text-lg">Variants ({product.product_variants?.length || 0})</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Size</th>
                  <th className="px-6 py-3 font-medium">Color</th>
                  <th className="px-6 py-3 font-medium text-right">Stock</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {product.product_variants?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No variants found.</td>
                  </tr>
                ) : (
                  product.product_variants?.map((variant: any) => {
                    const stock = Array.isArray(variant.inventory) 
                      ? variant.inventory[0]?.quantity 
                      : (variant.inventory as any)?.quantity || 0;
                      
                    return (
                      <tr key={variant.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs">{variant.sku}</td>
                        <td className="px-6 py-3">{variant.size || "-"}</td>
                        <td className="px-6 py-3">{variant.color || "-"}</td>
                        <td className="px-6 py-3 text-right font-medium">
                          <span className={stock <= 5 ? "text-red-500" : ""}>{stock}</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <EditVariantModal productId={product.id} variant={variant} stock={stock} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <AddVariantForm productId={product.id} />
        </div>
      </div>
    </div>
  );
}
