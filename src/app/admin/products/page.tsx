import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Manage Products | Admin",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      brand,
      base_price,
      is_active,
      categories(name)
    `)
    .order("name", { ascending: true });

  if (error) {
    return <div>Error loading products.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your catalog, pricing, and inventory status.</p>
        </div>
        <Link href="/admin/products/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
          + Add Product
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Brand</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/products/${product.id}`} className="flex flex-col hover:underline">
                        <span className="font-medium text-foreground">{product.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{product.id.split("-")[0]}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {Array.isArray(product.categories) ? product.categories[0]?.name : (product.categories as any)?.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.brand || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(product.base_price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${product.is_active ? "bg-green-50 text-green-700 border border-green-200" : "bg-muted text-muted-foreground border"}
                      `}>
                        {product.is_active ? "Active" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
